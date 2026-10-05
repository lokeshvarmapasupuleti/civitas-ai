from pydantic import BaseModel
from typing import Optional

class RecommendationResponse(BaseModel):
    id: Optional[int] = None
    title: str
    ward: str
    score: int
    budget: str
    impact: str
    completion_time: str
    risk_level: str
    ai_reasoning: str

