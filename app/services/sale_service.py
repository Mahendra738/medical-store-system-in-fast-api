from decimal import Decimal

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.sale import Sale
from app.models.sale_item import SaleItem
from app.repositories.medicine_repository import get_medicine_by_id
from app.repositories.sale_repository import (
    create_sale,
    get_all_sales,
    get_sale_by_id,
    get_sales_report,
)
from app.schemas.sale import SaleCreate
from datetime import datetime

from app.models.prescription import Prescription
from app.core.enums import ScheduleType


def generate_invoice_number(db: Session) -> str:
    last_sale = (
        db.query(Sale)
        .order_by(Sale.id.desc())
        .first()
    )

    if not last_sale:
        next_number = 1
    else:
        next_number = last_sale.id + 1

    return f"INV-{next_number:06d}"


def create_new_sale(db: Session, sale_data: SaleCreate):
    subtotal = Decimal("0.00")
    sale_items = []

    prescription_required = False

    for item_data in sale_data.items:
        medicine = get_medicine_by_id(db, item_data.medicine_id)

        if not medicine:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Medicine with ID {item_data.medicine_id} not found",
            )

        if medicine.stock_quantity < item_data.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Insufficient stock for {medicine.name}. "
                    f"Available: {medicine.stock_quantity}"
                ),
            )

        # Check whether prescription is required
        if medicine.schedule_type in {
            ScheduleType.H,
            ScheduleType.H1,
            ScheduleType.X,
        }:
            prescription_required = True

        item_total = medicine.selling_price * item_data.quantity

        item_discount = item_data.discount

        if item_discount > item_total:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Discount cannot be greater than the item total "
                    f"for {medicine.name}"
                ),
            )

        item_final_total = item_total - item_discount

        subtotal += item_final_total

        sale_item = SaleItem(
            medicine_id=medicine.id,
            quantity=item_data.quantity,
            mrp=medicine.mrp,
            selling_price=medicine.selling_price,
            discount=item_discount,
            total_price=item_final_total,
        )

        sale_items.append((sale_item, medicine))

    # --------------------------------------------------
    # PRESCRIPTION VALIDATION
    # --------------------------------------------------

    if prescription_required:

        if not sale_data.prescription:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Prescription and customer details are required "
                    "for prescription medicines."
                ),
            )

        prescription = sale_data.prescription

        if not prescription.customer_name.strip():
            raise HTTPException(
                status_code=400,
                detail="Customer name is required.",
            )

        if not prescription.customer_phone.strip():
            raise HTTPException(
                status_code=400,
                detail="Customer phone number is required.",
            )

        if not prescription.customer_address.strip():
            raise HTTPException(
                status_code=400,
                detail="Customer address is required.",
            )

        if not prescription.doctor_name.strip():
            raise HTTPException(
                status_code=400,
                detail="Doctor name is required.",
            )

        if not prescription.doctor_address.strip():
            raise HTTPException(
                status_code=400,
                detail="Doctor address is required.",
            )

        if not prescription.prescription_date:
            raise HTTPException(
                status_code=400,
                detail="Prescription date is required.",
            )

    # --------------------------------------------------
    # SALE DISCOUNT
    # --------------------------------------------------

    sale_discount = sale_data.discount

    if sale_discount > subtotal:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sale discount cannot be greater than subtotal",
        )

    total_amount = subtotal - sale_discount

    # --------------------------------------------------
    # CREATE SALE
    # --------------------------------------------------

    sale = Sale(
        invoice_number=generate_invoice_number(db),
        customer_name=(
            sale_data.prescription.customer_name
            if sale_data.prescription
            else sale_data.customer_name
        ),
        customer_phone=(
            sale_data.prescription.customer_phone
            if sale_data.prescription
            else sale_data.customer_phone
        ),
        customer_address=(
            sale_data.prescription.customer_address
            if sale_data.prescription
            else sale_data.customer_address
        ),
        subtotal=subtotal,
        discount=sale_discount,
        total_amount=total_amount,
    )

    # --------------------------------------------------
    # ADD ITEMS + REDUCE STOCK
    # --------------------------------------------------

    for sale_item, medicine in sale_items:

        medicine.stock_quantity -= sale_item.quantity

        sale.items.append(sale_item)

    # --------------------------------------------------
    # CREATE PRESCRIPTION RECORD
    # --------------------------------------------------

    if prescription_required:
        prescription_data = sale_data.prescription

        prescription = Prescription(
            customer_name=prescription_data.customer_name,
            customer_phone=prescription_data.customer_phone,
            customer_address=prescription_data.customer_address,
            doctor_name=prescription_data.doctor_name,
            doctor_address=prescription_data.doctor_address,
            prescription_date=prescription_data.prescription_date,
            prescription_number=prescription_data.prescription_number,
            notes=prescription_data.notes,
        )

        sale.prescription = prescription

    db.add(sale)
    db.commit()
    db.refresh(sale)

    return sale


def get_sale(
    db: Session,
    sale_id: int,
):
    sale = get_sale_by_id(
        db,
        sale_id,
    )

    if not sale:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sale not found",
        )

    return sale


def get_all_sale_list(
    db: Session,
):
    return get_all_sales(db)

def generate_sales_report(
    db: Session,
    start_date: datetime,
    end_date: datetime,
):
    return get_sales_report(
        db=db,
        start_date=start_date,
        end_date=end_date,
    )