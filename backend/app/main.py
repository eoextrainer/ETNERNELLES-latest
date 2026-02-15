"""
KCD Application - FastAPI main application entry point
"""
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import asyncio
from dotenv import load_dotenv
from pathlib import Path
from sqlalchemy import text

from app.api import auth, users, workspaces
from app.api import chat, portfolio
from app.db.database import init_db, SessionLocal

# Load environment variables
ROOT_DIR = Path(__file__).resolve().parents[2]
load_dotenv(dotenv_path=ROOT_DIR / ".env", override=True)

# Create FastAPI app
app = FastAPI(
    title="KCD API",
    description="KCD Platform API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
cors_env = os.getenv("CORS_ORIGINS", "").strip()
if cors_env:
    CORS_ORIGINS = [origin.strip() for origin in cors_env.split(",") if origin.strip()]
else:
    CORS_ORIGINS = ["*"]
CORS_ALLOW_CREDENTIALS = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=CORS_ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origin_regex=".*",
)

async def self_heal_loop():
    """Best-effort self-healing loop to keep core services ready."""
    while True:
        try:
            init_db()
            with SessionLocal() as db:
                db.execute(text("SELECT 1"))
            UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        except Exception as exc:
            print(f"Self-heal check failed: {exc}")
        await asyncio.sleep(10)

# Health check endpoint
@app.get("/api/v1/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "KCD API",
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "KCD API",
        "docs": "/docs",
        "health": "/api/v1/health"
    }

# API v1 routes
@app.get("/api/v1")
async def api_root():
    """API v1 root"""
    return {
        "message": "KCD API v1",
        "endpoints": {
            "health": "/api/v1/health",
            "docs": "/docs"
        }
    }

# Include API routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(workspaces.router)
app.include_router(chat.router)
app.include_router(portfolio.router)

# Static uploads
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

@app.on_event("startup")
async def start_self_heal():
    asyncio.create_task(self_heal_loop())

# Error handlers
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Global exception handler"""
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "message": str(exc)
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True
    )
