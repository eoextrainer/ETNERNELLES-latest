"""
Chat routes for real-time and persisted messaging
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, HTTPException, status, Header
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import ChatMessage, User
from app.schemas.user_schema import ChatMessageCreate, ChatMessageResponse
from app.services.user_service import UserService

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])


class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            await connection.send_json(message)


manager = ConnectionManager()


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


@router.get("/messages", response_model=List[ChatMessageResponse])
async def get_messages(
    channel: str = "community",
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    if authorization:
        get_user_from_token(None, db, authorization=authorization)
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.channel == channel)
        .order_by(ChatMessage.created_at.asc())
        .limit(200)
        .all()
    )
    return [ChatMessageResponse.from_orm(msg) for msg in messages]


@router.post("/messages", response_model=ChatMessageResponse)
async def post_message(
    payload: ChatMessageCreate,
    token: Optional[str] = None,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
):
    user = get_user_from_token(token, db, authorization=authorization)
    message = ChatMessage(
        user_id=user.id,
        user_name=user.full_name or user.email,
        channel=payload.channel,
        content=payload.content,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    response = ChatMessageResponse.from_orm(message)
    await manager.broadcast(response.dict())
    return response


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: Optional[str] = None):
    db = next(get_db())
    try:
        get_user_from_token(token, db)
        await manager.connect(websocket)
        while True:
            data = await websocket.receive_json()
            channel = data.get("channel", "community")
            content = data.get("content", "").strip()
            if not content:
                continue
            user = get_user_from_token(token, db)
            message = ChatMessage(
                user_id=user.id,
                user_name=user.full_name or user.email,
                channel=channel,
                content=content,
            )
            db.add(message)
            db.commit()
            db.refresh(message)
            await manager.broadcast(ChatMessageResponse.from_orm(message).dict())
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    finally:
        db.close()
