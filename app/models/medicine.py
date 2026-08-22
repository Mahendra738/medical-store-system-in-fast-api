from sqlalchemy import (
    Column,
    Date,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
)
from sqlalchemy.orm import relationship

from app.core.enums import ScheduleType
from app.db.base import Base
from app.models.base_mixin import (
    ActiveMixin,
    TimestampMixin,
)


class Medicine(
    Base,
    TimestampMixin,
    ActiveMixin,
):
    __tablename__ = "medicines"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String,
        nullable=False,
        index=True,
    )

    generic_name = Column(
        String,
        nullable=False,
        index=True,
    )

    brand_name = Column(
        String,
        nullable=True,
    )

    category_id = Column(
        Integer,
        ForeignKey("categories.id"),
        nullable=False,
    )

    medicine_type = Column(
        String,
        nullable=False,
    )

    drawer = Column(
        String,
        nullable=False,
    )

    batch_number = Column(
        String,
        nullable=False,
    )

    expiry_date = Column(
        Date,
        nullable=False,
    )

    mrp = Column(
        Numeric(10, 2),
        nullable=False,
    )

    purchase_price = Column(
        Numeric(10, 2),
        nullable=False,
    )

    selling_price = Column(
        Numeric(10, 2),
        nullable=False,
    )

    stock_quantity = Column(
        Integer,
        nullable=False,
        default=0,
    )

    minimum_stock = Column(
        Integer,
        nullable=False,
        default=10,
    )

    schedule_type = Column(
        Enum(ScheduleType),
        nullable=False,
        default=ScheduleType.OTC,
    )

    category = relationship(
        "Category",
        back_populates="medicines",
    )