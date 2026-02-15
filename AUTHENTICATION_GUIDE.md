# KCD Platform - Authentication & User Management

## Overview

This document describes the complete authentication system and user management infrastructure for the KCD Platform.

## Architecture

### Backend Components

#### 1. **User Service** (`backend/app/services/user_service.py`)
Handles all user-related business logic:
- Password hashing using bcrypt
- JWT token generation and verification
- User lookup and authentication
- Workspace creation for users

**Key Methods:**
- `hash_password(password)` - Hash user passwords
- `verify_password(plain, hashed)` - Verify password against hash
- `create_access_token(data, expires_delta)` - Create JWT token
- `verify_token(token)` - Verify JWT token validity
- `authenticate_user(db, email, password)` - Full authentication flow
- `create_user(db, user_data)` - Create new user
- `get_user_by_email(db, email)` - Lookup user by email

#### 2. **Authentication Routes** (`backend/app/api/auth.py`)
REST endpoints for authentication:

**POST `/api/v1/auth/login`**
- Request body:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- Response:
  ```json
  {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "User Name",
      "role": "admin",
      "subscription_tier": "brand"
    }
  }
  ```

#### 3. **User Routes** (`backend/app/api/users.py`)
REST endpoints for user management:

**POST `/api/v1/users`** - Create new user
- Request:
  ```json
  {
    "email": "new@example.com",
    "password": "password123",
    "full_name": "New User",
    "role": "user"
  }
  ```

**GET `/api/v1/users/me`** - Get current authenticated user
- Requires: `Authorization: Bearer <token>`
- Returns user profile

**GET `/api/v1/users/{user_id}`** - Get user by ID
- Requires: `Authorization: Bearer <token>`

**GET `/api/v1/users/{user_id}/workspace`** - Get user's workspace
- Requires: `Authorization: Bearer <token>`

#### 4. **Database Models** (`backend/app/models/user.py`)

**User Model:**
```python
- id: Integer (Primary Key)
- email: String (Unique)
- hashed_password: String
- full_name: String
- role: String (admin, community_admin, moderator, brand, user, guest)
- is_active: Boolean (default: True)
- is_verified: Boolean (default: False)
- subscription_tier: String (free, premium, brand)
- created_at: DateTime
- updated_at: DateTime
- last_login: DateTime (nullable)
- avatar_url: String (nullable)
- bio: String (nullable)
- metadata: JSON (default: {})
```

**Workspace Model:**
```python
- id: Integer (Primary Key)
- user_id: Integer (Foreign Key)
- user_email: String
- role: String
- workspace_name: String
- workspace_description: String
- theme: String (dark, light, netflix, brand)
- widgets: JSON Array
- layout: JSON
- created_at: DateTime
- updated_at: DateTime
```

#### 5. **Database Seeding** (`backend/seed_database.py`)
Script to populate the database with test users and workspaces.

**Test Users Created:**

1. **Sys Admin**
  - Email: `admin@kcd-agency.com`
  - Password: `admin123`
  - Role: `admin`
  - Tier: `admin`
  - Workspace: System Atelier (platform_health, talent_registry, casting_pipeline, compliance_review, risk_alerts, partner_access)

2. **Platform Admin**
  - Email: `manager@kcd-agency.com`
  - Password: `manager123`
  - Role: `manager`
  - Tier: `manager`
  - Workspace: Platform Direction (portfolio_approvals, booking_flow, client_briefs, content_standards, team_overview)

3. **Moderator**
  - Email: `moderator@kcd-agency.com`
  - Password: `moderator123`
  - Role: `moderator`
  - Tier: `moderator`
  - Workspace: Moderation Studio (content_review, flagged_profiles, photo_rights, feedback_queue)

4. **Premium User**
  - Email: `user1@kcd-agency.com`
  - Password: `user1premium`
  - Role: `user`
  - Tier: `premium`
  - Workspace: Premium Model Studio (portfolio_editor, casting_invites, brand_deals, analytics, availability_calendar)

5. **Normal User**
  - Email: `user2@kcd-agency.com`
  - Password: `user2normal`
  - Role: `user`
  - Tier: `free`
  - Workspace: Model Workspace (portfolio_overview, applications, messages, notifications)

