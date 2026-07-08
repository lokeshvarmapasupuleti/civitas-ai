from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud
from app.schemas.analytics import AnalyticsResponse
from app.services.auth import PermissionChecker

router = APIRouter()

@router.get("", response_model=AnalyticsResponse)
def get_analytics(
    db: Session = Depends(get_db),
    current_user = Depends(PermissionChecker("view_analytics"))
):
    data = crud.get_analytics_data(db)
    return data
