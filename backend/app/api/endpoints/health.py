from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.monitoring import MonitoringService, ObservabilityMetrics, SystemStatusResponse, MetricsSummary

router = APIRouter()

@router.get("/health", response_model=SystemStatusResponse)
def get_health(db: Session = Depends(get_db)):
    status = MonitoringService.run_health_checks(db)
    return status

@router.get("/metrics", response_model=MetricsSummary)
def get_metrics():
    metrics = ObservabilityMetrics()
    return metrics.get_summary()

@router.get("/system/status", response_model=SystemStatusResponse)
def get_system_status(db: Session = Depends(get_db)):
    status = MonitoringService.run_health_checks(db)
    return status
