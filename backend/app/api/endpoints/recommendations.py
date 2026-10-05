from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import crud, models
from app.schemas.recommendations import RecommendationResponse
from app.services.auth import PermissionChecker

router = APIRouter()

@router.get("", response_model=List[RecommendationResponse])
def get_recommendations(
    db: Session = Depends(get_db),
    current_user = Depends(PermissionChecker("view_analytics"))
):
    db_recs = crud.get_recommendations(db)
    return [
        RecommendationResponse(
            id=rec.id,
            title=rec.title,
            ward=rec.ward.name if rec.ward else "Unknown Ward",
            score=rec.score,
            budget=rec.budget,
            impact=rec.impact,
            completion_time=rec.completion_time,
            risk_level=rec.risk_level,
            ai_reasoning=rec.ai_reasoning
        )
        for rec in db_recs
    ]

@router.get("/{rec_id}", response_model=RecommendationResponse)
def get_recommendation_by_id(
    rec_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(PermissionChecker("view_analytics"))
):
    rec = db.query(models.Recommendation).filter(models.Recommendation.id == rec_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    return RecommendationResponse(
        id=rec.id,
        title=rec.title,
        ward=rec.ward.name if rec.ward else "Unknown Ward",
        score=rec.score,
        budget=rec.budget,
        impact=rec.impact,
        completion_time=rec.completion_time,
        risk_level=rec.risk_level,
        ai_reasoning=rec.ai_reasoning
    )

