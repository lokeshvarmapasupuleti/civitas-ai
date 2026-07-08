import pytest
import tempfile
import os
from app.services.audit.models import AuditRecord, AuditSearchQuery
from app.services.audit.service import AuditService

def test_audit_logging_and_search():
    fd, temp_db = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    
    try:
        service = AuditService(db_path=temp_db)
        
        record1 = AuditRecord(
            username="officer_rajesh",
            role="Ward Officer",
            department="PWD",
            ip_address="192.168.1.100",
            action="Approved Work Order",
            old_value="Pending",
            new_value="Approved",
            reason="Road erosion verified on site inspection"
        )
        
        record2 = AuditRecord(
            username="citizen_lokesh",
            role="Citizen",
            department=None,
            ip_address="10.0.0.2",
            action="Submitted Grievance",
            old_value=None,
            new_value="Submitted",
            reason="Potholes on school road segment"
        )
        
        # 1. Log actions
        id1 = service.log_action(record1)
        id2 = service.log_action(record2)
        
        assert id1 > 0
        assert id2 > id1
        
        # 2. Test search with no filters (should return both)
        all_records = service.search_records(AuditSearchQuery(limit=10))
        assert len(all_records) == 2
        
        # 3. Test filter by username
        rajesh_logs = service.search_records(AuditSearchQuery(username="officer_rajesh"))
        assert len(rajesh_logs) == 1
        assert rajesh_logs[0].action == "Approved Work Order"
        assert rajesh_logs[0].reason == "Road erosion verified on site inspection"
        
        # 4. Test filter by role
        citizen_logs = service.search_records(AuditSearchQuery(role="Citizen"))
        assert len(citizen_logs) == 1
        assert citizen_logs[0].username == "citizen_lokesh"
        
        # 5. Test filter by action keyword
        work_order_logs = service.search_records(AuditSearchQuery(action="Work Order"))
        assert len(work_order_logs) == 1
        assert work_order_logs[0].username == "officer_rajesh"
        
        # 6. Test timeline generation
        timeline = service.generate_timeline(username="officer_rajesh")
        assert len(timeline) == 1
        assert timeline[0].action == "Approved Work Order"
        assert timeline[0].role == "Ward Officer"
        assert "Pending" in timeline[0].details
        
        # 7. Test CSV export
        csv_str = service.export_records_csv(AuditSearchQuery(limit=10))
        assert "officer_rajesh" in csv_str
        assert "citizen_lokesh" in csv_str
        assert "IP Address" in csv_str  # Header check
        
    finally:
        if os.path.exists(temp_db):
            os.remove(temp_db)
