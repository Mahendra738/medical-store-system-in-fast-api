from sqlalchemy import Column, ForeignKey, Integer, Numeric
from sqlalchemy.orm import relationship

from app.db.base import Base


class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    sale_id = Column(
        Integer,
        ForeignKey("sales.id"),
        nullable=False,
    )

    medicine_id = Column(
        Integer,
        ForeignKey("medicines.id"),
        nullable=False,
    )

    quantity = Column(
        Integer,
        nullable=False,
    )

    mrp = Column(
        Numeric(10, 2),
        nullable=False,
    )

    selling_price = Column(
        Numeric(10, 2),
        nullable=False,
    )

    discount = Column(
        Numeric(10, 2),
        nullable=False,
        default=0,
    )

    total_price = Column(
        Numeric(10, 2),
        nullable=False,
    )

    sale = relationship(
        "Sale",
        back_populates="items",
    )

    medicine = relationship(
        "Medicine",
    )