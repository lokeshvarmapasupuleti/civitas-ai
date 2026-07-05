from pydantic import BaseModel
from typing import Dict, Any, Optional

class PriorityBreakdown(BaseModel):
    citizen_frequency: int
    urgency: int
    population_affected: int
    infrastructure_gap: int
    cost_penalty: int
    strategic_importance: int

class PriorityResponse(BaseModel):
    priority_score: int
    breakdown: PriorityBreakdown
    reason: str
    confidence: float

class PipelineResponse(BaseModel):
    submission_id: str
    detected_language: str
    english_translation: str
    category: str
    sentiment: str
    urgency_score: float
    cluster_name: str
    cluster_id: Optional[int] = None
    summary: str
    priority: PriorityResponse
    metadata: Dict[str, Any]
