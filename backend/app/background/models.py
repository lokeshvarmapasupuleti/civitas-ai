from enum import Enum
from typing import Optional, Any, Dict
from pydantic import BaseModel, Field

class JobStatus(str, Enum):
    PENDING = "Pending"
    RUNNING = "Running"
    COMPLETED = "Completed"
    FAILED = "Failed"

class JobType(str, Enum):
    AI_INFERENCE = "AI Inference"
    OCR_JOB = "OCR Job"
    SPEECH_TRANSCRIPTION = "Speech Transcription"
    REPORT_GENERATION = "Report Generation"
    NOTIFICATION_DELIVERY = "Notification Delivery"
    ANALYTICS_REFRESH = "Analytics Refresh"
    GIS_CALCULATIONS = "GIS Calculations"

class JobRecord(BaseModel):
    job_id: str = Field(..., description="Unique UUID job identifier")
    task_type: JobType = Field(..., description="The background task type category")
    status: JobStatus = Field(JobStatus.PENDING, description="Current queue status")
    progress: float = Field(0.0, description="Completion percentage (0.0 to 100.0)")
    started_at: Optional[str] = Field(None, description="Job execution start timestamp")
    finished_at: Optional[str] = Field(None, description="Job completion timestamp")
    duration_seconds: Optional[float] = Field(None, description="Execution duration in seconds")
    error_message: Optional[str] = Field(None, description="Error logs in case of failure")
    result_metadata: Optional[Dict[str, Any]] = Field(None, description="Optional payload returned by the task")
