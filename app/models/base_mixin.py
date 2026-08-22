from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime


class TimestampMixin:
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )


class ActiveMixin:
    is_active = Column(
        Boolean,
        default=True,
        nullable=False,
    )