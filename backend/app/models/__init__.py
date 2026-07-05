from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy import String, Text, ForeignKey, Integer, Float, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Ward(Base):
    __tablename__ = "wards"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True)
    demographics: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB)
    infrastructure_metrics: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB)

    # Relationships
    submissions: Mapped[List["CitizenSubmission"]] = relationship(back_populates="ward", cascade="all, delete-orphan")
    recommendations: Mapped[List["Recommendation"]] = relationship(back_populates="ward", cascade="all, delete-orphan")


class CitizenSubmission(Base):
    __tablename__ = "citizen_submissions"

    id: Mapped[str] = mapped_column(String(50), primary_key=True)  # Custom ID e.g. #PP-8921
    category: Mapped[str] = mapped_column(String(100))
    ward_id: Mapped[int] = mapped_column(ForeignKey("wards.id"))
    description: Mapped[str] = mapped_column(Text)
    reporter_name: Mapped[Optional[str]] = mapped_column(String(100))
    sentiment: Mapped[str] = mapped_column(String(50))
    date: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    status: Mapped[str] = mapped_column(String(50), default="Pending")
    audio_path: Mapped[Optional[str]] = mapped_column(String(255))
    image_path: Mapped[Optional[str]] = mapped_column(String(255))

    # Relationships
    ward: Mapped["Ward"] = relationship(back_populates="submissions")
    analysis: Mapped[Optional["AIAnalysis"]] = relationship(back_populates="submission", cascade="all, delete-orphan")


class AIAnalysis(Base):
    __tablename__ = "ai_analyses"

    id: Mapped[int] = mapped_column(primary_key=True)
    submission_id: Mapped[str] = mapped_column(ForeignKey("citizen_submissions.id"))
    summary: Mapped[str] = mapped_column(Text)
    extracted_needs: Mapped[Optional[List[str]]] = mapped_column(JSONB)  # List of tags
    confidence_score: Mapped[float] = mapped_column(Float)
    urgency_score: Mapped[float] = mapped_column(Float)

    # New columns for processing pipeline
    detected_language: Mapped[Optional[str]] = mapped_column(String(50))
    english_translation: Mapped[Optional[str]] = mapped_column(Text)
    priority_score: Mapped[Optional[float]] = mapped_column(Float)
    priority_breakdown: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB)  # Breakdown, reason, confidence
    cluster_id: Mapped[Optional[int]] = mapped_column(ForeignKey("ai_clusters.id"))
    assistant_metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSONB)  # Prepared metadata for AI Assistant query

    # Relationships
    submission: Mapped["CitizenSubmission"] = relationship(back_populates="analysis")
    cluster: Mapped[Optional["AICluster"]] = relationship(back_populates="analyses")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    ward_id: Mapped[int] = mapped_column(ForeignKey("wards.id"))
    score: Mapped[int] = mapped_column(Integer)
    budget: Mapped[str] = mapped_column(String(100))
    impact: Mapped[str] = mapped_column(String(200))
    completion_time: Mapped[str] = mapped_column(String(100))
    risk_level: Mapped[str] = mapped_column(String(50))
    ai_reasoning: Mapped[str] = mapped_column(Text)

    # Relationships
    ward: Mapped["Ward"] = relationship(back_populates="recommendations")


class PublicDataset(Base):
    __tablename__ = "public_datasets"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    dataset_type: Mapped[str] = mapped_column(String(100))
    data: Mapped[Dict[str, Any]] = mapped_column(JSONB)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AICluster(Base):
    __tablename__ = "ai_clusters"

    id: Mapped[int] = mapped_column(primary_key=True)
    cluster_name: Mapped[str] = mapped_column(String(100))
    summary: Mapped[str] = mapped_column(Text)
    submission_count: Mapped[int] = mapped_column(Integer, default=0)
    ward: Mapped[str] = mapped_column(String(50))
    priority_score: Mapped[int] = mapped_column(Integer)

    # Relationships
    analyses: Mapped[List["AIAnalysis"]] = relationship(back_populates="cluster")
