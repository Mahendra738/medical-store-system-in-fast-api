from sqlalchemy import Column, Date, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.models.base_mixin import TimestampMixin


class Prescription(Base, TimestampMixin):
    __tablename__ = "prescriptions"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    sale_id = Column(
        Integer,
        ForeignKey("sales.id"),
        nullable=False,
        unique=True,
    )

    customer_name = Column(
        String,
        nullable=False,
    )

    customer_phone = Column(
        String,
        nullable=False,
    )

    customer_address = Column(
        Text,
        nullable=False,
    )

    doctor_name = Column(
        String,
        nullable=False,
    )

    doctor_address = Column(
        Text,
        nullable=False,
    )

    prescription_date = Column(
        Date,
        nullable=False,
    )

    prescription_number = Column(
        String,
        nullable=True,
    )

    notes = Column(
        Text,
        nullable=True,
    )

    sale = relationship(
        "Sale",
        back_populates="prescription",
    )