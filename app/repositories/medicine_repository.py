from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.medicine import Medicine


def create_medicine(
    db: Session,
    medicine: Medicine,
):
    db.add(medicine)
    db.commit()
    db.refresh(medicine)

    return medicine


def get_all_medicines(
    db: Session,
):
    return (
        db.query(Medicine)
        .filter(Medicine.is_active == True)
        .all()
    )


def get_medicine_by_id(
    db: Session,
    medicine_id: int,
):
    return (
        db.query(Medicine)
        .filter(
            Medicine.id == medicine_id,
            Medicine.is_active == True,
        )
        .first()
    )


def get_medicine_by_name(
    db: Session,
    name: str,
):
    return (
        db.query(Medicine)
        .filter(
            Medicine.name == name,
            Medicine.is_active == True,
        )
        .first()
    )


def get_medicine_by_name_and_batch(
    db: Session,
    name: str,
    batch_number: str | None = None,
):
    query = (
        db.query(Medicine)
        .filter(
            Medicine.name == name,
            Medicine.is_active == True,
        )
    )

    if batch_number:
        query = query.filter(
            Medicine.batch_number == batch_number,
        )

    return query.first()


def search_medicines(
    db: Session,
    search_term: str,
):
    search = f"%{search_term}%"

    return (
        db.query(Medicine)
        .filter(
            Medicine.is_active == True,
            or_(
                Medicine.name.ilike(search),
                Medicine.generic_name.ilike(search),
                Medicine.brand_name.ilike(search),
            ),
        )
        .all()
    )


def update_medicine(
    db: Session,
    medicine: Medicine,
):
    db.commit()
    db.refresh(medicine)

    return medicine