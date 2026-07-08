import pytest
import tempfile
import os
from app.services.workflow.models import WorkflowState
from app.services.workflow.state_machine import WorkflowStateMachine
from app.services.workflow.service import WorkflowService

def test_state_machine_transitions():
    sm = WorkflowStateMachine()
    
    # Valid transitions
    assert sm.is_valid_transition(WorkflowState.SUBMITTED, WorkflowState.AI_PROCESSING) is True
    assert sm.is_valid_transition(WorkflowState.COMPLETED, WorkflowState.CITIZEN_FEEDBACK) is True
    assert sm.is_valid_transition(WorkflowState.COMPLETED, WorkflowState.ARCHIVED) is True
    
    # Invalid transitions
    assert sm.is_valid_transition(WorkflowState.SUBMITTED, WorkflowState.ARCHIVED) is False
    assert sm.is_valid_transition(WorkflowState.ARCHIVED, WorkflowState.SUBMITTED) is False
    assert sm.is_valid_transition(WorkflowState.SUBMITTED, WorkflowState.SUBMITTED) is False

def test_workflow_engine_lifecycle():
    fd, temp_db = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    
    try:
        service = WorkflowService(db_path=temp_db)
        grievance_id = "CIV-WFLOW-1"
        
        # 1. Create instance
        inst = service.create_instance(grievance_id, "PWD")
        assert inst.grievance_id == grievance_id
        assert inst.current_state == WorkflowState.SUBMITTED
        assert inst.assigned_department == "PWD"
        assert inst.escalation_level == 0
        
        # Verify duplicate throws ValueError
        with pytest.raises(ValueError):
            service.create_instance(grievance_id)
            
        # 2. Make a valid transition (Submitted -> AI Processing)
        assert service.transition_state(
            grievance_id, 
            WorkflowState.AI_PROCESSING, 
            triggered_by="System", 
            comment="Automatic AI Pipeline parsing"
        ) is True
        
        # Verify current state updated
        updated_inst = service.get_instance(grievance_id)
        assert updated_inst.current_state == WorkflowState.AI_PROCESSING
        
        # 3. Try an invalid transition (AI Processing -> Completed)
        with pytest.raises(ValueError):
            service.transition_state(
                grievance_id,
                WorkflowState.COMPLETED,
                triggered_by="Officer"
            )
            
        # State should remain AI Processing
        assert service.get_instance(grievance_id).current_state == WorkflowState.AI_PROCESSING
        
        # 4. Perform officer routing (AI Processing -> Officer Assigned)
        assert service.transition_state(
            grievance_id,
            WorkflowState.OFFICER_ASSIGNED,
            triggered_by="Orchestrator",
            officer="Er. Rajesh Kumar",
            comment="Routed to Public Works Department"
        ) is True
        
        # 5. Escalate Grievance
        assert service.escalate_grievance(grievance_id, "No action in 24 hours") is True
        assert service.get_instance(grievance_id).escalation_level == 1
        
        # 6. Retrieve Audit log history
        history = service.get_history(grievance_id)
        
        # Initial submission, transition to AI, transition to Officer, escalation log
        assert len(history) == 4
        
        # Check transition details
        assert history[0].to_state == "Submitted"
        assert history[1].to_state == "AI Processing"
        assert history[2].to_state == "Officer Assigned"
        assert history[2].officer == "Er. Rajesh Kumar"
        assert "Escalation Level raised to 1" in history[3].comment
        
    finally:
        if os.path.exists(temp_db):
            os.remove(temp_db)
