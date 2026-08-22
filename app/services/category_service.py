from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.category import Category
from app.repositories import category_repository
from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
)


def create_new_category(
    db: Session,
    category_data: CategoryCreate,
):
    existing_category = category_repository.get_category_by_name(
        db,
        category_data.name,
    )

    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category already exists",
        )

    category = Category(
        name=category_data.name,
        description=category_data.description,
    )

    return category_repository.create_category(
        db,
        category,
    )


def get_all_categories(
    db: Session,
):
    return category_repository.get_all_categories(
        db,
    )


def get_category(
    db: Session,
    category_id: int,
):
    category = category_repository.get_category_by_id(
        db,
        category_id,
    )

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return category


def edit_category(
    db: Session,
    category_id: int,
    category_data: CategoryUpdate,
):
    category = category_repository.get_category_by_id(
        db,
        category_id,
    )

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    if (
        category_data.name
        and category_data.name != category.name
    ):
        existing = category_repository.get_category_by_name(
            db,
            category_data.name,
        )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category already exists",
            )

        category.name = category_data.name

    if category_data.description is not None:
        category.description = category_data.description

    return category_repository.update_category(
        db,
        category,
    )


def deactivate_category(
    db: Session,
    category_id: int,
):
    category = category_repository.get_category_by_id(
        db,
        category_id,
    )

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    category.is_active = False

    return category_repository.update_category(
        db,
        category,
    )