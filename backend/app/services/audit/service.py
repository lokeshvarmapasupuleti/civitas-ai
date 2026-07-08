import os
import sqlite3
import csv
import io
import logging
from datetime import datetime
from typing import List, Optional

from app.services.audit.models import (
    AuditRecord,
    AuditSearchQuery,
    AuditTimelineEvent
)

logger = logging.getLogger("services.audit.service")

class AuditService:
    def __init__(self, db_path: str = None):
        # Set database path in local module folder
        if db_path is None:
            module_dir = os.path.dirname(os.path.abspath(__file__))
            db_path = os.path.join(module_dir, "audit.db")
            
        self.db_path = db_path
        
        # Initialize SQLite database
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS audit_records (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    username TEXT NOT NULL,
                    role TEXT NOT NULL,
                    department TEXT,
                    ip_address TEXT NOT NULL,
                    action TEXT NOT NULL,
                    old_value TEXT,
                    new_value TEXT,
                    reason TEXT
                )
            """)
            conn.commit()
        finally:
            conn.close()

    def log_action(self, record: AuditRecord) -> int:
        conn = sqlite3.connect(self.db_path)
        try:
            cursor = conn.cursor()
            timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
            cursor.execute("""
                INSERT INTO audit_records (
                    timestamp, username, role, department, ip_address, action, old_value, new_value, reason
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                timestamp,
                record.username,
                record.role,
                record.department,
                record.ip_address,
                record.action,
                record.old_value,
                record.new_value,
                record.reason
            ))
            conn.commit()
            last_id = cursor.lastrowid
            logger.info(f"[Audit Log] Recorded action '{record.action}' (ID: {last_id}) by user '{record.username}'")
            return last_id
        finally:
            conn.close()

    def search_records(self, query: AuditSearchQuery) -> List[AuditRecord]:
        conn = sqlite3.connect(self.db_path)
        records = []
        try:
            cursor = conn.cursor()
            
            # Dynamic query building
            sql = "SELECT id, timestamp, username, role, department, ip_address, action, old_value, new_value, reason FROM audit_records WHERE 1=1"
            params = []
            
            if query.username:
                sql += " AND username = ?"
                params.append(query.username)
            if query.role:
                sql += " AND role = ?"
                params.append(query.role)
            if query.department:
                sql += " AND department = ?"
                params.append(query.department)
            if query.action:
                sql += " AND action LIKE ?"
                params.append(f"%{query.action}%")
            if query.start_time:
                sql += " AND timestamp >= ?"
                params.append(query.start_time)
            if query.end_time:
                sql += " AND timestamp <= ?"
                params.append(query.end_time)
                
            sql += " ORDER BY id DESC LIMIT ?"
            params.append(query.limit)
            
            cursor.execute(sql, params)
            rows = cursor.fetchall()
            for row in rows:
                records.append(AuditRecord(
                    id=row[0],
                    timestamp=row[1],
                    username=row[2],
                    role=row[3],
                    department=row[4],
                    ip_address=row[5],
                    action=row[6],
                    old_value=row[7],
                    new_value=row[8],
                    reason=row[9]
                ))
        finally:
            conn.close()
            
        return records

    def generate_timeline(self, username: Optional[str] = None) -> List[AuditTimelineEvent]:
        # Search records to format into chronological events list
        query = AuditSearchQuery(username=username, limit=100)
        records = self.search_records(query)
        
        # Sort in ascending order for timeline view
        records.reverse()
        
        events = []
        for r in records:
            details = f"IP: {r.ip_address}"
            if r.old_value or r.new_value:
                details += f" | Transition: '{r.old_value}' -> '{r.new_value}'"
                
            events.append(AuditTimelineEvent(
                timestamp=r.timestamp,
                action=r.action,
                username=r.username,
                role=r.role,
                reason=r.reason or "No justification note provided.",
                details=details
            ))
        return events

    def export_records_csv(self, query: AuditSearchQuery) -> str:
        records = self.search_records(query)
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write headers
        writer.writerow(["ID", "Timestamp", "Username", "Role", "Department", "IP Address", "Action", "Old Value", "New Value", "Reason"])
        
        # Write rows
        for r in records:
            writer.writerow([
                r.id,
                r.timestamp,
                r.username,
                r.role,
                r.department or "",
                r.ip_address,
                r.action,
                r.old_value or "",
                r.new_value or "",
                r.reason or ""
            ])
            
        return output.getvalue()

    def clear_records(self):
        conn = sqlite3.connect(self.db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM audit_records")
            conn.commit()
        finally:
            conn.close()
