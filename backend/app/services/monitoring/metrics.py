import time
from typing import Dict, Any
from app.services.cache import CacheService
from app.background.service import BackgroundJobService
from app.background.models import JobStatus

class ObservabilityMetrics:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(ObservabilityMetrics, cls).__new__(cls)
            cls._instance._init_metrics()
        return cls._instance

    def _init_metrics(self):
        self.api_requests = 0
        self.api_errors = 0
        self.api_latency_sum = 0.0
        
        self.ai_requests = 0
        self.ai_latency_sum = 0.0
        
        self.db_queries = 0
        self.db_latency_sum = 0.0

    def record_api_request(self, latency_seconds: float, has_error: bool = False):
        self.api_requests += 1
        self.api_latency_sum += latency_seconds
        if has_error:
            self.api_errors += 1

    def record_ai_inference(self, latency_seconds: float):
        self.ai_requests += 1
        self.ai_latency_sum += latency_seconds

    def record_db_query(self, latency_seconds: float):
        self.db_queries += 1
        self.db_latency_sum += latency_seconds

    def get_summary(self) -> Dict[str, Any]:
        avg_api = (self.api_latency_sum / self.api_requests * 1000) if self.api_requests > 0 else 0.0
        avg_ai = (self.ai_latency_sum / self.ai_requests * 1000) if self.ai_requests > 0 else 0.0
        avg_db = (self.db_latency_sum / self.db_queries * 1000) if self.db_queries > 0 else 0.0
        
        error_rate = (self.api_errors / self.api_requests * 100) if self.api_requests > 0 else 0.0
        
        # Integrate with cache metrics
        cache = CacheService.get_instance()
        cache_metrics = cache.get_metrics()
        hits = cache_metrics.get("hits", 0)
        misses = cache_metrics.get("misses", 0)
        total_cache = hits + misses
        hit_rate = (hits / total_cache * 100) if total_cache > 0 else 0.0
        
        # Integrate with queue metrics (retrieve active/pending background jobs)
        queue_len = 0
        try:
            # Check SQLite table row counts
            job_svc = BackgroundJobService()
            conn = sqlite3_connect_if_possible(job_svc.db_path)
            if conn:
                cursor = conn.cursor()
                cursor.execute("SELECT COUNT(*) FROM background_jobs WHERE status IN ('Pending', 'Running')")
                queue_len = cursor.fetchone()[0]
                conn.close()
        except Exception:
            pass
            
        return {
            "total_api_requests": self.api_requests,
            "total_errors": self.api_errors,
            "error_rate_percent": round(error_rate, 2),
            "avg_api_latency_ms": round(avg_api, 2),
            "avg_ai_latency_ms": round(avg_ai, 2),
            "avg_db_latency_ms": round(avg_db, 2),
            "cache_hit_rate_percent": round(hit_rate, 2),
            "active_queue_length": queue_len
        }

def sqlite3_connect_if_possible(db_path: str):
    import os
    import sqlite3
    if os.path.exists(db_path):
        try:
            return sqlite3.connect(db_path)
        except Exception:
            return None
    return None
