from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.user import (
    UserCreate,
    PublicUserCreate,
    UserLogin,
    UserResponse,
    LoginResponse,
)
from app.services.auth_service import (
    register_user,
    authenticate_user,
)
from app.services.user_service import (
    get_users,
    create_managed_user,
    update_managed_user,
    set_user_active_status,
    reset_user_password,
)
from app.dependencies.auth import (
    get_current_user,
    require_admin,
)
from app.models.user import User
from app.core.enums import UserRole

router = APIRouter()


@router.post("/register", response_model=UserResponse)
def register(
    user: PublicUserCreate,
    db: Session = Depends(get_db),
):
    return register_user(db, user)


@router.post(
    "/login",
    response_model=LoginResponse,
)
def login(
    email: str,
    password: str,
    db: Session = Depends(get_db),
):
    user = authenticate_user(
        db,
        email,
        password,
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    return user

@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user


# -----------------------------
# User Management
# Admin only
# -----------------------------


@router.get(
    "/",
    response_model=list[UserResponse],
)
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return get_users(db)


@router.post(
    "/manage",
    response_model=UserResponse,
)
def create_managed_user_endpoint(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return create_managed_user(
        db=db,
        full_name=user.full_name,
        email=user.email,
        phone_number=user.phone_number,
        password=user.password,
        role=user.role,
    )


@router.put(
    "/manage/{user_id}",
    response_model=UserResponse,
)
def update_managed_user_endpoint(
    user_id: int,
    full_name: str | None = None,
    email: str | None = None,
    phone_number: str | None = None,
    role: UserRole | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return update_managed_user(
        db=db,
        user_id=user_id,
        full_name=full_name,
        email=email,
        phone_number=phone_number,
        role=role,
    )


@router.patch(
    "/manage/{user_id}/status",
    response_model=UserResponse,
)
def update_user_status(
    user_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return set_user_active_status(
        db=db,
        user_id=user_id,
        is_active=is_active,
    )

@router.patch("/manage/{user_id}/password")
def reset_user_password_endpoint(
    user_id: int,
    new_password: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    reset_user_password(
        db=db,
        user_id=user_id,
        new_password=new_password,
    )

    return {
        "message": "Password updated successfully"
    }
