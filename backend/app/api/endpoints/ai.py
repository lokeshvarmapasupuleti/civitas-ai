from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.schemas.ai import PipelineResponse, PriorityResponse, PriorityBreakdown
from app.ai_pipeline import AIPipeline
from app.services.auth import PermissionChecker

router = APIRouter()

@router.post("/process/{submission_id}", response_model=PipelineResponse)
def process_submission(
    submission_id: str, 
    db: Session = Depends(get_db),
    current_user = Depends(PermissionChecker("view_ward_grievances"))
):
    # 1. Load the submission
    submission = db.query(models.CitizenSubmission).filter(models.CitizenSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Citizen submission with ID {submission_id} not found"
        )
        
    # 2. Run the AI pipeline
    pipeline = AIPipeline()
    result = pipeline.process(db, submission)
    
    # 3. Store the results in the database
    submission.category = result["category"]
    submission.sentiment = result["sentiment"]
    
    analysis = db.query(models.AIAnalysis).filter(models.AIAnalysis.submission_id == submission_id).first()
    
    priority_res = result["priority"]
    breakdown_data = priority_res["breakdown"]
    
    # Store full breakdown inside priority_breakdown JSONB column
    priority_breakdown = {
        "breakdown": breakdown_data,
        "reason": priority_res["reason"],
        "confidence": priority_res["confidence"]
    }
    
    if not analysis:
        analysis = models.AIAnalysis(
            submission_id=submission_id,
            summary=result["summary"],
            extracted_needs=[result["category"].lower(), "pipeline_run"],
            confidence_score=priority_res["confidence"],
            urgency_score=result["urgency_score"],
            detected_language=result["detected_language"],
            english_translation=result["english_translation"],
            priority_score=float(priority_res["priority_score"]),
            priority_breakdown=priority_breakdown,
            cluster_id=result["cluster_id"],
            assistant_metadata=result["metadata"]
        )
        db.add(analysis)
    else:
        analysis.summary = result["summary"]
        analysis.confidence_score = priority_res["confidence"]
        analysis.urgency_score = result["urgency_score"]
        analysis.detected_language = result["detected_language"]
        analysis.english_translation = result["english_translation"]
        analysis.priority_score = float(priority_res["priority_score"])
        analysis.priority_breakdown = priority_breakdown
        analysis.cluster_id = result["cluster_id"]
        analysis.assistant_metadata = result["metadata"]
        
    db.commit()
    db.refresh(submission)
    
    # 4. Formulate and return the response
    return PipelineResponse(
        submission_id=submission.id,
        detected_language=result["detected_language"],
        english_translation=result["english_translation"],
        category=result["category"],
        sentiment=result["sentiment"],
        urgency_score=result["urgency_score"],
        cluster_name=result["cluster_name"],
        cluster_id=result["cluster_id"],
        summary=result["summary"],
        priority=PriorityResponse(
            priority_score=priority_res["priority_score"],
            breakdown=PriorityBreakdown(**breakdown_data),
            reason=priority_res["reason"],
            confidence=priority_res["confidence"]
        ),
        metadata=result["metadata"]
    )
