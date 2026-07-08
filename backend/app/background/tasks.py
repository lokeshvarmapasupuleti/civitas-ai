import time
import logging
from typing import Dict, Any
from app.background.service import BackgroundJobService

logger = logging.getLogger("background.tasks")

# Helper to resolve service instance
def get_service() -> BackgroundJobService:
    return BackgroundJobService()

def run_ai_inference(job_id: str, payload: Dict[str, Any]):
    service = get_service()
    try:
        service.start_job(job_id)
        time.sleep(0.1)
        
        service.update_progress(job_id, 30.0)
        time.sleep(0.1)
        
        service.update_progress(job_id, 70.0)
        time.sleep(0.1)
        
        result = {
            "category": "Road Repair",
            "sentiment": "Critical/Angry",
            "urgency_score": 0.88,
            "priority_score": 85
        }
        service.complete_job(job_id, result)
    except Exception as e:
        service.fail_job(job_id, str(e))

def run_ocr_job(job_id: str, image_bytes_len: int):
    service = get_service()
    try:
        service.start_job(job_id)
        time.sleep(0.1)
        
        service.update_progress(job_id, 50.0)
        time.sleep(0.1)
        
        result = {
            "extracted_text": "MUNICIPAL NOTICE: KEEP WARD 1 CLEAN",
            "confidence": 0.95,
            "detected_language": "en"
        }
        service.complete_job(job_id, result)
    except Exception as e:
        service.fail_job(job_id, str(e))

def run_speech_transcription(job_id: str, audio_bytes_len: int):
    service = get_service()
    try:
        service.start_job(job_id)
        time.sleep(0.1)
        
        service.update_progress(job_id, 40.0)
        time.sleep(0.1)
        
        result = {
            "transcript": "Heavy garbage overflow near central market block.",
            "confidence": 0.91,
            "duration_seconds": 4.5
        }
        service.complete_job(job_id, result)
    except Exception as e:
        service.fail_job(job_id, str(e))

def run_report_generation(job_id: str, filter_params: Dict[str, Any]):
    service = get_service()
    try:
        service.start_job(job_id)
        time.sleep(0.1)
        
        service.update_progress(job_id, 25.0)
        time.sleep(0.1)
        
        service.update_progress(job_id, 75.0)
        time.sleep(0.1)
        
        result = {
            "report_url": "/static/exports/commissioner_report_2026.csv",
            "records_count": 120,
            "generated_at": "2026-07-07T10:19:00Z"
        }
        service.complete_job(job_id, result)
    except Exception as e:
        service.fail_job(job_id, str(e))

def run_notification_delivery(job_id: str, request_data: Dict[str, Any]):
    service = get_service()
    try:
        service.start_job(job_id)
        time.sleep(0.1)
        
        service.update_progress(job_id, 60.0)
        time.sleep(0.1)
        
        result = {
            "channels_delivered": ["email", "sms"],
            "recipient": "officer_rajesh"
        }
        service.complete_job(job_id, result)
    except Exception as e:
        service.fail_job(job_id, str(e))

def run_analytics_refresh(job_id: str):
    service = get_service()
    try:
        service.start_job(job_id)
        time.sleep(0.1)
        
        service.update_progress(job_id, 50.0)
        time.sleep(0.1)
        
        result = {
            "total_records_processed": 1450,
            "active_wards_updated": 12
        }
        service.complete_job(job_id, result)
    except Exception as e:
        service.fail_job(job_id, str(e))

def run_gis_calculations(job_id: str, coords: Dict[str, float]):
    service = get_service()
    try:
        service.start_job(job_id)
        time.sleep(0.1)
        
        service.update_progress(job_id, 35.0)
        time.sleep(0.1)
        
        service.update_progress(job_id, 80.0)
        time.sleep(0.1)
        
        result = {
            "resolved_ward": "Ward 1 (Indiranagar)",
            "hotspot_score": 0.76,
            "nearby_facilities_count": 5
        }
        service.complete_job(job_id, result)
    except Exception as e:
        service.fail_job(job_id, str(e))
