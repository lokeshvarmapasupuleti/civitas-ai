from typing import List, Dict
from app.services.workflow.models import WorkflowState

# Sequential workflow path validation mappings
VALID_TRANSITIONS: Dict[WorkflowState, List[WorkflowState]] = {
    WorkflowState.SUBMITTED: [WorkflowState.AI_PROCESSING],
    WorkflowState.AI_PROCESSING: [WorkflowState.OFFICER_ASSIGNED],
    WorkflowState.OFFICER_ASSIGNED: [WorkflowState.INSPECTION_SCHEDULED],
    WorkflowState.INSPECTION_SCHEDULED: [WorkflowState.INSPECTION_COMPLETED],
    WorkflowState.INSPECTION_COMPLETED: [WorkflowState.WORK_ORDER_CREATED],
    WorkflowState.WORK_ORDER_CREATED: [WorkflowState.DEPARTMENT_PROCESSING],
    WorkflowState.DEPARTMENT_PROCESSING: [WorkflowState.COMPLETED],
    WorkflowState.COMPLETED: [WorkflowState.CITIZEN_FEEDBACK, WorkflowState.ARCHIVED], # Allow feedback skip
    WorkflowState.CITIZEN_FEEDBACK: [WorkflowState.ARCHIVED],
    WorkflowState.ARCHIVED: [] # Terminal state
}

class WorkflowStateMachine:
    def is_valid_transition(self, from_state: WorkflowState, to_state: WorkflowState) -> bool:
        # Same state transition is not allowed
        if from_state == to_state:
            return False
            
        allowed = VALID_TRANSITIONS.get(from_state, [])
        return to_state in allowed
