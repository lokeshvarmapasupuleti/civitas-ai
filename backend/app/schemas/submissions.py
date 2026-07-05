from pydantic import BaseModel
from typing import Optional

class SubmissionCreate(BaseModel):
    category: str
    ward: str
    description: Optional[str] = None
    reporter_name: Optional[str] = None

class SubmissionResponse(BaseModel):
    id: str
    category: str
    ward: str
    description: str
    reporter_name: Optional[str] = None
    sentiment: str
    date: str
    status: str
    audio_path: Optional[str] = None
    image_path: Optional[str] = None
