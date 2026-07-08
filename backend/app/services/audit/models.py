from typing import Optional, List
from pydantic import BaseModel, Field

class AuditRecord(BaseModel):
    id: Optional[int] = Field(None, description="Unique audit log primary key")
    timestamp: Optional[str] = Field(None, description="Timestamp of the auditable transaction")
    username: str = Field(..., description="The user executing the transaction")
    role: str = Field(..., description="The municipal role of the user (e.g. Citizen, Ward Officer)")
    department: Optional[str] = Field(None, description="Assigned department of the user")
    ip_address: str = Field(..., description="IPv4 or IPv6 coordinates of the request client")
    action: str = Field(..., description="The administrative action executed")
    old_value: Optional[str] = Field(None, description="Serialized state before the transaction")
    new_value: Optional[str] = Field(None, description="Serialized state after the transaction")
    reason: Optional[str] = Field(None, description="Operational justification notes")

class AuditSearchQuery(BaseModel):
    username: Optional[str] = Field(None, description="Filter by transaction username")
    role: Optional[str] = Field(None, description="Filter by municipal role")
    department: Optional[str] = Field(None, description="Filter by division")
    action: Optional[str] = Field(None, description="Filter by operational action keyword")
    start_time: Optional[str] = Field(None, description="Start date filter (YYYY-MM-DD)")
    end_time: Optional[str] = Field(None, description="End date filter (YYYY-MM-DD)")
    limit: int = Field(100, description="Log records limit")

class AuditTimelineEvent(BaseModel):
    timestamp: str
    action: str
    username: str
    role: str
    reason: str
    details: str
