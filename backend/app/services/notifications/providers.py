import logging
from abc import ABC, abstractmethod

logger = logging.getLogger("services.notifications.providers")

class BaseNotificationProvider(ABC):
    @abstractmethod
    def send(self, recipient_contact: str, subject: str, body: str) -> bool:
        pass

class InAppNotificationProvider(BaseNotificationProvider):
    def send(self, recipient_contact: str, subject: str, body: str) -> bool:
        logger.info(f"[In-App Notification] Sent to {recipient_contact} | Subject: {subject} | Body: {body[:60]}...")
        return True

class EmailNotificationProvider(BaseNotificationProvider):
    def send(self, recipient_contact: str, subject: str, body: str) -> bool:
        # Under the hood, this would utilize smtplib or Amazon SES Client
        logger.info(f"[Email Notification] Dispatched to {recipient_contact} | Subject: {subject} | Body: {body[:60]}...")
        return True

class SMSNotificationProvider(BaseNotificationProvider):
    def send(self, recipient_contact: str, subject: str, body: str) -> bool:
        # Under the hood, this would call Twilio or CDAC Mobile Seva Gateway APIs
        logger.info(f"[SMS Notification] Sent SMS to {recipient_contact} | Body: {body[:60]}...")
        return True

class PushNotificationProvider(BaseNotificationProvider):
    def send(self, recipient_contact: str, subject: str, body: str) -> bool:
        # Under the hood, this would call Firebase Cloud Messaging (FCM) or APNS
        logger.info(f"[Push Notification] Dispatched FCM push to {recipient_contact} | Subject: {subject}")
        return True

class GovAlertNotificationProvider(BaseNotificationProvider):
    def send(self, recipient_contact: str, subject: str, body: str) -> bool:
        # Under the hood, this would publish to NDMA Common Alerting Protocol (CAP) feed
        logger.info(f"[Gov Alert Notification] Dispatched critical NIC-CAP feed alert | Subject: {subject}")
        return True
