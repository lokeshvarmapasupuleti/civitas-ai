from enum import Enum
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class NotificationChannel(str, Enum):
    IN_APP = "in_app"
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    GOV_ALERT = "gov_alert"

class NotificationType(str, Enum):
    CRITICAL_GRIEVANCE = "critical_grievance"
    OFFICER_ASSIGNED = "officer_assigned"
    SLA_REMINDER = "sla_reminder"
    ESCALATION = "escalation"
    RESOLUTION_COMPLETED = "resolution_completed"
    CITIZEN_FEEDBACK = "citizen_feedback"

class NotificationRequest(BaseModel):
    recipient_id: str = Field(..., description="Target citizen or officer ID")
    recipient_contact: str = Field(..., description="Email, phone, or token coordinate")
    channel: NotificationChannel = Field(..., description="Target transmission channel")
    notification_type: NotificationType = Field(..., description="Template type trigger")
    template_data: Dict[str, Any] = Field(default_factory=dict, description="Variables to format the message templates")

class NotificationHistoryItem(BaseModel):
    id: int = Field(..., description="Unique notification log primary key")
    recipient_id: str = Field(..., description="Target recipient ID")
    recipient_contact: str = Field(..., description="Email, phone, or token coordinate")
    channel: str = Field(..., description="Transmission channel used")
    notification_type: str = Field(..., description="Template type used")
    subject: str = Field(..., description="Rendered notification subject line")
    body: str = Field(..., description="Rendered notification message body")
    sent_at: str = Field(..., description="Timestamp of transmission")
    status: str = Field(..., description="Result status (e.g. Sent, Failed)")
