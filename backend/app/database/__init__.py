import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from app.database.base_class import Base

# Load compiles extension to handle JSONB compatibility on SQLite
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import JSONB

@compiles(JSONB, "sqlite")
def compile_jsonb_sqlite(type_, compiler, **kw):
    return "JSON"

# Load environment variables from .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/civitas_ai")

# Check if we should use SQLite fallback
use_sqlite = False
if DATABASE_URL.startswith("sqlite") or os.getenv("TESTING") == "true":
    use_sqlite = True
else:
    # Try connecting to PostgreSQL to verify it's online
    try:
        temp_engine = create_engine(DATABASE_URL, connect_args={"connect_timeout": 2})
        with temp_engine.connect() as conn:
            pass
        engine = temp_engine
    except Exception:
        logging.warning("PostgreSQL is unavailable. Falling back to SQLite database.")
        use_sqlite = True

if use_sqlite:
    DATABASE_URL = "sqlite:///civitas_ai_fallback.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# DB Session Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Automatic schema creation and seeding for SQLite fallback
if use_sqlite:
    try:
        import app.models as models
        # Create all tables on the SQLite database using Base from base_class
        Base.metadata.create_all(bind=engine)
        
        # Seed initial data if database is empty
        db_session = SessionLocal()
        try:
            if db_session.query(models.Ward).first() is None:
                # Seed 12 Wards
                wards = []
                for i in range(1, 13):
                    name = f"Ward {i}"
                    if i == 1:
                        name = "Ward 1 (Indiranagar)"
                    lat = 22.3039 + (i * 0.005) - 0.03
                    lng = 70.8022 + (i * 0.003) - 0.02
                    ward = models.Ward(
                        name=name,
                        demographics={
                            "population": 25000,
                            "literacy_rate": 85.0,
                            "position": [lat, lng],
                            "area_sq_km": 5.0
                        },
                        infrastructure_metrics={
                            "schools_count": 5,
                            "healthcare_facilities": 2,
                            "roads_condition_score": 6,
                            "avg_hospital_distance_km": 3.0,
                            "avg_school_distance_km": 1.5
                        }
                    )
                    db_session.add(ward)
                    wards.append(ward)
                db_session.commit()
                
                # Refresh to get IDs
                for w in wards:
                    db_session.refresh(w)
                    
                # Seed recommendations
                rec1 = models.Recommendation(
                    title="Repair Internal Roads in Ward 6",
                    score=96,
                    budget="15 Lakhs",
                    impact="High impact",
                    completion_time="6 months",
                    risk_level="Low",
                    ai_reasoning="Pothole density is critical near schools",
                    ward_id=wards[0].id
                )
                db_session.add(rec1)
                db_session.commit()
        finally:
            db_session.close()
    except Exception as err:
        logging.error(f"Error seeding SQLite fallback database: {err}")
