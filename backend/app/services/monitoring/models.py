from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field

class DependencyStatus(BaseModel):
    name: str
    status: str  # "Healthy" or "Unhealthy"
    latency_ms: float
    details: Optional[str] = None

class SystemStatusResponse(BaseModel):
    status: str  # "Healthy", "Degraded", or "Unhealthy"
    timestamp: str
    cpu_percent: float
    memory_percent: float
    disk_percent: float
    dependencies: List[DependencyStatus]

class MetricsSummary(BaseModel):
    total_api_requests: int
    total_errors: int
    error_rate_percent: float
    avg_api_latency_ms: float
    avg_ai_latency_ms: float
    avg_db_latency_ms: float
    cache_hit_rate_percent: float
    active_queue_length: int
