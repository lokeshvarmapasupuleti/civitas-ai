import pytest
import os
import tempfile
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.services.auth import AuthService
from app.background import BackgroundJobService, JobType
import app.crud as crud

# Monkeypatch create_submission to strip the '#' character from IDs
# so Starlette's TestClient doesn't strip them as client-side URL fragments.
original_create_submission = crud.create_submission
def mock_create_submission(db, submission, audio_path=None, image_path=None):
    sub = original_create_submission(db, submission, audio_path, image_path)
    if sub.id.startswith("#"):
        sub.id = sub.id.replace("#", "")
        db.commit()
        db.refresh(sub)
    return sub
crud.create_submission = mock_create_submission

# Setup a clean temporary database for endpoint tests
fd, temp_db = tempfile.mkstemp(suffix=".db")
os.close(fd)
engine = create_engine(f"sqlite:///{temp_db}", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    # Create tables and seed data in the clean temporary database
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        AuthService.seed_roles_and_permissions(db)
    finally:
        db.close()
    yield
    # Cleanup
    if os.path.exists(temp_db):
        try:
            os.remove(temp_db)
        except Exception:
            pass

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_auth_endpoints(client):
    # 1. Login citizen (successful)
    login_data = {
        "username": "citizen_lokesh",
        "password": "citizenPassword123"
    }
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    tokens = response.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens
    
    # 2. Login citizen (unsuccessful)
    response = client.post("/auth/login", json={"username": "citizen_lokesh", "password": "wrong_password"})
    assert response.status_code == 401
    
    # 3. Refresh token (successful)
    response = client.post(
        "/auth/refresh",
        json={"refresh_token": tokens["refresh_token"]}
    )
    assert response.status_code == 200
    new_tokens = response.json()
    assert "access_token" in new_tokens
    
    # 4. Refresh token (unsuccessful)
    response = client.post("/auth/refresh", json={"refresh_token": "invalid_refresh_token"})
    assert response.status_code == 400
    
    # 5. Logout (successful)
    response = client.post(
        "/auth/logout",
        json={"refresh_token": new_tokens["refresh_token"]},
        headers={"Authorization": f"Bearer {new_tokens['access_token']}"}
    )
    assert response.status_code == 200
    
    # 6. Logout (unsuccessful - already logged out)
    response = client.post(
        "/auth/logout",
        json={"refresh_token": new_tokens["refresh_token"]},
        headers={"Authorization": f"Bearer {new_tokens['access_token']}"}
    )
    assert response.status_code == 400

def test_password_reset_endpoints(client):
    # 1. Request password reset (existing user email registered during seed)
    response = client.post("/auth/reset-password/request", json={"email": "lokesh@citizen.gov.in"})
    assert response.status_code == 200
    res = response.json()
    assert "mock_reset_token" in res
    mock_token = res["mock_reset_token"]
    assert mock_token is not None
    
    # 2. Request password reset (invalid email)
    response = client.post("/auth/reset-password/request", json={"email": "non_existing_email@civitas.gov"})
    assert response.status_code == 200 # prevent user enumeration
    
    # 3. Confirm reset (successful)
    response = client.post("/auth/reset-password/confirm", json={"token": mock_token, "new_password": "NewSecurePassword123"})
    assert response.status_code == 200
    
    # 4. Confirm reset (invalid token)
    response = client.post("/auth/reset-password/confirm", json={"token": "invalid_token", "new_password": "NewSecurePassword123"})
    assert response.status_code == 400
    
    # 5. Restore original password so subsequent tests don't fail authentication
    response = client.post("/auth/reset-password/confirm", json={"token": mock_token, "new_password": "citizenPassword123"})
    assert response.status_code == 200

def test_submission_endpoints(client):
    # Get access token for authorized actions
    login_data = {
        "username": "citizen_lokesh",
        "password": "citizenPassword123"
    }
    response = client.post("/auth/login", json=login_data)
    assert response.status_code == 200
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Get submissions list
    response = client.get("/submissions", headers=headers)
    assert response.status_code == 200
    
    # 2. Get submissions list with query filters
    response = client.get("/submissions?category=Roads&ward=Ward%201%20(Indiranagar)", headers=headers)
    assert response.status_code == 200
    
    # 3. Create submission
    submit_payload = {
        "category": "Water Supply",
        "ward": "Ward 1 (Indiranagar)",
        "description": "No water flow since last Tuesday."
    }
    response = client.post("/submissions", data=submit_payload, headers=headers)
    assert response.status_code == 200
    sub = response.json()
    assert sub["category"] == "Water Supply"
    assert sub["status"] == "Pending"

def test_ai_and_analytics_endpoints(client):
    # 1. Login as Citizen to create a submission
    cit_login = {"username": "citizen_lokesh", "password": "citizenPassword123"}
    cit_tok = client.post("/auth/login", json=cit_login).json()["access_token"]
    cit_headers = {"Authorization": f"Bearer {cit_tok}"}
    
    submit_payload = {
        "category": "Water Supply",
        "ward": "Ward 1 (Indiranagar)",
        "description": "No water flow since last Tuesday."
    }
    sub = client.post("/submissions", data=submit_payload, headers=cit_headers).json()
    assert "id" in sub
    submission_id = sub["id"]
    
    # 2. Login as Administrator
    admin_login = {"username": "admin_system", "password": "adminPassword123"}
    admin_tok = client.post("/auth/login", json=admin_login).json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_tok}"}
    
    # 3. Process submission via AI pipeline
    response = client.post(f"/ai/process/{submission_id}", headers=headers)
    assert response.status_code == 200
    res = response.json()
    assert res["submission_id"] == submission_id
    assert "priority" in res
    
    # 4. Process non-existing submission
    response = client.post("/ai/process/invalid_sub_id", headers=headers)
    assert response.status_code == 404
    
    # 5. AI Analysis details (non-existing)
    response = client.get("/ai/analysis/invalid-id-parameter", headers=headers)
    assert response.status_code == 404
    
    # 6. Analytics KPIs
    response = client.get("/analytics", headers=headers)
    assert response.status_code == 200
    
    # 7. AI Assistant Query
    response = client.post("/assistant/query", json={"query": "Show top recommendations"}, headers=headers)
    assert response.status_code == 200
    assert "answer" in response.json()

