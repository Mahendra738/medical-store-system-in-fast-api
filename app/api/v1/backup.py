from fastapi import APIRouter, Depends, HTTPException

from app.dependencies.auth import require_admin
from app.services.backup_service import create_database_backup


router = APIRouter()


@router.post("/create")
def create_backup(
    current_user=Depends(require_admin),
):
    try:
        return create_database_backup()

    except RuntimeError as exc:
        raise HTTPException(
            status_code=500,
            detail=str(exc),
        )