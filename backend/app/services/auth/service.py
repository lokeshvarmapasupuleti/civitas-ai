import logging
from datetime import datetime, timedelta
from typing import Optional, Tuple, List, Dict
from sqlalchemy.orm import Session
from app import models
from app.services.auth.crypto import CryptoHelper
from app.services.auth.jwt_handler import JWTHandler

logger = logging.getLogger("services.auth.service")

# Lockout configurations
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15

# Permission mapping matrix
ROLE_PERMISSIONS: Dict[str, List[str]] = {
    "Citizen": ["submit_grievance", "view_own_grievances", "add_feedback"],
    "Ward Officer": ["submit_grievance", "view_own_grievances", "view_ward_grievances", "schedule_inspection", "update_inspection", "create_work_order"],
    "Department Officer": ["submit_grievance", "view_department_grievances", "update_work_order", "view_analytics"],
    "Municipal Commissioner": ["view_all_grievances", "view_analytics", "approve_budget", "export_reports"],
    "Administrator": ["view_all_grievances", "view_analytics", "approve_budget", "export_reports", "manage_users", "manage_settings"]
}

class AuthService:
    @staticmethod
    def authenticate_user(
        db: Session,
        username: str,
        password: str,
        ip_address: str,
        user_agent: str
    ) -> models.User:
        user = db.query(models.User).filter(models.User.username == username).first()
        if not user:
            raise ValueError("Invalid username or password.")
            
        # 1. Check account lockout state
        if user.lockout_until and user.lockout_until > datetime.utcnow():
            raise ValueError(f"Account locked due to multiple failed login attempts. Try again after {user.lockout_until.strftime('%H:%M:%S UTC')}.")

        # 2. Check password
        is_valid = CryptoHelper.verify_password(password, user.hashed_password)
        
        if is_valid:
            # Clear failed attempts, update history
            user.failed_login_attempts = 0
            user.lockout_until = None
            
            history = models.LoginHistory(
                user_id=user.id,
                ip_address=ip_address,
                user_agent=user_agent,
                status="Success"
            )
            db.add(history)
            db.commit()
            db.refresh(user)
            return user
        else:
            # Increment failed attempts
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
                user.lockout_until = datetime.utcnow() + timedelta(minutes=LOCKOUT_MINUTES)
                logger.warning(f"User account '{username}' locked out due to {user.failed_login_attempts} failed attempts.")
                
            history = models.LoginHistory(
                user_id=user.id,
                ip_address=ip_address,
                user_agent=user_agent,
                status="Failed"
            )
            db.add(history)
            db.commit()
            raise ValueError("Invalid username or password.")

    @staticmethod
    def create_user_session(db: Session, user: models.User) -> Tuple[str, str]:
        # Create Access + Refresh tokens
        payload = {"sub": user.username, "role": user.role.name}
        access_token = JWTHandler.create_access_token(payload)
        refresh_token = JWTHandler.create_refresh_token(payload)
        
        # Save refresh token in database
        expires_at = datetime.utcnow() + timedelta(days=7)
        session = models.UserSession(
            user_id=user.id,
            refresh_token=refresh_token,
            expires_at=expires_at
        )
        db.add(session)
        db.commit()
        return access_token, refresh_token

    @staticmethod
    def revoke_refresh_token(db: Session, refresh_token: str) -> bool:
        session = db.query(models.UserSession).filter(
            models.UserSession.refresh_token == refresh_token,
            models.UserSession.is_revoked == False
        ).first()
        if not session:
            return False
            
        session.is_revoked = True
        db.commit()
        return True

    @staticmethod
    def refresh_access_token(db: Session, refresh_token: str) -> Tuple[str, str]:
        # Validate refresh token structure
        try:
            payload = JWTHandler.decode_token(refresh_token)
            username = payload.get("sub")
            token_type = payload.get("type")
            jti = payload.get("jti")
            
            if username is None or token_type != "refresh":
                raise ValueError("Invalid token type.")
        except Exception as e:
            raise ValueError(f"Invalid refresh token: {str(e)}")
            
        # Verify in database session records
        session = db.query(models.UserSession).filter(
            models.UserSession.refresh_token == refresh_token,
            models.UserSession.is_revoked == False,
            models.UserSession.expires_at > datetime.utcnow()
        ).first()
        
        if not session:
            raise ValueError("Refresh token expired or revoked.")
            
        # Revoke old refresh token (rotate refresh tokens)
        session.is_revoked = True
        
        # Resolve user
        user = session.user
        if not user or not user.is_active:
            db.commit()
            raise ValueError("User inactive or deleted.")
            
        # Create new session set
        new_access_token, new_refresh_token = AuthService.create_user_session(db, user)
        return new_access_token, new_refresh_token

    @staticmethod
    def request_password_reset(db: Session, email: str) -> Optional[str]:
        # Simple mock password reset token returning
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            return None
        # Return a mock token payload
        reset_token = JWTHandler.create_access_token({"sub": user.username, "purpose": "reset"}, expires_delta=timedelta(minutes=15))
        return reset_token

    @staticmethod
    def complete_password_reset(db: Session, token: str, new_password: str) -> bool:
        try:
            payload = JWTHandler.decode_token(token)
            username = payload.get("sub")
            purpose = payload.get("purpose")
            if not username or purpose != "reset":
                return False
        except Exception:
            return False
            
        user = db.query(models.User).filter(models.User.username == username).first()
        if not user or not user.is_active:
            return False
            
        user.hashed_password = CryptoHelper.hash_password(new_password)
        db.commit()
        return True

    @staticmethod
    def seed_roles_and_permissions(db: Session):
        # 1. Seed Permissions
        all_perms = set()
        for perms in ROLE_PERMISSIONS.values():
            all_perms.update(perms)
            
        perm_objs = {}
        for p_name in all_perms:
            p_obj = db.query(models.Permission).filter(models.Permission.name == p_name).first()
            if not p_obj:
                p_obj = models.Permission(name=p_name)
                db.add(p_obj)
            perm_objs[p_name] = p_obj
        db.commit()
        
        # Refresh permission references
        for name, p_obj in perm_objs.items():
            db.refresh(p_obj)

        # 2. Seed Roles
        role_objs = {}
        for r_name, p_list in ROLE_PERMISSIONS.items():
            r_obj = db.query(models.Role).filter(models.Role.name == r_name).first()
            if not r_obj:
                r_obj = models.Role(name=r_name)
                db.add(r_obj)
            role_objs[r_name] = r_obj
            
            # Map permissions to role
            r_obj.permissions = [perm_objs[p] for p in p_list]
        db.commit()

        # Refresh roles references
        for name, r_obj in role_objs.items():
            db.refresh(r_obj)

        # 3. Seed Default Users with secure passwords
        default_users = [
            {"username": "citizen_lokesh", "email": "lokesh@citizen.gov.in", "role": "Citizen", "pwd": "citizenPassword123"},
            {"username": "officer_rajesh", "email": "rajesh@pwd.gov.in", "role": "Ward Officer", "pwd": "officerPassword123"},
            {"username": "dept_officer_priya", "email": "priya@electricity.gov.in", "role": "Department Officer", "pwd": "deptPassword123"},
            {"username": "commissioner_amit", "email": "amit@commissioner.gov.in", "role": "Municipal Commissioner", "pwd": "commissionerPassword123"},
            {"username": "admin_system", "email": "admin@civitas.gov.in", "role": "Administrator", "pwd": "adminPassword123"}
        ]
        
        for u in default_users:
            user_obj = db.query(models.User).filter(models.User.username == u["username"]).first()
            if not user_obj:
                hashed = CryptoHelper.hash_password(u["pwd"])
                user_obj = models.User(
                    username=u["username"],
                    email=u["email"],
                    hashed_password=hashed,
                    role_id=role_objs[u["role"]].id,
                    is_active=True
                )
                db.add(user_obj)
        db.commit()
        logger.info("Roles, permissions, and default users seeded successfully.")