def test_monitoring_and_recommendation_endpoints(client):
    # 1. Health Endpoint
    response = client.get("/health")
    assert response.status_code == 200
    assert "status" in response.json()
    
    # 2. System Status Endpoint
    response = client.get("/system/status")
    assert response.status_code == 200
    
    # 3. Metrics Endpoint
    response = client.get("/metrics")
    assert response.status_code == 200
    
    # Login as Admin for recommendation endpoint access
    admin_login = {"username": "admin_system", "password": "adminPassword123"}
    admin_tok = client.post("/auth/login", json=admin_login).json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_tok}"}
    
    # 4. Recommendations Endpoint
    response = client.get("/recommendations", headers=headers)
    assert response.status_code == 200

def test_jobs_endpoints(client):
    # Login
    admin_login = {"username": "admin_system", "password": "adminPassword123"}
    admin_tok_res = client.post("/auth/login", json=admin_login)
    assert admin_tok_res.status_code == 200
    admin_tok = admin_tok_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {admin_tok}"}
    
    # 1. Submit job programmatically via the BackgroundJobService
    service = BackgroundJobService()
    job_id = service.create_job(JobType.OCR_JOB)
    assert job_id is not None
    
    # 2. Query job status via API endpoint
    response = client.get(f"/jobs/{job_id}", headers=headers)
    assert response.status_code == 200
    job_info = response.json()
    assert job_info["job_id"] == job_id
    assert job_info["task_type"] == JobType.OCR_JOB.value
    
    # 3. Query non-existing job status
    response = client.get("/jobs/non_existing_job_id", headers=headers)
    assert response.status_code == 404
