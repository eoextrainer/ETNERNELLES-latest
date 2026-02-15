"""
Database seed script for KCD Platform
Creates test users with different roles and their workspaces
"""
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from dotenv import load_dotenv

# Add backend to path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

# Load environment variables from repo root
ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(dotenv_path=ROOT_DIR / ".env", override=True)

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from sqlalchemy.exc import OperationalError
from passlib.context import CryptContext

# Import models
from app.models.user import Base, User, Workspace

# Database configuration - Use SQLite by default for local development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./kcd.db")
if DATABASE_URL.startswith("sqlite:///./"):
    relative_path = DATABASE_URL.replace("sqlite:///./", "")
    DATABASE_URL = f"sqlite:///{(ROOT_DIR / relative_path).as_posix()}"

# Create engine with appropriate configuration
if "sqlite" in DATABASE_URL:
    connect_args = {"check_same_thread": False}
    if DATABASE_URL.endswith(":memory:"):
        engine = create_engine(
            DATABASE_URL,
            connect_args=connect_args,
            poolclass=StaticPool,
        )
    else:
        engine = create_engine(
            DATABASE_URL,
            connect_args=connect_args,
        )
else:
    # For PostgreSQL, try with default credentials first
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# Password hashing with argon2
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a password using argon2"""
    return pwd_context.hash(password)

# User data to seed
USERS_DATA = [
    {
        "email": "admin@kcd-agency.com",
        "password": "admin123",
        "full_name": "System Admin",
        "role": "admin",
        "is_active": True,
        "is_verified": True,
        "subscription_tier": "admin",
    },
    {
        "email": "manager@kcd-agency.com",
        "password": "manager123",
        "full_name": "Platform Admin",
        "role": "manager",
        "is_active": True,
        "is_verified": True,
        "subscription_tier": "manager",
    },
    {
        "email": "moderator@kcd-agency.com",
        "password": "moderator123",
        "full_name": "Platform Moderator",
        "role": "moderator",
        "is_active": True,
        "is_verified": True,
        "subscription_tier": "moderator",
    },
    {
        "email": "user1@kcd-agency.com",
        "password": "user1premium",
        "full_name": "User One",
        "role": "user",
        "is_active": True,
        "is_verified": True,
        "subscription_tier": "premium",
    },
    {
        "email": "user2@kcd-agency.com",
        "password": "user2normal",
        "full_name": "User Two",
        "role": "user",
        "is_active": True,
        "is_verified": False,
        "subscription_tier": "free",
    },
    {
        "email": "demo@kcd-agency.com",
        "password": "demo123",
        "full_name": "Demo User",
        "role": "user",
        "is_active": True,
        "is_verified": False,
        "subscription_tier": "demo",
    },
]

WORKSPACE_TEMPLATES = {
    "admin": {
        "name": "System Atelier",
        "description": "Gouvernance de la plateforme et supervision globale",
        "widgets": [
            "platform_health",
            "talent_registry",
            "casting_pipeline",
            "compliance_review",
            "risk_alerts",
            "partner_access",
        ],
        "theme": "aura",
    },
    "manager": {
        "name": "Platform Direction",
        "description": "Pilotage des opérations et des équipes",
        "widgets": [
            "portfolio_approvals",
            "booking_flow",
            "client_briefs",
            "content_standards",
            "team_overview",
        ],
        "theme": "aura",
    },
    "moderator": {
        "name": "Moderation Studio",
        "description": "Qualité, conformité et sécurité des contenus",
        "widgets": [
            "content_review",
            "flagged_profiles",
            "photo_rights",
            "feedback_queue",
        ],
        "theme": "aura",
    },
    "premium": {
        "name": "Premium Model Studio",
        "description": "Outils avancés pour portfolios et castings",
        "widgets": [
            "portfolio_editor",
            "casting_invites",
            "brand_deals",
            "analytics",
            "availability_calendar",
        ],
        "theme": "aura",
    },
    "free": {
        "name": "Model Workspace",
        "description": "Gérez votre book et votre présence",
        "widgets": [
            "portfolio_overview",
            "applications",
            "messages",
            "notifications",
        ],
        "theme": "aura",
    },
    "demo": {
        "name": "Demo Atelier",
        "description": "Découverte guidée de l’écosystème",
        "widgets": [
            "guided_tour",
            "sample_portfolio",
            "sample_castings",
        ],
        "theme": "aura",
    },
}

def seed_database():
    """Seed the database with test users and workspaces"""
    print("Starting database seeding...")
    print(f"Database URL: {DATABASE_URL}")
    
    global engine
    
    try:
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)
        print("✓ Database tables created/verified")
    except OperationalError as e:
        print(f"✗ Database connection error: {e}")
        print("  Falling back to SQLite...")
        # Fallback to SQLite
        DATABASE_URL_FALLBACK = "sqlite:///./kcd.db"
        engine = create_engine(
            DATABASE_URL_FALLBACK,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
        )
        Base.metadata.create_all(bind=engine)
        print("✓ Database tables created in SQLite")
    
    # Create session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    created_count = 0
    skipped_count = 0
    
    try:
        # Clear existing data to ensure only the requested users exist
        print("\nClearing existing users and workspaces...")
        db.query(Workspace).delete()
        db.query(User).delete()
        db.commit()
        print("✓ Existing data cleared")

        # Seed users
        print("\nSeeding users...")
        for user_data in USERS_DATA:
            email = user_data["email"]
            
            # Check if user already exists
            existing_user = db.query(User).filter(User.email == email).first()
            if existing_user:
                existing_user.hashed_password = hash_password(user_data["password"])
                existing_user.full_name = user_data["full_name"]
                existing_user.role = user_data["role"]
                existing_user.is_active = user_data["is_active"]
                existing_user.is_verified = user_data["is_verified"]
                existing_user.subscription_tier = user_data.get("subscription_tier", "free")
                user = existing_user
                print(f"↻ Updated user: {email}")
                skipped_count += 1
            else:
                # Create user
                user = User(
                    email=email,
                    hashed_password=hash_password(user_data["password"]),
                    full_name=user_data["full_name"],
                    role=user_data["role"],
                    is_active=user_data["is_active"],
                    is_verified=user_data["is_verified"],
                    subscription_tier=user_data.get("subscription_tier", "free"),
                )
                
                db.add(user)
                db.flush()  # Get the user ID
            
            # Create or update workspace for user
            role = user_data["role"]
            tier = user_data.get("subscription_tier", "free")
            template_key = tier if role == "user" else role
            workspace_template = WORKSPACE_TEMPLATES.get(
                template_key,
                WORKSPACE_TEMPLATES.get("free"),
            )

            workspace = db.query(Workspace).filter(Workspace.user_id == user.id).first()
            if workspace:
                workspace.user_email = email
                workspace.role = role
                workspace.workspace_name = workspace_template["name"]
                workspace.workspace_description = workspace_template["description"]
                workspace.widgets = workspace_template["widgets"]
                workspace.theme = workspace_template["theme"]
                print(f"↻ Updated workspace: {workspace_template['name']} ({workspace_template['theme']} theme)")
            else:
                workspace = Workspace(
                    user_id=user.id,
                    user_email=email,
                    role=role,
                    workspace_name=workspace_template["name"],
                    workspace_description=workspace_template["description"],
                    widgets=workspace_template["widgets"],
                    theme=workspace_template["theme"],
                )
                db.add(workspace)
                print(f"✓ Created user: {email} ({user.role})")
                print(f"  └─ Workspace: {workspace_template['name']} ({workspace_template['theme']} theme)")
                created_count += 1
        
        # Commit all changes
        db.commit()
        
        print("\n" + "="*70)
        print("SEED SUMMARY")
        print("="*70)
        print(f"✓ Users created: {created_count}")
        print(f"⊘ Users skipped (already exist): {skipped_count}")
        print(f"✓ Workspaces created: {created_count}")
        
        print("\n" + "="*70)
        print("TEST CREDENTIALS")
        print("="*70)
        for user_data in USERS_DATA:
            print(f"Email: {user_data['email']:<35} Password: {user_data['password']}")
        
        print("\n" + "="*70)
        print("✓ Database seeding completed successfully!")
        print("="*70)
        
    except Exception as e:
        db.rollback()
        print(f"\n✗ Error during seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
