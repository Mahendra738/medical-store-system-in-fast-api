from sqlalchemy.orm import Session, joinedload

from app.models.sale import Sale
from app.models.sale_item import SaleItem
from datetime import datetime
from app.models.medicine import Medicine


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

def get_sales_report(
    db: Session,
    start_date: datetime,
    end_date: datetime,
):
    sales = (
        db.query(Sale)
        .options(
            joinedload(Sale.items)
            .joinedload(SaleItem.medicine)
            .joinedload(Medicine.category)
        )
        .filter(
            Sale.created_at >= start_date,
            Sale.created_at < end_date,
        )
        .order_by(Sale.created_at.asc())
        .all()
    )

    total_sales = sum(
        sale.total_amount for sale in sales
    )

    total_discount = sum(
        sale.discount for sale in sales
    )

    total_bills = len(sales)

    total_items_sold = sum(
        item.quantity
        for sale in sales
        for item in sale.items
    )

    average_bill = (
        total_sales / total_bills
        if total_bills > 0
        else 0
    )

    medicine_data = {}

    for sale in sales:
        for item in sale.items:
            medicine = item.medicine

            if medicine.id not in medicine_data:
                medicine_data[medicine.id] = {
                    "medicine_id": medicine.id,
                    "medicine_name": medicine.name,
                    "quantity": 0,
                    "revenue": 0,
                }

            medicine_data[medicine.id]["quantity"] += item.quantity
            medicine_data[medicine.id]["revenue"] += item.total_price

    top_medicines = sorted(
        medicine_data.values(),
        key=lambda x: x["quantity"],
        reverse=True,
    )

    category_data = {}

    for sale in sales:
        for item in sale.items:
            medicine = item.medicine

            if medicine.category is None:
                category_name = "Uncategorized"
            else:
                category_name = medicine.category.name

            if category_name not in category_data:
                category_data[category_name] = {
                    "category_name": category_name,
                    "quantity": 0,
                    "revenue": 0,
                }

            category_data[category_name]["quantity"] += item.quantity
            category_data[category_name]["revenue"] += item.total_price

    category_sales = sorted(
        category_data.values(),
        key=lambda x: x["revenue"],
        reverse=True,
    )

    sales_by_date = {}

    for sale in sales:
        date_key = sale.created_at.date().isoformat()

        if date_key not in sales_by_date:
            sales_by_date[date_key] = {
                "date": date_key,
                "sales": 0,
                "bills": 0,
            }

        sales_by_date[date_key]["sales"] += sale.total_amount
        sales_by_date[date_key]["bills"] += 1

    return {
        "summary": {
            "total_sales": total_sales,
            "total_bills": total_bills,
            "total_items_sold": total_items_sold,
            "total_discount": total_discount,
            "average_bill": average_bill,
        },
        "sales_by_date": list(
            sales_by_date.values()
        ),
        "top_medicines": top_medicines,
        "category_sales": category_sales,
    }