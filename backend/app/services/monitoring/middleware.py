import time
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from app.services.monitoring.metrics import ObservabilityMetrics
from app.services.monitoring.logger import StructuredLogger

logger = StructuredLogger("monitoring.middleware")

# IP Rate limiter state store (sliding window)
RATE_LIMIT_WINDOW_SECONDS = 60
RATE_LIMIT_MAX_REQUESTS = 100
ip_request_history = {}  # client_ip -> list of timestamps

class MonitoringMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        metrics = ObservabilityMetrics()
        start_time = time.perf_counter()
        
        method = request.method
        path = request.url.path
        client_ip = request.client.host if request.client else "127.0.0.1"
        
        # 1. Apply Rate Limiting & Throttling
        now = time.time()
        # Clean expired timestamps
        if client_ip not in ip_request_history:
            ip_request_history[client_ip] = []
        
        timestamps = ip_request_history[client_ip]
        ip_request_history[client_ip] = [t for t in timestamps if now - t < RATE_LIMIT_WINDOW_SECONDS]
        
        if len(ip_request_history[client_ip]) >= RATE_LIMIT_MAX_REQUESTS:
            logger.warn(f"Rate limit exceeded for IP: {client_ip} on path {path}", context={"client_ip": client_ip, "path": path})
            response = Response("Too Many Requests: Rate limit exceeded. Try again in a minute.", status_code=429)
            
            # Record failed API request metrics
            metrics.record_api_request(0.001, has_error=True)
            return response
            
        ip_request_history[client_ip].append(now)
        
        has_error = False
        status_code = 500
        
        try:
            response = await call_next(request)
            status_code = response.status_code
            if status_code >= 400:
                has_error = True
                
            # 2. Inject Secure Headers (XSS, Clickjacking, HSTS, Sniffing protection)
            response.headers["X-Frame-Options"] = "DENY"
            response.headers["X-Content-Type-Options"] = "nosniff"
            response.headers["X-XSS-Protection"] = "1; mode=block"
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
            # Don't apply CSP to Swagger/OpenAPI endpoints
            if not (
                request.url.path.startswith("/docs")
                or request.url.path.startswith("/redoc")
                or request.url.path.startswith("/openapi.json")
            ):
                response.headers["Content-Security-Policy"] = "default-src 'self'"
            
            return response
        except Exception as e:
            has_error = True
            logger.error(
                f"Unhandled exception during request {method} {path}",
                context={"error": str(e), "client_ip": client_ip}
            )
            raise e
        finally:
            latency_seconds = time.perf_counter() - start_time
            metrics.record_api_request(latency_seconds, has_error=has_error)
            
            log_context = {
                "method": method,
                "path": path,
                "status_code": status_code,
                "latency_ms": round(latency_seconds * 1000, 2),
                "client_ip": client_ip
            }
            
            if latency_seconds > 0.5:
                logger.warn(f"Slow request detected: {method} {path} took {round(latency_seconds * 1000, 2)}ms", context=log_context)
            else:
                logger.info(f"Processed request: {method} {path} ({status_code})", context=log_context)
