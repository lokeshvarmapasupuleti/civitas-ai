import os
import sqlite3
import logging
from datetime import datetime
from typing import List, Optional

from app.services.notifications.models import (
    NotificationRequest,
    NotificationHistoryItem,
    NotificationChannel,
    NotificationType
)
from app.services.notifications.providers import (
    InAppNotificationProvider,
    EmailNotificationProvider,
    SMSNotificationProvider,
    PushNotificationProvider,
    GovAlertNotificationProvider
)
from app.services.notifications.templates import TemplateEngine

logger = logging.getLogger("services.notifications.service")

class NotificationService:
    def __init__(self, db_path: str = None):
        # Place notifications.db in the module folder
        if db_path is None:
            module_dir = os.path.dirname(os.path.abspath(__file__))
            db_path = os.path.join(module_dir, "notifications.db")
            
        self.db_path = db_path
        self.template_engine = TemplateEngine()
        
        # Instantiate providers
        self.providers = {
            NotificationChannel.IN_APP: InAppNotificationProvider(),
            NotificationChannel.EMAIL: EmailNotificationProvider(),
            NotificationChannel.SMS: SMSNotificationProvider(),
            NotificationChannel.PUSH: PushNotificationProvider(),
            NotificationChannel.GOV_ALERT: GovAlertNotificationProvider()
        }
        
        # Initialize SQLite database
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS notification_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    recipient_id TEXT NOT NULL,
                    recipient_contact TEXT NOT NULL,
                    channel TEXT NOT NULL,
                    notification_type TEXT NOT NULL,
                    subject TEXT NOT NULL,
                    body TEXT NOT NULL,
                    sent_at TEXT NOT NULL,
                    status TEXT NOT NULL
                )
            """)
            conn.commit()
        finally:
            conn.close()

    def send_notification(self, request: NotificationRequest) -> bool:
        # 1. Render template subject and body
        subject, body = self.template_engine.render(request.notification_type, request.template_data)
        
        # 2. Get provider
        provider = self.providers.get(request.channel)
        if not provider:
            logger.error(f"Notification channel provider not found: {request.channel}")
            self._log_history(request, subject, body, "Failed (No Provider)")
            return False
            
        # 3. Dispatch transmission
        success = False
        try:
            success = provider.send(request.recipient_contact, subject, body)
            status = "Sent" if success else "Failed"
        except Exception as e:
            logger.exception(f"Failed to dispatch notification via channel: {request.channel}")
            status = f"Failed ({str(e)})"
            
        # 4. Log transaction in local history database
        self._log_history(request, subject, body, status)
        return success

    def _log_history(self, request: NotificationRequest, subject: str, body: str, status: str):
        conn = sqlite3.connect(self.db_path)
        try:
            cursor = conn.cursor()
            sent_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
            cursor.execute("""
                INSERT INTO notification_history (
                    recipient_id, recipient_contact, channel, notification_type, subject, body, sent_at, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                request.recipient_id,
                request.recipient_contact,
                request.channel.value,
                request.notification_type.value,
                subject,
                body,
                sent_at,
                status
            ))
            conn.commit()
        finally:
            conn.close()

    def get_history(self, recipient_id: Optional[str] = None, limit: int = 100) -> List[NotificationHistoryItem]:
        conn = sqlite3.connect(self.db_path)
        history = []
        try:
            cursor = conn.cursor()
            if recipient_id:
                cursor.execute("""
                    SELECT id, recipient_id, recipient_contact, channel, notification_type, subject, body, sent_at, status
                    FROM notification_history
                    WHERE recipient_id = ?
                    ORDER BY id DESC
                    LIMIT ?
                """, (recipient_id, limit))
            else:
                cursor.execute("""
                    SELECT id, recipient_id, recipient_contact, channel, notification_type, subject, body, sent_at, status
                    FROM notification_history
                    ORDER BY id DESC
                    LIMIT ?
                """, (limit,))
                
            rows = cursor.fetchall()
            for row in rows:
                history.append(NotificationHistoryItem(
                    id=row[0],
                    recipient_id=row[1],
                    recipient_contact=row[2],
                    channel=row[3],
                    notification_type=row[4],
                    subject=row[5],
                    body=row[6],
                    sent_at=row[7],
                    status=row[8]
                ))
        finally:
            conn.close()
            
        return history

    def clear_history(self):
        conn = sqlite3.connect(self.db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM notification_history")
            conn.commit()
        finally:
            conn.close()
