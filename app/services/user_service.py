from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.enums import UserRole
from app.core.security import hash_password
from app.models.user import User
from app.repositories.user_repository import (
    get_all_users,
    get_user_by_email,
    get_user_by_id,
    update_user,
    update_user_password,
)


def get_users(
    db: Session,
):
    return get_all_users(db)


def create_managed_user(
    db: Session,
    full_name: str,
    email: str,
    phone_number: str,
    password: str,
    role: UserRole,
):
    existing_user = get_user_by_email(
        db,
        email,
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        full_name=full_name,
        email=email,
        phone_number=phone_number,
        hashed_password=hash_password(password),
        role=role,
        is_active=True,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def update_managed_user(
    db: Session,
    user_id: int,
    full_name: str | None = None,
    email: str | None = None,
    phone_number: str | None = None,
    role: UserRole | None = None,
):
    user = get_user_by_id(
        db,
        user_id,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if email is not None and email != user.email:
        existing_user = get_user_by_email(
            db,
            email,
        )

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        user.email = email

    if full_name is not None:
        user.full_name = full_name

    if phone_number is not None:
        user.phone_number = phone_number

    if role is not None:
        user.role = role

    return update_user(
        db,
        user,
    )


def set_user_active_status(
    db: Session,
    user_id: int,
    is_active: bool,
):
    user = get_user_by_id(
        db,
        user_id,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user.is_active = is_active

    return update_user(
        db,
        user,
    )

def reset_user_password(
    db: Session,
    user_id: int,
    new_password: str,
):
    user = get_user_by_id(db, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user.hashed_password = hash_password(new_password)

    return update_user_password(db, user)