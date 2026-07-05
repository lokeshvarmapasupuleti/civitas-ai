from pydantic import BaseModel

class RecommendationResponse(BaseModel):
    title: str
    ward: str
    score: int
    budget: str
    impact: str
    completion_time: str
    risk_level: str
    ai_reasoning: str
