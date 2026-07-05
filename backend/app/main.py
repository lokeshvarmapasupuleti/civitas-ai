from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.router import api_router

app = FastAPI(
    title="People's Priorities API",
    description="Backend API for citizen development requests, AI recommendations, and geospatial analytics.",
    version="1.0.0",
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
    "https://peoples-priorities-kjq6.onrender.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
import os

# Create uploads directory if not exists
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include unified API router
app.include_router(api_router)
