"""add password_hash column to users"""

from alembic import op
import sqlalchemy as sa

revision = "20251025_add_password_hash"
down_revision = "20251024_restore_worker_cb"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("password_hash", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "password_hash")
