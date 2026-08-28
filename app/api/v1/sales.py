from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.sale import SaleCreate, SaleResponse
from app.services.sale_service import (
    create_new_sale,
    get_all_sale_list,
    get_sale,
)

router = APIRouter()


@router.post(
    "/",
    response_model=SaleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_sale(
    sale: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_new_sale(
        db,
        sale,
    )


@router.get(
    "/",
    response_model=list[SaleResponse],
)
def get_sales(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_all_sale_list(db)


@router.get(
    "/{sale_id}",
    response_model=SaleResponse,
)
def get_sale_by_id(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_sale(
        db,
        sale_id,
    )