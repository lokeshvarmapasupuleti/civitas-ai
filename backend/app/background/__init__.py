# app/background/__init__.py
from app.background.models import JobStatus, JobType, JobRecord
from app.background.queue_interface import BaseQueueProvider
from app.background.providers import (
    FastAPIBackgroundTasksProvider,
    MockRedisQueueProvider,
    MockCeleryProvider
)
from app.background.service import BackgroundJobService
from app.background.tasks import (
    run_ai_inference,
    run_ocr_job,
    run_speech_transcription,
    run_report_generation,
    run_notification_delivery,
    run_analytics_refresh,
    run_gis_calculations
)
