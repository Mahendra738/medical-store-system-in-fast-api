from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.db.session import get_db

from app.dependencies.auth import (
    require_admin_or_manager,
    require_staff_or_above,
)

from app.models.user import User

from app.schemas.medicine import (
    MedicineCreate,
    MedicineResponse,
    MedicineUpdate,
    StockReduceRequest,
)

from app.services.medicine_service import (
    create_new_medicine,
    deactivate_medicine,
    edit_medicine,
    get_all_medicine_list,
    get_medicine,
    reduce_medicine_stock,
    search_medicines,
)

router = APIRouter()


@router.post(
    "/",
    response_model=MedicineResponse,
)
def create_medicine(
    medicine: MedicineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_above),
):
    return create_new_medicine(
        db,
        medicine,
    )


@router.get(
    "/",
    response_model=list[MedicineResponse],
)
def get_medicines(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_above),
):
    return get_all_medicine_list(db)


@router.get(
    "/search",
    response_model=list[MedicineResponse],
)
def search_medicine(
    name: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_above),
):
    return search_medicines(
        db,
        name,
    )


@router.post(
    "/{medicine_id}/reduce-stock",
    response_model=MedicineResponse,
)
def reduce_stock(
    medicine_id: int,
    stock_data: StockReduceRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_above),
):
    return reduce_medicine_stock(
        db,
        medicine_id,
        stock_data.quantity,
    )


@router.get(
    "/{medicine_id}",
    response_model=MedicineResponse,
)
def get_single_medicine(
    medicine_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_above),
):
    return get_medicine(
        db,
        medicine_id,
    )


@router.put(
    "/{medicine_id}",
    response_model=MedicineResponse,
)
def update_medicine(
    medicine_id: int,
    medicine: MedicineUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_above),
):
    return edit_medicine(
        db,
        medicine_id,
        medicine,
    )


@router.delete(
    "/{medicine_id}",
)
def delete_medicine(
    medicine_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_manager),
):
    return deactivate_medicine(
        db,
        medicine_id,
    )