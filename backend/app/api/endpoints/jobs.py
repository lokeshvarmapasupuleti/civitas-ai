from fastapi import APIRouter, Depends, HTTPException, status
from app.background import BackgroundJobService, JobRecord
from app.services.auth import PermissionChecker

router = APIRouter()

@router.get("/{job_id}", response_model=JobRecord)
def get_job_status(
    job_id: str,
    current_user = Depends(PermissionChecker("view_own_grievances"))
):
    service = BackgroundJobService()
    job = service.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Background job with ID {job_id} not found."
        )
    return job
