from pydantic import BaseModel
from typing import List

class HotspotResponse(BaseModel):
    name: str
    position: List[float]
    requests: int
    color: str

class MonthlyRequestStat(BaseModel):
    month: str
    requests: int
    is_current: bool = False

class KpisResponse(BaseModel):
    citizen_requests: int
    ai_recommendations: int
    demand_hotspots: int
    pending_reviews: int

class AnalyticsResponse(BaseModel):
    hotspots: List[HotspotResponse]
    stats: List[MonthlyRequestStat]
    trend_description: str
    kpis: KpisResponse
