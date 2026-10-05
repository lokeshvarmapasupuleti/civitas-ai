from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.database import Base, engine, SessionLocal
    from app.services.auth import AuthService
    # Create all tables if not exist
    Base.metadata.create_all(bind=engine)
    # Seed permissions, roles, and default users
    db = SessionLocal()
    try:
        AuthService.seed_roles_and_permissions(db)
    finally:
        db.close()
    yield

app = FastAPI(
    title="Civitas AI API",
    description="AI Governance Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS to allow access from the frontend local dev environments
origins = [
    # Local development
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",

    # Production frontend
    "https://civitas-ai-kjq6.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.services.monitoring import MonitoringMiddleware
app.add_middleware(MonitoringMiddleware)

from fastapi.staticfiles import StaticFiles
import os

# Create uploads directory if not exists
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include unified API router
app.include_router(api_router)


