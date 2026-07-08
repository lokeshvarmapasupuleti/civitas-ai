import pytest
import tempfile
import os
from datetime import datetime, timedelta
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app import models
from app.services.auth.crypto import CryptoHelper
from app.services.auth.jwt_handler import JWTHandler
from app.services.auth.service import AuthService
from app.services.auth.rbac import PermissionChecker, get_current_user

from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import JSONB

@compiles(JSONB, "sqlite")
def compile_jsonb_sqlite(type_, compiler, **kw):
    return "JSON"


def test_password_cryptography():
    pwd = "GovSecurePassword2026"
    hashed = CryptoHelper.hash_password(pwd)
    
    assert hashed != pwd
    assert CryptoHelper.verify_password(pwd, hashed) is True
    assert CryptoHelper.verify_password("wrong_password", hashed) is False

def test_jwt_generation_and_decoding():
    payload = {"sub": "officer_rajesh", "role": "Ward Officer"}
    token = JWTHandler.create_access_token(payload)
    
    decoded = JWTHandler.decode_token(token)
    assert decoded["sub"] == "officer_rajesh"
    assert decoded["role"] == "Ward Officer"
    assert decoded["type"] == "access"

def test_authentication_rbac_workflow():
    fd, temp_db = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    
    # Configure test database session
    engine = create_engine(f"sqlite:///{temp_db}")
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    try:
        # 1. Seed roles, permissions and default users
        AuthService.seed_roles_and_permissions(db)
        
        # Verify default users seeded
        citizen = db.query(models.User).filter(models.User.username == "citizen_lokesh").first()
        admin = db.query(models.User).filter(models.User.username == "admin_system").first()
        
        assert citizen is not None
        assert citizen.role.name == "Citizen"
        assert admin is not None
        assert admin.role.name == "Administrator"
        
        # 2. Authenticate citizen with correct password
        authenticated_user = AuthService.authenticate_user(
            db, "citizen_lokesh", "citizenPassword123", "192.168.1.50", "Mozilla/Chrome"
        )
        assert authenticated_user.username == "citizen_lokesh"
        assert authenticated_user.failed_login_attempts == 0
        
        # 3. Failed password authentication and lockout check
        with pytest.raises(ValueError, match="Invalid username or password."):
            AuthService.authenticate_user(
                db, "citizen_lokesh", "wrong_pwd", "192.168.1.50", "Mozilla/Chrome"
            )
            
        # Attempts increment
        db.refresh(citizen)
        assert citizen.failed_login_attempts == 1
        
        # Fail 4 more times to trigger lockout
        for _ in range(4):
            try:
                AuthService.authenticate_user(db, "citizen_lokesh", "wrong_pwd", "192.168.1.50", "Mozilla/Chrome")
            except ValueError:
                pass
                
        db.refresh(citizen)
        assert citizen.failed_login_attempts == 5
        assert citizen.lockout_until is not None
        
        # Try logging in while locked out
        with pytest.raises(ValueError, match="Account locked"):
            AuthService.authenticate_user(db, "citizen_lokesh", "citizenPassword123", "192.168.1.50", "Mozilla/Chrome")
            
        # 4. Session management and Refresh token rotation
        access, refresh = AuthService.create_user_session(db, admin)
        assert access is not None
        assert refresh is not None
        
        # Refresh access token
        new_access, new_refresh = AuthService.refresh_access_token(db, refresh)
        assert new_access is not None
        assert new_refresh is not None
        assert new_refresh != refresh # rotated
        
        # Try refreshing with old refresh token (should fail as it is now revoked)
        with pytest.raises(ValueError, match="Refresh token expired or revoked."):
            AuthService.refresh_access_token(db, refresh)
            
        # 5. Revocation & Token Blacklist
        payload = JWTHandler.decode_token(new_access)
        jti = payload["jti"]
        exp = datetime.utcfromtimestamp(payload["exp"])
        
        # Revoke the access token JTI
        JWTHandler.revoke_jti(db, jti, exp)
        assert JWTHandler.is_jti_revoked(db, jti) is True
        
        # 6. Password reset flow
        reset_token = AuthService.request_password_reset(db, "amit@commissioner.gov.in")
        assert reset_token is not None
        
        assert AuthService.complete_password_reset(db, reset_token, "newCommissionerPassword123") is True
        
        # Authenticate with new password
        comm_user = AuthService.authenticate_user(
            db, "commissioner_amit", "newCommissionerPassword123", "127.0.0.1", "curl"
        )
        assert comm_user is not None
        
        # 7. Dependency Permission Checker testing
        checker_submit = PermissionChecker("submit_grievance")
        checker_analytics = PermissionChecker("view_analytics")
        
        # Citizen should pass submit check but fail analytics check
        assert checker_submit(citizen) == citizen
        with pytest.raises(HTTPException) as exc_info:
            checker_analytics(citizen)
        assert exc_info.value.status_code == 403
        
        # Admin should pass both (admin bypasses or has permissions mapped)
        assert checker_submit(admin) == admin
        assert checker_analytics(admin) == admin
        
    finally:
        db.close()
        engine.dispose()
        if os.path.exists(temp_db):
            os.remove(temp_db)
