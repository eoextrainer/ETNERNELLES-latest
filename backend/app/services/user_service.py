"""
User service for authentication and user management
"""
from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from jose import JWTError, jwt
import os
from dotenv import load_dotenv
from pathlib import Path

from app.models.user import User, Workspace
from app.schemas.user_schema import UserCreate, UserLogin, UserResponse

ROOT_DIR = Path(__file__).resolve().parents[3]
load_dotenv(dotenv_path=ROOT_DIR / ".env", override=True)

# Password hashing with argon2 (more secure and no 72-byte limit)
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# JWT configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

class UserService:
    """User management service"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using argon2"""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password using argon2"""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def create_access_token(
        data: dict, 
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                minutes=ACCESS_TOKEN_EXPIRE_MINUTES
            )
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Optional[dict]:
        """Verify JWT token"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            return None
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def create_user(db: Session, user_create: UserCreate) -> User:
        """Create new user"""
        db_user = User(
            email=user_create.email,
            hashed_password=UserService.hash_password(user_create.password),
            full_name=user_create.full_name,
            role=user_create.role,
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """Authenticate user"""
        user = UserService.get_user_by_email(db, email)
        if not user:
            return None
        if not UserService.verify_password(password, user.hashed_password):
            return None
        return user
    
    @staticmethod
    def create_workspace_for_user(
        db: Session, 
        user_id: int, 
        workspace_config: dict
    ) -> Workspace:
        """Create workspace for user"""
        workspace = Workspace(
            user_id=user_id,
            **workspace_config
        )
        db.add(workspace)
        db.commit()
        db.refresh(workspace)
        return workspace
    
    @staticmethod
    def get_user_workspace(db: Session, user_id: int) -> Optional[Workspace]:
        """Get user workspace"""
        return db.query(Workspace).filter(Workspace.user_id == user_id).first()
