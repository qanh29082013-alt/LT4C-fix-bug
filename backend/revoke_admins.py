
from app.db import SessionLocal
from app.admin.models import Role
from app.models import User, UserRole
from sqlalchemy import delete

def revoke_all_admins_except_specific(target_username: str):
    db = SessionLocal()
    try:
        # 1. Find admin role
        admin_role = db.query(Role).filter(Role.name == "admin").first()
        if not admin_role:
            print("Admin role not found.")
            return

        # 2. Find the target admin user
        target_user = db.query(User).filter(User.username == target_username).first()
        if not target_user:
            print(f"Target user {target_username} not found.")
            # If target user not found, we might want to delete ALL admins anyway
            # but usually it's better to be safe.
        
        target_user_id = target_user.id if target_user else None

        # 3. Revoke admin role from everyone else
        # Delete from UserRole where role_id is admin_role.id and user_id != target_user_id
        stmt = delete(UserRole).where(UserRole.role_id == admin_role.id)
        if target_user_id:
            stmt = stmt.where(UserRole.user_id != target_user_id)
        
        result = db.execute(stmt)
        db.commit()
        print(f"Revoked admin role from {result.rowcount} users.")

        # 4. Check for 'has_admin' flag in User table if it exists
        # Some parts of code use current_user.has_admin
        try:
            from sqlalchemy import update
            stmt_flag = update(User).values(has_admin=False)
            if target_user_id:
                stmt_flag = stmt_flag.where(User.id != target_user_id)
            
            result_flag = db.execute(stmt_flag)
            db.commit()
            print(f"Reset 'has_admin' flag for {result_flag.rowcount} users.")
        except Exception as e:
            print(f"Could not reset 'has_admin' flag (maybe column doesn't exist): {e}")

    finally:
        db.close()

if __name__ == "__main__":
    revoke_all_admins_except_specific("QuocanhADMIN111")
