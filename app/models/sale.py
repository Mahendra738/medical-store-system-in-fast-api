from sqlalchemy import Column, Integer, Numeric, String
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.models.base_mixin import TimestampMixin


class Sale(Base, TimestampMixin):
    __tablename__ = "sales"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    invoice_number = Column(
        String,
        unique=True,
        nullable=False,
        index=True,
    )

    customer_name = Column(
        String,
        nullable=True,
    )

    subtotal = Column(
        Numeric(10, 2),
        nullable=False,
        default=0,
    )

    discount = Column(
        Numeric(10, 2),
        nullable=False,
        default=0,
    )

    total_amount = Column(
        Numeric(10, 2),
        nullable=False,
        default=0,
    )

    items = relationship(
        "SaleItem",
        back_populates="sale",
        cascade="all, delete-orphan",
    )