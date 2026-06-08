
from app.db import SessionLocal
from app.admin.models import Role
from app.models import User, UserRole
import bcrypt
import uuid

def setup_admin():
    db = SessionLocal()
    try:
        # 1. Ensure admin role exists
        admin_role = db.query(Role).filter(Role.name == "admin").first()
        if not admin_role:
            admin_role = Role(name="admin", description="Full system access")
            db.add(admin_role)
            db.commit()
            db.refresh(admin_role)
            print("Admin role created.")

        user_role_val = db.query(Role).filter(Role.name == "user").first()
        if not user_role_val:
            user_role_val = Role(name="user", description="Regular user access")
            db.add(user_role_val)
            db.commit()
            db.refresh(user_role_val)
            print("User role created.")

        # 2. Create or update the specific admin account
        username = "QuocanhADMIN111"
        password = "QuocAnhdnd123LegacyMason26"
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

        user = db.query(User).filter(User.username == username).first()
        if not user:
            user = User(
                discord_id=f"manual-{uuid.uuid4().hex[:10]}",
                username=username,
                display_name="Quoc Anh Admin",
                password_hash=hashed_password
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"User {username} created.")
        else:
            user.password_hash = hashed_password
            db.commit()
            print(f"User {username} password updated.")

        # 3. Grant admin role
        # Check if already has it
        existing_admin = db.query(UserRole).filter(
            UserRole.user_id == user.id,
            UserRole.role_id == admin_role.id
        ).first()

        if not existing_admin:
            new_ur = UserRole(user_id=user.id, role_id=admin_role.id)
            db.add(new_ur)
            db.commit()
            print(f"Admin role granted to {username}.")
        else:
            print(f"User {username} already has admin role.")

        # Also grant 'user' role for basic access
        existing_user_role = db.query(UserRole).filter(
            UserRole.user_id == user.id,
            UserRole.role_id == user_role_val.id
        ).first()
        if not existing_user_role:
            new_ur = UserRole(user_id=user.id, role_id=user_role_val.id)
            db.add(new_ur)
            db.commit()
            print(f"User role granted to {username}.")

    finally:
        db.close()

if __name__ == "__main__":
    setup_admin()
