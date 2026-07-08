import os
import sys
import pytest

# Ensure `backend/app` is importable when running tests from repo root.
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app import crud, models, schemas

def test_crud_submissions():
    db = SessionLocal()

    ward_name_base = "Test Ward 99"
    description_base = "Potholes in segment 9"

    # Use unique per-test identifiers to avoid collisions with leftover rows from prior runs.
    uniq = id(db)
    ward_name = f"{ward_name_base}-{uniq}"
    description = f"{description_base}-{uniq}"

    # Ensure test isolation even if database contains leftover rows from prior failing runs.
    # Remove any lingering ai_analyses/citizen_submissions/wards for these exact values.
    try:
        # AIAnalysis model uses `submission_id` as the FK column.
        db.execute(
            "DELETE FROM ai_analyses WHERE submission_id IN (SELECT id FROM citizen_submissions WHERE description = :d)",
            {"d": description},
        )
        db.commit()
    except Exception:
        db.rollback()

    try:
        db.query(models.CitizenSubmission).filter(models.CitizenSubmission.description == description).delete(synchronize_session=False)
        db.query(models.Ward).filter(models.Ward.name == ward_name).delete(synchronize_session=False)
        db.commit()
    except Exception:
        db.rollback()

    try:
        # If a previous test left the ward behind, remove it first to keep the test idempotent.
        existing_ward = db.query(models.Ward).filter(models.Ward.name == ward_name).first()
        if existing_ward is not None:
            # Keep this idempotent + cleanup friendly even if prior runs left orphaned children.
            # Delete child rows in the correct order to satisfy foreign keys.

            # For idempotency, aggressively remove anything tied to prior test data.
            # The FK chain includes ai_analyses -> citizen_submissions -> wards.
            try:
                submission_ids = [
                    s.id
                    for s in db.query(models.CitizenSubmission.id)
                    .filter(models.CitizenSubmission.description == description)
                    .all()
                ]

                # Delete from ai_analyses using the FK column name if the ORM model is available.
                # Otherwise fall back to raw SQL to keep the test isolated.
                if hasattr(models, "AiAnalysis") and hasattr(models.AiAnalysis, "submission_id"):
                    if submission_ids:
                        db.query(models.AiAnalysis).filter(
                            models.AiAnalysis.submission_id.in_(submission_ids)
                        ).delete(synchronize_session=False)
                else:
                    if submission_ids:
                        db.execute(
                            "DELETE FROM ai_analyses WHERE submission_id = ANY(:ids)",
                            {"ids": submission_ids},
                        )

                # Delete submissions
                db.query(models.CitizenSubmission).filter(
                    models.CitizenSubmission.description == description
                ).delete(synchronize_session=False)

                # Delete ward
                db.delete(existing_ward)
                db.commit()
            except Exception:
                db.rollback()
                # Ensure session is clean for the later insert attempts.
                # Don't proceed if the ward still exists.
                existing_ward = db.query(models.Ward).filter(models.Ward.name == ward_name).first()
                pass

        # 1. Get submissions initially
        subs = crud.get_submissions(db)
        assert isinstance(subs, list)

        # Create a new ward
        # If the ward still exists from a previous run, update test isolation by using a new name.
        if db.query(models.Ward).filter(models.Ward.name == ward_name).first() is not None:
            ward_name = f"{ward_name}-{db.in_transaction}"
        ward = models.Ward(name=ward_name)
        db.add(ward)
        db.commit()
        db.refresh(ward)

        # 2. Create submission
        sub_create = schemas.submissions.SubmissionCreate(
            category="Road Repair",
            ward=ward_name,
            description=description,
            reporter_name="Tester",
        )
        sub = crud.create_submission(
            db,
            sub_create,
            audio_path="mock_audio.wav",
            image_path="mock_image.png",
        )
        assert sub.id is not None
        assert sub.category == "Road Repair"
        assert sub.status == "Pending"

        # 3. Retrieve with category filter
        subs_cat = crud.get_submissions(db, category="Road Repair")
        assert len(subs_cat) > 0
        assert any(s.id == sub.id for s in subs_cat)

        # 4. Retrieve with ward filter
        subs_ward = crud.get_submissions(db, ward_name=ward_name)
        assert len(subs_ward) > 0

    except Exception:
        # Ensure the session isn't left in a PendingRollback state.
        db.rollback()
        raise

    finally:
        # Clean up (children before parent) and keep it resilient even if a prior commit failed.
        try:
            # Delete grandchildren first to avoid FK violations.
            if hasattr(models, "AiAnalysis") and hasattr(models.AiAnalysis, "submission_id"):
                submission_ids = [
                    s.id
                    for s in db.query(models.CitizenSubmission.id)
                    .filter(models.CitizenSubmission.description == description)
                    .all()
                ]
                if submission_ids:
                    db.query(models.AiAnalysis).filter(
                        models.AiAnalysis.submission_id.in_(submission_ids)
                    ).delete(synchronize_session=False)

            db.query(models.CitizenSubmission).filter(
                models.CitizenSubmission.description == description
            ).delete(synchronize_session=False)
            db.query(models.Ward).filter(models.Ward.name == ward_name).delete()
            db.commit()
        except Exception:
            db.rollback()
        finally:
            db.close()

def test_crud_recommendations():
    db = SessionLocal()
    try:
        recs = crud.get_recommendations(db)
        assert isinstance(recs, list)
    finally:
        db.close()

def test_crud_analytics():
    db = SessionLocal()
    try:
        # Invalidate cache for clean calculation
        from app.services.cache import CacheService
        CacheService.get_instance().clear()
        
        analytics = crud.get_analytics_data(db)
        assert "hotspots" in analytics
        assert "stats" in analytics
        assert "kpis" in analytics
        assert "daily_trends" in analytics
        assert "weekly_trends" in analytics
        assert "monthly_trends" in analytics
        assert analytics["complaint_growth"] is not None
        assert analytics["resolution_rate"] is not None
    finally:
        db.close()
