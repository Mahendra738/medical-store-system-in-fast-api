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
)
from app.schemas.sale import SaleCreate


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


def create_new_sale(
    db: Session,
    sale_data: SaleCreate,
):
    subtotal = Decimal("0.00")
    sale_items = []

    for item_data in sale_data.items:

        medicine = get_medicine_by_id(
            db,
            item_data.medicine_id,
        )

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

        item_total = (
            medicine.selling_price
            * item_data.quantity
        )

        item_discount = item_data.discount

        if item_discount > item_total:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Discount cannot be greater than "
                    f"the item total for {medicine.name}"
                ),
            )

        item_final_total = (
            item_total - item_discount
        )

        subtotal += item_final_total

        sale_item = SaleItem(
            medicine_id=medicine.id,
            quantity=item_data.quantity,
            mrp=medicine.mrp,
            selling_price=medicine.selling_price,
            discount=item_discount,
            total_price=item_final_total,
        )

        sale_items.append(
            (
                sale_item,
                medicine,
            )
        )

    sale_discount = sale_data.discount

    if sale_discount > subtotal:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Sale discount cannot be greater than subtotal",
        )

    total_amount = subtotal - sale_discount

    sale = Sale(
        invoice_number=generate_invoice_number(db),
        customer_name=sale_data.customer_name,
        subtotal=subtotal,
        discount=sale_discount,
        total_amount=total_amount,
    )

    for sale_item, medicine in sale_items:

        medicine.stock_quantity -= sale_item.quantity

        sale.items.append(sale_item)

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