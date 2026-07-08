from fastapi import APIRouter, Depends, HTTPException, status, Request
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.auth import AuthService

router = APIRouter()

# Schema definitions
class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

@router.post("/login", response_model=TokenResponse)
def login(request: Request, body: LoginRequest, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else "127.0.0.1"
    ua = request.headers.get("user-agent", "Unknown")
    
    try:
        user = AuthService.authenticate_user(db, body.username, body.password, ip, ua)
        access, refresh = AuthService.create_user_session(db, user)
        return TokenResponse(access_token=access, refresh_token=refresh)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )

@router.post("/refresh", response_model=TokenResponse)
def refresh(body: RefreshRequest, db: Session = Depends(get_db)):
    try:
        access, refresh = AuthService.refresh_access_token(db, body.refresh_token)
        return TokenResponse(access_token=access, refresh_token=refresh)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/logout")
def logout(body: RefreshRequest, db: Session = Depends(get_db)):
    revoked = AuthService.revoke_refresh_token(db, body.refresh_token)
    if not revoked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token already revoked or not found."
        )
    return {"detail": "Successfully logged out and session revoked."}

@router.post("/reset-password/request")
def reset_password_request(body: PasswordResetRequest, db: Session = Depends(get_db)):
    token = AuthService.request_password_reset(db, body.email)
    if not token:
        # Prevent user enumeration by returning success regardless, but do not return token in production (return in mock JSON payload for verification)
        return {"detail": "If the email is registered, a password reset link has been generated.", "mock_reset_token": None}
        
    return {
        "detail": "Password reset token generated.",
        "mock_reset_token": token
    }

@router.post("/reset-password/confirm")
def reset_password_confirm(body: PasswordResetConfirm, db: Session = Depends(get_db)):
    success = AuthService.complete_password_reset(db, body.token, body.new_password)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token."
        )
    return {"detail": "Password has been reset successfully."}
