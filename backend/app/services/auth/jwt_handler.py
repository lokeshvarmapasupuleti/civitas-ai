import os
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from app import models

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "civitas_platform_sec_key_2026_goi_nic")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

class JWTHandler:
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            
        jti = str(uuid.uuid4())
        to_encode.update({"exp": expire, "type": "access", "jti": jti})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
            
        jti = str(uuid.uuid4())
        to_encode.update({"exp": expire, "type": "refresh", "jti": jti})
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

    @staticmethod
    def decode_token(token: str) -> dict:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError as e:
            raise ValueError(f"Invalid token: {str(e)}")

    @staticmethod
    def revoke_jti(db: Session, jti: str, expires_at: datetime) -> bool:
        # Check if already blacklisted
        exists = db.query(models.TokenBlacklist).filter(models.TokenBlacklist.jti == jti).first()
        if exists:
            return True
            
        blacklisted = models.TokenBlacklist(jti=jti, expires_at=expires_at)
        db.add(blacklisted)
        db.commit()
        return True

    @staticmethod
    def is_jti_revoked(db: Session, jti: str) -> bool:
        record = db.query(models.TokenBlacklist).filter(models.TokenBlacklist.jti == jti).first()
        return record is not None
