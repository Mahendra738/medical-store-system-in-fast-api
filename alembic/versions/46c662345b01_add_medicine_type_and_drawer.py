"""add medicine type and drawer

Revision ID: 46c662345b01
Revises: beaff19cce30
Create Date: 2026-08-22 02:14:29.046372
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "46c662345b01"
down_revision: Union[str, Sequence[str], None] = "beaff19cce30"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # --------------------------------------------------
    # 1. Add medicine_type as nullable first
    # --------------------------------------------------

    op.add_column(
        "medicines",
        sa.Column(
            "medicine_type",
            sa.String(),
            nullable=True,
        ),
    )

    # --------------------------------------------------
    # 2. Add drawer as nullable first
    # --------------------------------------------------

    op.add_column(
        "medicines",
        sa.Column(
            "drawer",
            sa.String(),
            nullable=True,
        ),
    )

    # --------------------------------------------------
    # 3. Give existing medicines default values
    # --------------------------------------------------

    op.execute(
        """
        UPDATE medicines
        SET medicine_type = 'Tablet'
        WHERE medicine_type IS NULL
        """
    )

    op.execute(
        """
        UPDATE medicines
        SET drawer = 'A'
        WHERE drawer IS NULL
        """
    )

    # --------------------------------------------------
    # 4. Make both fields required
    # --------------------------------------------------

    op.alter_column(
        "medicines",
        "medicine_type",
        existing_type=sa.String(),
        nullable=False,
    )

    op.alter_column(
        "medicines",
        "drawer",
        existing_type=sa.String(),
        nullable=False,
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column(
        "medicines",
        "drawer",
    )

    op.drop_column(
        "medicines",
        "medicine_type",
    )