from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta


from app.db.session import get_db
from app.dependencies.auth import get_current_user, require_admin
from app.models.user import User
from app.schemas.sale import (
    SaleCreate,
    SaleResponse,
    SalesReportResponse,
)
from app.services.sale_service import (
    create_new_sale,
    get_all_sale_list,
    get_sale,
    generate_sales_report,
)

router = APIRouter()


@router.post(
    "/",
    response_model=SaleResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_sale(
    sale: SaleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_new_sale(
        db,
        sale,
    )


@router.get(
    "/",
    response_model=list[SaleResponse],
)
def get_sales(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_all_sale_list(db)

@router.get(
    "/reports",
    response_model=SalesReportResponse,
)
def sales_report(
    period: str = Query(
        "today",
        pattern="^(today|week|month|year|custom)$",
    ),
    start_date: str | None = Query(None),
    end_date: str | None = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    now = datetime.now()

    # =========================
    # TODAY
    # =========================

    if period == "today":
        start = now.replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )

        end = start + timedelta(days=1)

    # =========================
    # THIS WEEK
    # =========================

    elif period == "week":
        start = (
            now - timedelta(days=now.weekday())
        ).replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )

        end = start + timedelta(days=7)

    # =========================
    # THIS MONTH
    # =========================

    elif period == "month":
        start = now.replace(
            day=1,
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )

        if start.month == 12:
            end = start.replace(
                year=start.year + 1,
                month=1,
            )
        else:
            end = start.replace(
                month=start.month + 1,
            )

    # =========================
    # THIS YEAR
    # =========================

    elif period == "year":
        start = now.replace(
            month=1,
            day=1,
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )

        end = start.replace(
            year=start.year + 1,
        )

    # =========================
    # CUSTOM DATE RANGE
    # =========================

    else:
        if not start_date or not end_date:
            from fastapi import HTTPException

            raise HTTPException(
                status_code=400,
                detail="start_date and end_date are required for custom period",
            )

        try:
            start = datetime.strptime(
                start_date,
                "%Y-%m-%d",
            )

            # Add one day so the selected end date
            # is included in the report.
            end = datetime.strptime(
                end_date,
                "%Y-%m-%d",
            ) + timedelta(days=1)

        except ValueError:
            from fastapi import HTTPException

            raise HTTPException(
                status_code=400,
                detail="Dates must be in YYYY-MM-DD format",
            )

        if start >= end:
            from fastapi import HTTPException

            raise HTTPException(
                status_code=400,
                detail="start_date must be before or equal to end_date",
            )

    return generate_sales_report(
        db=db,
        start_date=start,
        end_date=end,
    )

@router.get(
    "/{sale_id}",
    response_model=SaleResponse,
)
def get_sale_by_id(
    sale_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_sale(
        db,
        sale_id,
    )