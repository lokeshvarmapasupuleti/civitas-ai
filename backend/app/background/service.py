import os
import sqlite3
import json
import uuid
from datetime import datetime
from typing import Optional, Dict, Any

from app.background.models import JobStatus, JobType, JobRecord

class BackgroundJobService:
    def __init__(self, db_path: str = None):
        if db_path is None:
            module_dir = os.path.dirname(os.path.abspath(__file__))
            db_path = os.path.join(module_dir, "jobs.db")
            
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS background_jobs (
                    job_id TEXT PRIMARY KEY,
                    task_type TEXT NOT NULL,
                    status TEXT NOT NULL,
                    progress REAL DEFAULT 0.0,
                    started_at TEXT,
                    finished_at TEXT,
                    duration_seconds REAL,
                    error_message TEXT,
                    result_metadata TEXT
                )
            """)
            conn.commit()
        finally:
            conn.close()

    def create_job(self, task_type: JobType) -> str:
        job_id = str(uuid.uuid4())
        conn = sqlite3.connect(self.db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO background_jobs (job_id, task_type, status, progress)
                VALUES (?, ?, ?, 0.0)
            """, (job_id, task_type.value, JobStatus.PENDING.value))
            conn.commit()
        finally:
            conn.close()
        return job_id

    def start_job(self, job_id: str):
        started_at = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        conn = sqlite3.connect(self.db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE background_jobs
                SET status = ?, started_at = ?, progress = 5.0
                WHERE job_id = ?
            """, (JobStatus.RUNNING.value, started_at, job_id))
            conn.commit()
        finally:
            conn.close()

    def update_progress(self, job_id: str, progress: float):
        conn = sqlite3.connect(self.db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE background_jobs
                SET progress = ?
                WHERE job_id = ?
            """, (progress, job_id))
            conn.commit()
        finally:
            conn.close()

    def complete_job(self, job_id: str, result_metadata: Optional[Dict[str, Any]] = None):
        finished_at_dt = datetime.utcnow()
        finished_at = finished_at_dt.strftime("%Y-%m-%d %H:%M:%S UTC")
        
        conn = sqlite3.connect(self.db_path)
        try:
            cursor = conn.cursor()
            
            # Retrieve started_at to compute duration
            cursor.execute("SELECT started_at FROM background_jobs WHERE job_id = ?", (job_id,))
            row = cursor.fetchone()
            duration = None
            if row and row[0]:
                try:
                    started_dt = datetime.strptime(row[0], "%Y-%m-%d %H:%M:%S UTC")
                    duration = (finished_at_dt - started_dt).total_seconds()
                except Exception:
                    pass
                    
            res_str = json.dumps(result_metadata) if result_metadata else None
            
            cursor.execute("""
                UPDATE background_jobs
                SET status = ?, progress = 100.0, finished_at = ?, duration_seconds = ?, result_metadata = ?
                WHERE job_id = ?
            """, (JobStatus.COMPLETED.value, finished_at, duration, res_str, job_id))
            
            conn.commit()
        finally:
            conn.close()

    def fail_job(self, job_id: str, error_message: str):
        finished_at_dt = datetime.utcnow()
        finished_at = finished_at_dt.strftime("%Y-%m-%d %H:%M:%S UTC")
        
        conn = sqlite3.connect(self.db_path)
        try:
            cursor = conn.cursor()
            
            # Retrieve started_at to compute duration
            cursor.execute("SELECT started_at FROM background_jobs WHERE job_id = ?", (job_id,))
            row = cursor.fetchone()
            duration = None
            if row and row[0]:
                try:
                    started_dt = datetime.strptime(row[0], "%Y-%m-%d %H:%M:%S UTC")
                    duration = (finished_at_dt - started_dt).total_seconds()
                except Exception:
                    pass
                    
            cursor.execute("""
                UPDATE background_jobs
                SET status = ?, finished_at = ?, duration_seconds = ?, error_message = ?
                WHERE job_id = ?
            """, (JobStatus.FAILED.value, finished_at, duration, error_message, job_id))
            
            conn.commit()
        finally:
            conn.close()

    def get_job(self, job_id: str) -> Optional[JobRecord]:
        conn = sqlite3.connect(self.db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT job_id, task_type, status, progress, started_at, finished_at, duration_seconds, error_message, result_metadata
                FROM background_jobs
                WHERE job_id = ?
            """, (job_id,))
            row = cursor.fetchone()
            if not row:
                return None
                
            res_meta = json.loads(row[8]) if row[8] else None
            
            return JobRecord(
                job_id=row[0],
                task_type=JobType(row[1]),
                status=JobStatus(row[2]),
                progress=row[3],
                started_at=row[4],
                finished_at=row[5],
                duration_seconds=row[6],
                error_message=row[7],
                result_metadata=res_meta
            )
        finally:
            conn.close()

    def clear_jobs(self):
        conn = sqlite3.connect(self.db_path)
        try:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM background_jobs")
            conn.commit()
        finally:
            conn.close()
