"""make search_history country_code nullable

Revision ID: 279982cf9329
Revises: 5863570224c1
Create Date: 2026-01-08 18:41:46.339790

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '279982cf9329'
down_revision: Union[str, Sequence[str], None] = '5863570224c1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "search_history",
        "country_code",
        existing_type=sa.VARCHAR(),
        nullable=True,
    )
    # if you also want city/country nullable at DB level:
    op.alter_column("search_history", "city",
        existing_type=sa.VARCHAR(), nullable=True)
    op.alter_column("search_history", "country",
        existing_type=sa.VARCHAR(), nullable=True)

def downgrade() -> None:
    op.alter_column(
        "search_history",
        "country_code",
        existing_type=sa.VARCHAR(),
        nullable=False,
    )
