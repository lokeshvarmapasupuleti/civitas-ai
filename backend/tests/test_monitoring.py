import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.monitoring import ObservabilityMetrics, StructuredLogger, MonitoringService
from app.database import SessionLocal

def test_structured_logger(capsys):
    logger = StructuredLogger("test.logger")
    logger.info("Observability layer online", context={"test_key": "test_val"})
    
    captured = capsys.readouterr()
    assert "test.logger" in captured.out
    assert "INFO" in captured.out
    assert "Observability layer online" in captured.out
    assert "test_key" in captured.out

def test_observability_metrics():
    metrics = ObservabilityMetrics()
    # Reset metrics state for clean run
    metrics._init_metrics()
    
    metrics.record_api_request(0.1, has_error=False)
    metrics.record_api_request(0.2, has_error=True)
    metrics.record_ai_inference(0.3)
    metrics.record_db_query(0.05)
    
    summary = metrics.get_summary()
    assert summary["total_api_requests"] == 2
    assert summary["total_errors"] == 1
    assert summary["error_rate_percent"] == 50.0
    assert summary["avg_api_latency_ms"] == 150.0
    assert summary["avg_ai_latency_ms"] == 300.0
    assert summary["avg_db_latency_ms"] == 50.0

def test_monitoring_service():
    db = SessionLocal()
    try:
        status = MonitoringService.run_health_checks(db)
        assert status.status in ["Healthy", "Degraded", "Unhealthy"]
        assert status.cpu_percent > 0.0
        assert status.memory_percent > 0.0
        assert len(status.dependencies) > 0
        assert status.dependencies[0].name == "PostgreSQL Database"
    finally:
        db.close()

def test_monitoring_endpoints():
    client = TestClient(app)
    
    # 1. Test /health
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "cpu_percent" in data
    assert "dependencies" in data
    
    # 2. Test /metrics
    response = client.get("/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "total_api_requests" in data
    assert "error_rate_percent" in data
    
    # 3. Test /system/status
    response = client.get("/system/status")
    assert response.status_code == 200
    data = response.json()
    assert "memory_percent" in data
    assert "disk_percent" in data

def test_security_headers_and_rate_limiter():
    client = TestClient(app)
    
    # 1. Assert security headers are present
    response = client.get("/health")
    assert response.status_code == 200
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-XSS-Protection") == "1; mode=block"
    assert "Strict-Transport-Security" in response.headers
    
    # 2. Trigger Rate Limiter
    # Clear client request state so the test is isolated and robust
    from app.services.monitoring.middleware import ip_request_history
    import app.services.monitoring.middleware as mw
    ip_request_history.clear()
    
    # Temporarily set limit to 5 to trigger fast
    old_limit = mw.RATE_LIMIT_MAX_REQUESTS
    mw.RATE_LIMIT_MAX_REQUESTS = 5
    
    try:
        limit_breached = False
        for _ in range(10):
            res = client.get("/health")
            if res.status_code == 429:
                limit_breached = True
                break
        assert limit_breached is True
    finally:
        mw.RATE_LIMIT_MAX_REQUESTS = old_limit
        ip_request_history.clear()
