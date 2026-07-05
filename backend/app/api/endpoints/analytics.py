from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import crud
from app.schemas.analytics import AnalyticsResponse

router = APIRouter()

@router.get("", response_model=AnalyticsResponse)
def get_analytics(db: Session = Depends(get_db)):
    data = crud.get_analytics_data(db)
    return data
