#!/usr/bin/env python
"""
Database seeding script for KCD Platform

This script creates test users and their workspaces in the database.
Run with: python seed_database.py
"""

import sys
import os
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy.orm import Session
from app.db.database import engine, SessionLocal, init_db
from app.models.user import Base, User, Workspace
from app.services.user_service import UserService

# Test users configuration
TEST_USERS = [
    {
        "email": "admin@kcd-agency.com",
        "password": "admin123",
        "full_name": "System Admin",
        "role": "admin",
        "subscription_tier": "admin",
        "is_verified": True,
    },
    {
        "email": "manager@kcd-agency.com",
        "password": "manager123",
        "full_name": "Platform Admin",
        "role": "manager",
        "subscription_tier": "manager",
        "is_verified": True,
    },
    {
        "email": "moderator@kcd-agency.com",
        "password": "moderator123",
        "full_name": "Platform Moderator",
        "role": "moderator",
        "subscription_tier": "moderator",
        "is_verified": True,
    },
    {
        "email": "user1@kcd-agency.com",
        "password": "user1premium",
        "full_name": "User One",
        "role": "user",
        "subscription_tier": "premium",
        "is_verified": True,
    },
    {
        "email": "user2@kcd-agency.com",
        "password": "user2normal",
        "full_name": "User Two",
        "role": "user",
        "subscription_tier": "free",
        "is_verified": False,
    },
    {
        "email": "demo@kcd-agency.com",
        "password": "demo123",
        "full_name": "Demo User",
        "role": "user",
        "subscription_tier": "demo",
        "is_verified": False,
    },
]

# Workspace templates by role
WORKSPACE_TEMPLATES = {
    "admin": {
        "workspace_name": "System Atelier",
        "workspace_description": "Gouvernance de la plateforme et supervision globale",
        "theme": "aura",
        "widgets": [
            "platform_health",
            "talent_registry",
            "casting_pipeline",
            "compliance_review",
            "risk_alerts",
            "partner_access",
        ]
    },
    "manager": {
        "workspace_name": "Platform Direction",
        "workspace_description": "Pilotage des opérations et des équipes",
        "theme": "aura",
        "widgets": [
            "portfolio_approvals",
            "booking_flow",
            "client_briefs",
            "content_standards",
            "team_overview",
        ]
    },
    "moderator": {
        "workspace_name": "Moderation Studio",
        "workspace_description": "Qualité, conformité et sécurité des contenus",
        "theme": "aura",
        "widgets": [
            "content_review",
            "flagged_profiles",
            "photo_rights",
            "feedback_queue",
        ]
    },
    "premium": {
        "workspace_name": "Premium Model Studio",
        "workspace_description": "Outils avancés pour portfolios et castings",
        "theme": "aura",
        "widgets": [
            "portfolio_editor",
            "casting_invites",
            "brand_deals",
            "analytics",
            "availability_calendar",
        ]
    },
    "free": {
        "workspace_name": "Model Workspace",
        "workspace_description": "Gérez votre book et votre présence",
        "theme": "aura",
        "widgets": [
            "portfolio_overview",
            "applications",
            "messages",
            "notifications",
        ]
    },
    "demo": {
        "workspace_name": "Demo Atelier",
        "workspace_description": "Découverte guidée de l’écosystème",
        "theme": "aura",
        "widgets": [
            "guided_tour",
            "sample_portfolio",
            "sample_castings",
        ]
    },
}

def clear_existing_data(db: Session):
    """Clear existing users and workspaces"""
    print("Clearing existing data...")
    try:
        db.query(Workspace).delete()
        db.query(User).delete()
        db.commit()
        print("✓ Existing data cleared")
    except Exception as e:
        print(f"⚠ Error clearing data: {e}")
        db.rollback()

def create_seed_users(db: Session):
    """Create seed users and their workspaces"""
    print("\n" + "="*60)
    print("SEEDING DATABASE WITH TEST USERS")
    print("="*60 + "\n")
    
    # Initialize database tables
    print("Creating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created\n")
    
    # Clear existing data
    clear_existing_data(db)
    
    # Create test users
    created_users = []
    print("Creating test users...\n")
    
    for user_data in TEST_USERS:
        try:
            # Check if user already exists
            existing_user = UserService.get_user_by_email(db, user_data["email"])
            if existing_user:
                print(f"⚠ User {user_data['email']} already exists, skipping")
                continue
            
            # Hash password and create user
            hashed_password = UserService.hash_password(user_data["password"])
            
            user = User(
                email=user_data["email"],
                hashed_password=hashed_password,
                full_name=user_data["full_name"],
                role=user_data["role"],
                subscription_tier=user_data["subscription_tier"],
                is_active=True,
                is_verified=user_data.get("is_verified", False),
            )
            
            db.add(user)
            db.flush()  # Flush to get the ID
            
            # Get workspace template
            role_key = user_data["role"]
            tier_key = user_data.get("subscription_tier", "free")
            template_key = tier_key if role_key == "user" else role_key
            workspace_config = WORKSPACE_TEMPLATES.get(
                template_key,
                WORKSPACE_TEMPLATES["free"],
            ).copy()
            
            # Create workspace for user
            workspace = Workspace(
                user_id=user.id,
                user_email=user.email,
                role=user_data["role"],
                **workspace_config
            )
            
            db.add(workspace)
            db.commit()
            
            created_users.append(user)
            print(f"✓ Created user: {user_data['email']}")
            print(f"  - Role: {user_data['role']}")
            print(f"  - Tier: {user_data['subscription_tier']}")
            print(f"  - Workspace: {workspace_config['workspace_name']}")
            print(f"  - Theme: {workspace_config['theme']}\n")
            
        except Exception as e:
            print(f"✗ Error creating user {user_data['email']}: {e}\n")
            db.rollback()
    
    return created_users

def display_test_credentials():
    """Display test user credentials"""
    print("\n" + "="*60)
    print("TEST USER CREDENTIALS")
    print("="*60 + "\n")
    
    for user_data in TEST_USERS:
        print(f"Email:    {user_data['email']}")
        print(f"Password: {user_data['password']}")
        print(f"Role:     {user_data['role']}")
        print(f"Tier:     {user_data['subscription_tier']}")
        print()

def main():
    """Main seeding function"""
    try:
        db = SessionLocal()
        
        # Create users
        users = create_seed_users(db)
        
        # Display summary
        print("\n" + "="*60)
        print("SEEDING COMPLETE")
        print("="*60)
        print(f"\nTotal users created: {len(users)}")
        
        # Display credentials
        display_test_credentials()
        
        print("\n" + "="*60)
        print("NEXT STEPS:")
        print("="*60)
        print("\n1. Start the backend server:")
        print("   cd backend && python -m uvicorn app.main:app --reload\n")
        print("2. Test the login endpoint:")
        print("   POST http://localhost:8000/api/v1/auth/login")
        print("   Body: {\"email\": \"admin@kcd-agency.com\", \"password\": \"admin123\"}\n")
        print("3. Use the returned token in Authorization header:")
        print("   Authorization: Bearer <token>\n")
        
        db.close()
        
    except Exception as e:
        print(f"\n✗ Fatal error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
