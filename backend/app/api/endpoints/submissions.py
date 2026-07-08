import os
import uuid
from fastapi import APIRouter, Depends, Form, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app import crud
from app.schemas.submissions import SubmissionCreate, SubmissionResponse
from app.services.multimodal import STTService, OCRService
from app.services.auth import PermissionChecker

router = APIRouter()

@router.get("", response_model=List[SubmissionResponse])
def get_submissions(
    category: str = None, 
    ward: str = None, 
    db: Session = Depends(get_db),
    current_user = Depends(PermissionChecker("view_own_grievances"))
):
    db_subs = crud.get_submissions(db, category=category, ward_name=ward)
    
    return [
        SubmissionResponse(
            id=sub.id,
            category=sub.category,
            ward=sub.ward.name if sub.ward else "Unknown Ward",
            description=sub.description,
            reporter_name=sub.reporter_name,
            sentiment=sub.sentiment,
            date=sub.date.strftime("%b %d, %Y") if sub.date else "",
            status=sub.status,
            audio_path=sub.audio_path,
            image_path=sub.image_path
        )
        for sub in db_subs
    ]

@router.post("", response_model=SubmissionResponse)
async def submit_request(
    category: str = Form(...),
    ward: str = Form(...),
    description: Optional[str] = Form(None),
    reporter_name: Optional[str] = Form(None),
    audio_file: Optional[UploadFile] = File(None),
    image_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user = Depends(PermissionChecker("submit_grievance"))
):
    audio_path = None
    image_path = None
    transcription = ""
    ocr_text = ""
    
    # Generate unique prefix for files
    file_prefix = str(uuid.uuid4())[:8]
    
    # Process Audio File
    if audio_file is not None and audio_file.filename:
        audio_content = await audio_file.read()
        if len(audio_content) > 0:
            ext = os.path.splitext(audio_file.filename)[1] or ".wav"
            filename = f"{file_prefix}_audio{ext}"
            local_path = os.path.join("static", "uploads", filename)
            
            with open(local_path, "wb") as f:
                f.write(audio_content)
                
            audio_path = f"/static/uploads/{filename}"
            
            # Transcribe Audio
            stt = STTService()
            transcription = stt.transcribe(audio_content)
            
    # Process Image File
    if image_file is not None and image_file.filename:
        image_content = await image_file.read()
        if len(image_content) > 0:
            ext = os.path.splitext(image_file.filename)[1] or ".jpg"
            filename = f"{file_prefix}_image{ext}"
            local_path = os.path.join("static", "uploads", filename)
            
            with open(local_path, "wb") as f:
                f.write(image_content)
                
            image_path = f"/static/uploads/{filename}"
            
            # Extract OCR Text
            ocr = OCRService()
            ocr_text = ocr.extract_text(image_content)

    # Compile Merged Description
    descriptions = []
    if description and description.strip():
        descriptions.append(description.strip())
    if transcription:
        descriptions.append(transcription)
    if ocr_text:
        descriptions.append(ocr_text)
        
    final_description = "\n\n".join(descriptions)
    if not final_description:
        final_description = "[No description provided]"

    # Create submission in database
    sub_create = SubmissionCreate(
        category=category,
        ward=ward,
        description=final_description,
        reporter_name=reporter_name
    )
    
    db_sub = crud.create_submission(
        db, 
        sub_create, 
        audio_path=audio_path, 
        image_path=image_path
    )
    
    return SubmissionResponse(
        id=db_sub.id,
        category=db_sub.category,
        ward=db_sub.ward.name if db_sub.ward else "Unknown Ward",
        description=db_sub.description,
        reporter_name=db_sub.reporter_name,
        sentiment=db_sub.sentiment,
        date=db_sub.date.strftime("%b %d, %Y") if db_sub.date else "",
        status=db_sub.status,
        audio_path=db_sub.audio_path,
        image_path=db_sub.image_path
    )
