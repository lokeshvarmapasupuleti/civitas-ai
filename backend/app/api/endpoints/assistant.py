from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.assistant import AssistantQuery, AssistantResponse
from app.services.assistant import AssistantService

router = APIRouter()

@router.post("/query", response_model=AssistantResponse)
def query_assistant(payload: AssistantQuery, db: Session = Depends(get_db)):
    service = AssistantService()
    response = service.query_assistant(db, payload.query)
    return response
