from sqlalchemy import Column, Integer, String

from app.db.base import Base
from app.models.base_mixin import ActiveMixin, TimestampMixin
from sqlalchemy.orm import relationship


class Category(Base, TimestampMixin, ActiveMixin):
    __tablename__ = "categories"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    name = Column(
        String,
        unique=True,
        nullable=False,
        index=True,
    )

    description = Column(
        String,
        nullable=True,
    )

    medicines = relationship(
        "Medicine",
        back_populates="category",
    )
    