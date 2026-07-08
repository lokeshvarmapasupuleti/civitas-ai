from pydantic import BaseModel
from typing import List, Dict, Any, Optional

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
    
    # New computed analytics fields
    daily_trends: Optional[List[Dict[str, Any]]] = None
    weekly_trends: Optional[List[Dict[str, Any]]] = None
    monthly_trends: Optional[List[Dict[str, Any]]] = None
    complaint_growth: Optional[float] = None
    resolution_rate: Optional[float] = None
    department_efficiency: Optional[List[Dict[str, Any]]] = None
    ward_performance: Optional[List[Dict[str, Any]]] = None
    sla_compliance: Optional[float] = None
    ai_confidence_analytics: Optional[Dict[str, Any]] = None
    budget_utilization: Optional[Dict[str, Any]] = None
