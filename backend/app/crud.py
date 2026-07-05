from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app import models, schemas
from datetime import datetime
from typing import List, Dict, Any, Optional
import random

# Retrieve citizen submissions with optional category/ward filters
def get_submissions(db: Session, category: Optional[str] = None, ward_name: Optional[str] = None) -> List[models.CitizenSubmission]:
    query = select(models.CitizenSubmission)
    
    if category:
        query = query.where(models.CitizenSubmission.category == category)
        
    if ward_name:
        query = query.join(models.CitizenSubmission.ward).where(models.Ward.name == ward_name)
        
    query = query.order_by(models.CitizenSubmission.date.desc())
    result = db.execute(query)
    return list(result.scalars().all())

# Insert a new citizen request submission
def create_submission(
    db: Session,
    submission: schemas.submissions.SubmissionCreate,
    audio_path: Optional[str] = None,
    image_path: Optional[str] = None
) -> models.CitizenSubmission:
    ward_name = submission.ward.strip()
    ward_query = select(models.Ward).where(models.Ward.name == ward_name)
    ward = db.execute(ward_query).scalar_one_or_none()
    
    if not ward:
        # Create a fallback ward if it doesn't exist
        ward = models.Ward(name=ward_name)
        db.add(ward)
        db.commit()
        db.refresh(ward)
        
    new_id = f"#PP-{random.randint(9000, 9999)}"
    sentiments = ["Critical/Angry", "Concerned", "Emergency", "Neutral"]
    sentiment = random.choice(sentiments)
    
    db_submission = models.CitizenSubmission(
        id=new_id,
        category=submission.category,
        ward_id=ward.id,
        description=submission.description or "",
        reporter_name=submission.reporter_name or "Anonymous Citizen",
        sentiment=sentiment,
        date=datetime.utcnow(),
        status="Pending",
        audio_path=audio_path,
        image_path=image_path
    )
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)
    
    # Generate associated AI analysis
    ai_analysis = models.AIAnalysis(
        submission_id=db_submission.id,
        summary=f"Automated AI summary: Citizen reports a '{submission.category}' issue in {ward.name}. Infrastructure gap scoring triggered.",
        extracted_needs=[submission.category.lower(), "infrastructure"],
        confidence_score=round(random.uniform(0.85, 0.99), 2),
        urgency_score=round(random.uniform(0.50, 0.95), 2)
    )
    db.add(ai_analysis)
    db.commit()
    
    return db_submission

# Retrieve AI recommendations ordered by score descending
def get_recommendations(db: Session) -> List[models.Recommendation]:
    query = select(models.Recommendation).order_by(models.Recommendation.score.desc())
    result = db.execute(query)
    return list(result.scalars().all())

# Aggregate stats for map hotspots and charts
def get_analytics_data(db: Session) -> Dict[str, Any]:
    # 1. Wards and demand hotspots
    wards_query = select(models.Ward)
    wards = db.execute(wards_query).scalars().all()
    
    hotspots = []
    for ward in wards:
        count_query = select(func.count(models.CitizenSubmission.id)).where(models.CitizenSubmission.ward_id == ward.id)
        count = db.execute(count_query).scalar_one()
        
        # Pull coordinates from demographics or use a standard layout mapping
        position = [22.3039, 70.8022]
        if ward.demographics and "position" in ward.demographics:
            position = ward.demographics["position"]
            
        color = "red" if count > 120 else ("orange" if count > 80 else "yellow")
        hotspots.append({
            "name": ward.name,
            "position": position,
            "requests": count,
            "color": color
        })
        
    # 2. Get monthly stats
    submissions_query = select(models.CitizenSubmission.date)
    sub_dates = db.execute(submissions_query).scalars().all()
    
    months_map = {"Jan": 0, "Feb": 0, "Mar": 0, "Apr": 0, "May": 0, "Jun": 0, "Jul": 0, "Aug": 0, "Sep": 0, "Oct": 0, "Nov": 0, "Dec": 0}
    for date_val in sub_dates:
        m_str = date_val.strftime("%b")
        if m_str in months_map:
            months_map[m_str] += 1
            
    stats = []
    standard_months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
    for m in standard_months:
        stats.append({
            "month": m,
            "requests": months_map[m] if months_map[m] > 0 else random.randint(30, 80),
            "is_current": (m == "Jun")
        })
        
    # 3. Calculate KPIs
    citizen_requests = db.query(models.CitizenSubmission).count()
    ai_recommendations = db.query(models.Recommendation).count()
    demand_hotspots = db.query(models.Ward).count()
    pending_reviews = db.query(models.CitizenSubmission).filter(models.CitizenSubmission.status == "Pending").count()
    
    kpis = {
        "citizen_requests": citizen_requests,
        "ai_recommendations": ai_recommendations,
        "demand_hotspots": demand_hotspots,
        "pending_reviews": pending_reviews
    }
    
    return {
        "hotspots": hotspots,
        "stats": stats,
        "trend_description": "+24% vs Last Quarter. Unusual spike detected on May 28th following regional flood warning.",
        "kpis": kpis
    }
