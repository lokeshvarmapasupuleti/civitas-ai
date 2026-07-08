import pytest
from app.services.notifications.models import (
    NotificationChannel,
    NotificationType,
    NotificationRequest
)
from app.services.notifications.templates import TemplateEngine
from app.services.notifications.service import NotificationService

def test_template_rendering():
    engine = TemplateEngine()
    
    # Test officer assigned template
    subject, body = engine.render(
        NotificationType.OFFICER_ASSIGNED,
        {
            "ref_id": "CIV-9901",
            "officer_name": "Er. Rajesh Kumar",
            "category": "Road Repair",
            "ward": "Ward 12",
            "sla": "24 Hours"
        }
    )
    
    assert "CIV-9901" in subject
    assert "Er. Rajesh Kumar" in body
    assert "Road Repair" in body
    assert "Ward 12" in body
    assert "24 Hours" in body

def test_notification_delivery_and_history():
    # Use a temporary SQLite database for testing
    import tempfile
    import os
    
    fd, temp_db = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    
    try:
        service = NotificationService(db_path=temp_db)
        
        request = NotificationRequest(
            recipient_id="OFFICER-007",
            recipient_contact="officer@civitas.gov.in",
            channel=NotificationChannel.EMAIL,
            notification_type=NotificationType.OFFICER_ASSIGNED,
            template_data={
                "ref_id": "CIV-1234",
                "officer_name": "Dr. Amit Sharma",
                "category": "Sanitation",
                "ward": "Ward 4",
                "sla": "48 Hours"
            }
        )
        
        # Verify send returns True
        assert service.send_notification(request) is True
        
        # Verify history log transaction
        history = service.get_history(recipient_id="OFFICER-007")
        assert len(history) == 1
        
        item = history[0]
        assert item.recipient_id == "OFFICER-007"
        assert item.recipient_contact == "officer@civitas.gov.in"
        assert item.channel == "email"
        assert item.notification_type == "officer_assigned"
        assert "CIV-1234" in item.subject
        assert "Dr. Amit Sharma" in item.body
        assert item.status == "Sent"
        assert item.sent_at is not None
        
        # Verify retrieving general history without filter
        all_history = service.get_history()
        assert len(all_history) == 1
        
        # Verify clearing history
        service.clear_history()
        assert len(service.get_history()) == 0
        
    finally:
        if os.path.exists(temp_db):
            os.remove(temp_db)
