from pydantic import BaseModel
from typing import Dict, Any, List

class AssistantQuery(BaseModel):
    query: str

class AssistantResponse(BaseModel):
    answer: str
    query_type: str
    confidence: float
    data: Dict[str, Any]
    suggested_followups: List[str]
