from sqlalchemy.orm import Session, joinedload

from app.models.sale import Sale
from app.models.sale_item import SaleItem


def create_sale(
    db: Session,
    sale: Sale,
) -> Sale:
    db.add(sale)
    db.commit()
    db.refresh(sale)

    return sale


def get_sale_by_id(
    db: Session,
    sale_id: int,
) -> Sale | None:
    return (
        db.query(Sale)
        .options(
            joinedload(Sale.items)
            .joinedload(SaleItem.medicine)
        )
        .filter(Sale.id == sale_id)
        .first()
    )


def get_sale_by_invoice_number(
    db: Session,
    invoice_number: str,
) -> Sale | None:
    return (
        db.query(Sale)
        .options(
            joinedload(Sale.items)
            .joinedload(SaleItem.medicine)
        )
        .filter(
            Sale.invoice_number == invoice_number,
        )
        .first()
    )


def get_all_sales(
    db: Session,
):
    return (
        db.query(Sale)
        .options(
            joinedload(Sale.items)
            .joinedload(SaleItem.medicine)
        )
        .order_by(Sale.created_at.desc())
        .all()
    )


def create_sale_item(
    db: Session,
    sale_item: SaleItem,
) -> SaleItem:
    db.add(sale_item)
    db.commit()
    db.refresh(sale_item)

    return sale_item