6. **Demo User**
  - Email: `demo@kcd-agency.com`
  - Password: `demo123`
  - Role: `user`
  - Tier: `demo`
  - Workspace: Demo Atelier (guided_tour, sample_portfolio, sample_castings)

## Running the System

### 1. Local Development

**Install dependencies:**
```bash
cd backend
pip install -r requirements.txt
```

**Create database and seed users:**
```bash
python seed_database.py
```

**Start the backend server:**
```bash
python -m uvicorn app.main:app --reload
```

Server will run at `http://localhost:8000`

**API Documentation:**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 2. Testing the API

**Login Example (curl):**
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@kcd-agency.com",
    "password": "admin123"
  }'
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "admin@kcd-agency.com",
    "full_name": "Admin User",
    "role": "admin",
    "subscription_tier": "brand"
  }
}
```

**Get Current User:**
```bash
curl -X GET "http://localhost:8000/api/v1/users/me" \
  -H "Authorization: Bearer <your_access_token>"
```

### 3. Production Deployment (Render)

**Environment Variables Required:**
```
DATABASE_URL=postgresql://user:password@host:port/database
SECRET_KEY=your-production-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URL=https://your-frontend.render.com
CORS_ORIGINS=https://your-frontend.render.com
```

**Deploy Process:**
1. Update `.env` with production values
2. Commit and push to GitHub
3. Render will automatically:
   - Build Docker image
   - Install dependencies
   - Run the application
   - Initialize database

**Run seed script on Render:**
```bash
# In Render Shell
python seed_database.py
```

## Security Considerations

1. **Password Hashing:** Uses bcrypt with salt
2. **JWT Tokens:** Signed with SECRET_KEY, expires in 30 minutes
3. **CORS:** Configured to allow only trusted origins
4. **User Verification:** Email verification flag (currently admin verified by default)
5. **Environment Variables:** Secrets never hardcoded

## Frontend Integration

### 1. Store Login Token

After successful login, store the token:
```javascript
const response = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const data = await response.json();
localStorage.setItem('access_token', data.access_token);
localStorage.setItem('user', JSON.stringify(data.user));
```

### 2. Use Token in Requests

```javascript
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('access_token')}`
};
const response = await fetch('/api/v1/users/me', { headers });
```

### 3. Handle Token Expiration

When token expires (401 response):
- Clear localStorage
- Redirect to login page
- Prompt user to re-authenticate

## Next Steps

1. **Frontend Integration:**
   - Connect LoginPage component to `/api/v1/auth/login`
   - Implement AuthContext for token management
   - Add token refresh mechanism

2. **Workspace Endpoints:**
   - CRUD operations for workspaces
   - Workspace customization (theme, widgets)
   - Role-based widget filtering

3. **Advanced Features:**
   - Email verification
   - Password reset functionality
   - Profile customization
   - User roles and permissions

## File Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication routes
│   │   └── users.py         # User management routes
│   ├── models/
│   │   └── user.py          # User and Workspace models
│   ├── services/
│   │   ├── __init__.py
│   │   └── user_service.py  # User business logic
│   ├── schemas/
│   │   └── user_schema.py   # Pydantic schemas
│   ├── db/
│   │   └── database.py      # Database configuration
│   ├── main.py              # FastAPI app entry point
│   └── __init__.py
├── seed_database.py         # Database seeding script
├── requirements.txt         # Python dependencies
├── .env                     # Local environment variables
└── .env.example             # Template for environment variables
```

## Troubleshooting

### Issue: "Invalid email or password"
- Verify email and password are correct
- Check user exists in database
- Ensure database was seeded with `python seed_database.py`

### Issue: "Token expired"
- User needs to login again
- Token expires after 30 minutes
- Clear localStorage and redirect to login

### Issue: "CORS error"
- Check CORS_ORIGINS environment variable
- Ensure frontend URL is in CORS_ORIGINS list
- Reload page after changing CORS settings

### Issue: "User not found"
- Ensure user exists in database
- Check email spelling
- Run seed script if database is empty

## Support

For issues or questions:
1. Check the documentation above
2. Review code comments in source files
3. Check Render logs for deployment issues
4. Test API endpoints using Swagger UI at `/docs`
