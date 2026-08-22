from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.medicine import Medicine
from app.repositories.medicine_repository import (
    create_medicine,
    get_all_medicines,
    get_medicine_by_id,
    get_medicine_by_name,
    search_medicines as repository_search_medicines,
    update_medicine,
)
from app.schemas.medicine import (
    MedicineCreate,
    MedicineUpdate,
)


def create_new_medicine(
    db: Session,
    medicine_data: MedicineCreate,
):
    existing_medicine = get_medicine_by_name(
        db,
        medicine_data.name,
    )

    if existing_medicine:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Medicine already exists",
        )

    medicine = Medicine(
        name=medicine_data.name,
        generic_name=medicine_data.generic_name,
        brand_name=medicine_data.brand_name,

        category_id=medicine_data.category_id,

        medicine_type=medicine_data.medicine_type,

        drawer=medicine_data.drawer,

        batch_number=medicine_data.batch_number,
        expiry_date=medicine_data.expiry_date,

        mrp=medicine_data.mrp,
        purchase_price=medicine_data.purchase_price,
        selling_price=medicine_data.selling_price,

        stock_quantity=medicine_data.stock,

        minimum_stock=medicine_data.minimum_stock,

        schedule_type=medicine_data.schedule_type,
    )

    return create_medicine(
        db,
        medicine,
    )


def get_all_medicine_list(
    db: Session,
):
    return get_all_medicines(db)


def get_medicine(
    db: Session,
    medicine_id: int,
):
    medicine = get_medicine_by_id(
        db,
        medicine_id,
    )

    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicine not found",
        )

    return medicine


def search_medicines(
    db: Session,
    name: str,
):
    return repository_search_medicines(
        db,
        name,
    )


def edit_medicine(
    db: Session,
    medicine_id: int,
    medicine_data: MedicineUpdate,
):
    medicine = get_medicine_by_id(
        db,
        medicine_id,
    )

    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicine not found",
        )

    if medicine_data.name is not None:
        medicine.name = medicine_data.name

    if medicine_data.generic_name is not None:
        medicine.generic_name = medicine_data.generic_name

    if medicine_data.brand_name is not None:
        medicine.brand_name = medicine_data.brand_name

    if medicine_data.category_id is not None:
        medicine.category_id = medicine_data.category_id

    if medicine_data.medicine_type is not None:
        medicine.medicine_type = medicine_data.medicine_type

    if medicine_data.drawer is not None:
        medicine.drawer = medicine_data.drawer

    if medicine_data.batch_number is not None:
        medicine.batch_number = medicine_data.batch_number

    if medicine_data.expiry_date is not None:
        medicine.expiry_date = medicine_data.expiry_date

    if medicine_data.mrp is not None:
        medicine.mrp = medicine_data.mrp

    if medicine_data.purchase_price is not None:
        medicine.purchase_price = medicine_data.purchase_price

    if medicine_data.selling_price is not None:
        medicine.selling_price = medicine_data.selling_price

    if medicine_data.stock is not None:
        medicine.stock_quantity = medicine_data.stock

    if medicine_data.minimum_stock is not None:
        medicine.minimum_stock = medicine_data.minimum_stock

    if medicine_data.schedule_type is not None:
        medicine.schedule_type = medicine_data.schedule_type

    return update_medicine(
        db,
        medicine,
    )


def reduce_medicine_stock(
    db: Session,
    medicine_id: int,
    quantity: int,
):
    medicine = get_medicine_by_id(
        db,
        medicine_id,
    )

    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicine not found",
        )

    if quantity <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quantity must be greater than zero",
        )

    if medicine.stock_quantity < quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient stock",
        )

    medicine.stock_quantity -= quantity

    return update_medicine(
        db,
        medicine,
    )


def deactivate_medicine(
    db: Session,
    medicine_id: int,
):
    medicine = get_medicine_by_id(
        db,
        medicine_id,
    )

    if not medicine:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medicine not found",
        )

    medicine.is_active = False

    return update_medicine(
        db,
        medicine,
    )