# KCD Application - Render Deployment Configuration

This guide provides step-by-step instructions for deploying the KCD application to Render.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [GitHub Repository Setup](#github-repository-setup)
3. [Render Account Setup](#render-account-setup)
4. [Frontend Deployment](#frontend-deployment)
5. [Backend Deployment](#backend-deployment)
6. [Database Setup](#database-setup)
7. [Environment Variables](#environment-variables)
8. [Post-Deployment](#post-deployment)
9. [Monitoring & Troubleshooting](#monitoring--troubleshooting)

---

## Prerequisites

### Requirements
- GitHub account with access to: https://github.com/eoextrainer/kcd.git
- Render account (free or paid): https://render.com
- Git installed locally
- Node.js 18+ (for local testing)
- Python 3.9+ (for local testing)

### Verify Tools
```bash
node --version      # Should be 18.0.0 or higher
npm --version       # Should be 9.0.0 or higher
python --version    # Should be 3.9 or higher
pip --version       # Should be 21.0 or higher
git --version       # Should be 2.25 or higher
```

---

## GitHub Repository Setup

### Step 1: Clone or Verify Repository

If you haven't already cloned the repository:

```bash
git clone https://github.com/eoextrainer/kcd.git
cd kcd
```

If already cloned, verify the remote:

```bash
git remote -v
# Output should show:
# origin  https://github.com/eoextrainer/kcd.git (fetch)
# origin  https://github.com/eoextrainer/kcd.git (push)
```

### Step 2: Verify Branch Structure

```bash
git branch -a
# Should see main branch and other branches
```

### Step 3: Update Remote if Needed

```bash
git remote set-url origin https://github.com/eoextrainer/kcd.git
```

---

## Render Account Setup

### Step 1: Create Render Account

1. Go to https://render.com
2. Click "Sign up"
3. Choose GitHub authentication
4. Authorize Render to access your GitHub account
5. Complete account setup

### Step 2: Connect GitHub Repository

1. Log in to Render Dashboard
2. Click "New +" → "Web Service"
3. Click "Connect a repository"
4. Search for "kcd" repository
5. Click "Connect"

### Step 3: Configure Git Permissions

Render should request permission to access your repository. Grant all permissions:
- Read repository contents
- Create webhooks
- Access deployment keys

---

## Frontend Deployment

### Step 1: Create Frontend Service on Render

1. In Render Dashboard, click "New +" → "Static Site"
2. Select the "kcd" repository
3. Configure as follows:

**Service Settings:**
- Name: `kcd-frontend`
- Root Directory: `frontend`
- Build Command: `npm ci && npm run build`
- Publish Directory: `dist`
- Environment: `Node 18`

### Step 2: Set Environment Variables

In the "Environment" tab, add:

```
VITE_API_BASE_URL=https://kcd-api.onrender.com/api/v1
VITE_APP_ENV=production
```

### Step 3: Deploy

1. Click "Create Static Site"
2. Render will automatically start the build
3. Wait for deployment to complete (~2-3 minutes)
4. Your frontend will be live at: `https://kcd-frontend.onrender.com`

---

## Backend Deployment

### Step 1: Create Backend Service on Render

1. In Render Dashboard, click "New +" → "Web Service"
2. Select the "kcd" repository
3. Configure as follows:

**Service Settings:**
- Name: `kcd-api`
- Root Directory: Leave empty
- Environment: `Python 3`
- Build Command: `cd backend && pip install -r requirements.txt`
- Start Command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000`

### Step 2: Set Environment Variables

In the "Environment" tab, add all required backend variables (see Environment Variables section).

### Step 3: Deploy

1. Click "Create Web Service"
2. Render will start the build
3. Wait for deployment (~3-5 minutes)
4. Your backend will be live at: `https://kcd-api.onrender.com`

---

## Database Setup

### Option 1: Render PostgreSQL Database

1. Click "New +" → "PostgreSQL"
2. Configure database
3. Copy the DATABASE_URL connection string
4. Add to backend environment variables

### Option 2: External PostgreSQL

If using external database (AWS RDS, etc.):
1. Set `DATABASE_URL` environment variable
2. Ensure security groups allow Render IP
3. Run migrations

---

## Environment Variables

### Complete Environment Setup

**Frontend:**
```
VITE_API_BASE_URL=https://kcd-api.onrender.com/api/v1
VITE_APP_ENV=production
```

**Backend:**
```
ENVIRONMENT=production
DATABASE_URL=postgresql://user:pass@host:5432/kcd_db
SECRET_KEY=your-super-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URL=https://kcd-frontend.onrender.com
CORS_ORIGINS=https://kcd-frontend.onrender.com
DEBUG=false
LOG_LEVEL=INFO
```

---

## Post-Deployment

### Step 1: Verify Deployments

**Frontend:**
```bash
curl https://kcd-frontend.onrender.com
```

**Backend:**
```bash
curl https://kcd-api.onrender.com/api/v1/health
```

### Step 2: Test Application Flow

1. Go to https://kcd-frontend.onrender.com
2. Try logging in with demo credentials
3. Test different features
4. Verify all works correctly

---

## Monitoring & Troubleshooting

### Common Issues

**Issue 1: Frontend Shows Blank Page**
- Check browser console for errors
- Verify VITE_API_BASE_URL is correct
- Ensure backend is running

**Issue 2: Backend Returns 503**
- Check backend logs in Render Dashboard
- Usually database connection issue
- Verify DATABASE_URL environment variable

**Issue 3: CORS Errors**
- Update CORS_ORIGINS in backend
- Restart backend service

**Issue 4: Database Connection Timeout**
- Verify DATABASE_URL is correct
- Test connection: `psql $DATABASE_URL`

---

## Scaling & Optimization

### Frontend Scaling
- Static site automatically cached on CDN
- No database calls needed

### Backend Scaling
- Upgrade instance type for more traffic
- Enable auto-scaling if available
- Monitor database connections

---

## Continuous Deployment

### Automatic Deployments

Render automatically deploys when you push to main branch:

```bash
git add .
git commit -m "Update: Description"
git push origin main
```

---

**Render Deployment Guide Complete**
**Status: Ready for Production**
