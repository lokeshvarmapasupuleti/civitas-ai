from fastapi import APIRouter
from app.api.endpoints import health, submissions, recommendations, analytics, ai, assistant

api_router = APIRouter()

# Include endpoint routes with proper prefixes/tags
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(submissions.router, prefix="/submissions", tags=["submissions"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(assistant.router, prefix="/assistant", tags=["assistant"])
