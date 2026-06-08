"""restore worker columns needed by callback system

The 20251014 refactor dropped token_id, current_jobs, last_heartbeat,
last_net_mbps, and last_req_rate from the workers table.  However the
worker_callbacks module still references these columns for heartbeat /
status / result handling.  This migration re-adds them and expands the
status check constraint to include 'idle' and 'busy'.
"""

from alembic import op
import sqlalchemy as sa


revision = "20251024_restore_worker_cb"
down_revision = "20251023_giftcodes"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("workers") as batch:
        batch.add_column(
            sa.Column(
                "token_id",
                sa.UUID(as_uuid=True),
                sa.ForeignKey("admin_tokens.id", ondelete="SET NULL"),
                nullable=True,
            )
        )
        batch.add_column(
            sa.Column("current_jobs", sa.Integer(), nullable=True, server_default="0")
        )
        batch.add_column(
            sa.Column("last_heartbeat", sa.DateTime(timezone=True), nullable=True)
        )
        batch.add_column(
            sa.Column("last_net_mbps", sa.Integer(), nullable=True)
        )
        batch.add_column(
            sa.Column("last_req_rate", sa.Integer(), nullable=True)
        )

        # Expand status constraint to include idle/busy used by callbacks
        batch.drop_constraint("ck_workers_status", type_="check")
        batch.create_check_constraint(
            "ck_workers_status",
            "status in ('active','disabled','idle','busy')",
        )


def downgrade() -> None:
    with op.batch_alter_table("workers") as batch:
        batch.drop_column("last_req_rate")
        batch.drop_column("last_net_mbps")
        batch.drop_column("last_heartbeat")
        batch.drop_column("current_jobs")
        batch.drop_column("token_id")

        batch.drop_constraint("ck_workers_status", type_="check")
        batch.create_check_constraint(
            "ck_workers_status",
            "status in ('active','disabled')",
        )
