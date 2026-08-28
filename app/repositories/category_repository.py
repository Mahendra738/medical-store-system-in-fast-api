from sqlalchemy.orm import Session

from app.models.category import Category


def create_category(
    db: Session,
    category: Category,
) -> Category:

    db.add(category)
    db.commit()
    db.refresh(category)

    return category


def get_category_by_id(
    db: Session,
    category_id: int,
) -> Category | None:

    return (
        db.query(Category)
        .filter(
            Category.id == category_id,
            Category.is_active == True,
        )
        .first()
    )


def get_category_by_name(
    db: Session,
    name: str,
) -> Category | None:

    return (
        db.query(Category)
        .filter(
            Category.name == name,
            Category.is_active == True,
        )
        .first()
    )


def get_all_categories(
    db: Session,
):

    return (
        db.query(Category)
        .filter(
            Category.is_active == True,
        )
        .order_by(Category.name)
        .all()
    )


def update_category(
    db: Session,
    category: Category,
) -> Category:

    db.commit()
    db.refresh(category)

    return category