"""
Workspace management routes
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.user_schema import WorkspaceResponse, WorkspaceUpdate
from app.models.user import Workspace
from app.api.users import get_current_user

router = APIRouter(prefix="/api/v1/workspaces", tags=["workspaces"])

@router.get("/me", response_model=WorkspaceResponse)
async def get_my_workspace(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
) -> WorkspaceResponse:
    """Get current user's workspace"""
    workspace = db.query(Workspace).filter(Workspace.user_id == current_user.id).first()
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found",
        )

    return WorkspaceResponse(
        id=workspace.id,
        user_id=workspace.user_id,
        role=workspace.role,
        workspace_name=workspace.workspace_name,
        workspace_description=workspace.workspace_description,
        theme=workspace.theme,
        widgets=workspace.widgets,
        created_at=workspace.created_at,
        updated_at=workspace.updated_at,
    )

@router.put("/me", response_model=WorkspaceResponse)
async def update_my_workspace(
    workspace_update: WorkspaceUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
) -> WorkspaceResponse:
    """Update current user's workspace"""
    workspace = db.query(Workspace).filter(Workspace.user_id == current_user.id).first()
    if not workspace:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found",
        )

    update_data = workspace_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(workspace, key, value)

    db.commit()
    db.refresh(workspace)

    return WorkspaceResponse(
        id=workspace.id,
        user_id=workspace.user_id,
        role=workspace.role,
        workspace_name=workspace.workspace_name,
        workspace_description=workspace.workspace_description,
        theme=workspace.theme,
        widgets=workspace.widgets,
        created_at=workspace.created_at,
        updated_at=workspace.updated_at,
    )
