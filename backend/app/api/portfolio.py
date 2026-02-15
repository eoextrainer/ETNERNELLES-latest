"""
Portfolio media routes
"""
import os
import mimetypes
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status, Header
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.database import get_db
from app.models.user import MediaAsset, User
from app.schemas.user_schema import MediaAssetResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/api/v1/portfolio", tags=["portfolio"])

ROOT_DIR = Path(__file__).resolve().parents[3]
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MAX_UPLOAD_BYTES = 50 * 1024 * 1024
ALLOWED_IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
ALLOWED_VIDEO_EXT = {".mp4", ".mov", ".webm", ".m4v"}


def get_user_from_token(token: Optional[str], db: Session, authorization: Optional[str] = None) -> User:
    if not token and authorization:
        try:
            scheme, value = authorization.split()
            if scheme.lower() == "bearer":
                token = value
        except ValueError:
            pass
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    payload = UserService.verify_token(token)
    if payload is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.get("/me", response_model=List[MediaAssetResponse])
async def get_my_assets(
    token: Optional[str] = None,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    user = get_user_from_token(token, db, authorization=authorization)
    assets = (
        db.query(MediaAsset)
        .filter(MediaAsset.user_id == user.id)
        .order_by(MediaAsset.created_at.desc())
        .all()
    )
    return [MediaAssetResponse.from_orm(asset) for asset in assets]


@router.post("/upload", response_model=MediaAssetResponse)
async def upload_asset(
    file: UploadFile = File(...),
    token: Optional[str] = None,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    user = get_user_from_token(token, db, authorization=authorization)
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No file uploaded")

    file_ext = Path(file.filename).suffix.lower()
    guessed_ext = mimetypes.guess_extension(file.content_type or "") or ""
    if not file_ext and guessed_ext:
        file_ext = guessed_ext

    is_video = (file.content_type or "").startswith("video") or file_ext in ALLOWED_VIDEO_EXT
    is_image = (file.content_type or "").startswith("image") or file_ext in ALLOWED_IMAGE_EXT
    if not is_video and not is_image:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported file type")

    file_type = "video" if is_video else "image"

    safe_name = f"{user.id}_{int(datetime.utcnow().timestamp())}{file_ext}"
    file_path = UPLOAD_DIR / safe_name

    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large")
    with open(file_path, "wb") as f:
        f.write(content)

    file_url = f"/uploads/{safe_name}"

    asset = MediaAsset(
        user_id=user.id,
        file_url=file_url,
        file_type=file_type,
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)

    return MediaAssetResponse.from_orm(asset)
