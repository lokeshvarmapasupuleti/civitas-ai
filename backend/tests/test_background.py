import pytest
import tempfile
import time
import os
from fastapi import BackgroundTasks
from app.background import (
    BackgroundJobService,
    JobStatus,
    JobType,
    MockRedisQueueProvider,
    MockCeleryProvider,
    FastAPIBackgroundTasksProvider,
    run_ocr_job
)

def test_job_service_lifecycle():
    fd, temp_db = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    
    try:
        service = BackgroundJobService(db_path=temp_db)
        
        # 1. Create Job
        job_id = service.create_job(JobType.OCR_JOB)
        assert job_id is not None
        
        job = service.get_job(job_id)
        assert job.status == JobStatus.PENDING
        assert job.progress == 0.0
        
        # 2. Start Job
        service.start_job(job_id)
        job = service.get_job(job_id)
        assert job.status == JobStatus.RUNNING
        assert job.started_at is not None
        
        # 3. Update progress
        service.update_progress(job_id, 45.0)
        job = service.get_job(job_id)
        assert job.progress == 45.0
        
        # 4. Complete Job
        metadata = {"pages": 2, "lang": "en"}
        service.complete_job(job_id, metadata)
        
        job = service.get_job(job_id)
        assert job.status == JobStatus.COMPLETED
        assert job.progress == 100.0
        assert job.finished_at is not None
        assert job.duration_seconds is not None
        assert job.result_metadata == metadata
        
    finally:
        if os.path.exists(temp_db):
            os.remove(temp_db)

def test_job_failure():
    fd, temp_db = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    
    try:
        service = BackgroundJobService(db_path=temp_db)
        job_id = service.create_job(JobType.SPEECH_TRANSCRIPTION)
        
        service.start_job(job_id)
        service.fail_job(job_id, "Speech-to-text API connection timed out.")
        
        job = service.get_job(job_id)
        assert job.status == JobStatus.FAILED
        assert job.error_message == "Speech-to-text API connection timed out."
        assert job.finished_at is not None
        
    finally:
        if os.path.exists(temp_db):
            os.remove(temp_db)

def test_redis_queue_async_execution():
    # Setup service database
    service = BackgroundJobService()
    service.clear_jobs()
    
    job_id = service.create_job(JobType.OCR_JOB)
    
    # Enqueue using mock Redis Queue provider (spawns background thread)
    provider = MockRedisQueueProvider()
    provider.enqueue(run_ocr_job, job_id=job_id, image_bytes_len=2048)
    
    # Check immediate state (should be Pending/Running soon)
    job = service.get_job(job_id)
    assert job is not None
    
    # Wait for thread to complete task execution (workload has sleep statements)
    time.sleep(0.4)
    
    # Verify completed asynchronously
    job = service.get_job(job_id)
    assert job.status == JobStatus.COMPLETED
    assert job.progress == 100.0
    assert "extracted_text" in job.result_metadata

def test_fastapi_background_tasks_provider():
    bt = BackgroundTasks()
    provider = FastAPIBackgroundTasksProvider(bt)
    
    service = BackgroundJobService()
    job_id = service.create_job(JobType.OCR_JOB)
    
    provider.enqueue(run_ocr_job, job_id=job_id, image_bytes_len=512)
    
    # Should have task registered in FastAPI background queue list
    assert len(bt.tasks) == 1
    assert bt.tasks[0].func == run_ocr_job
