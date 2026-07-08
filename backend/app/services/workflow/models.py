from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field

class WorkflowState(str, Enum):
    SUBMITTED = "Submitted"
    AI_PROCESSING = "AI Processing"
    OFFICER_ASSIGNED = "Officer Assigned"
    INSPECTION_SCHEDULED = "Inspection Scheduled"
    INSPECTION_COMPLETED = "Inspection Completed"
    WORK_ORDER_CREATED = "Work Order Created"
    DEPARTMENT_PROCESSING = "Department Processing"
    COMPLETED = "Completed"
    CITIZEN_FEEDBACK = "Citizen Feedback"
    ARCHIVED = "Archived"

class WorkflowInstance(BaseModel):
    grievance_id: str = Field(..., description="Unique grievance tracking reference ID")
    current_state: WorkflowState = Field(..., description="Current operational state of the grievance")
    assigned_officer: Optional[str] = Field(None, description="Assigned resolving officer name")
    assigned_department: Optional[str] = Field(None, description="Routed municipal department name")
    sla_deadline: Optional[str] = Field(None, description="SLA target milestone timestamp")
    escalation_level: int = Field(0, description="Escalation severity level (0 = None, 1 = Escalated, 2 = Commissioner Desk)")
    created_at: str = Field(..., description="Timestamp when the grievance was entered")

class WorkflowAuditLogItem(BaseModel):
    id: int = Field(..., description="Unique audit log primary key")
    grievance_id: str = Field(..., description="Unique grievance tracking reference ID")
    from_state: str = Field(..., description="State before transition")
    to_state: str = Field(..., description="State after transition")
    triggered_by: str = Field(..., description="Role or actor triggering the transition")
    timestamp: str = Field(..., description="Transition execution timestamp")
    comment: Optional[str] = Field(None, description="Operational notes/comments")
    officer: Optional[str] = Field(None, description="Assigned officer at time of transition")
    department: Optional[str] = Field(None, description="Assigned department at time of transition")
