
from app.db import SessionLocal
from app.models import Worker

db = SessionLocal()
workers = db.query(Worker).all()
for w in workers:
    print(f"ID: {w.id}, Name: {w.name}, Base URL: {w.base_url}, Status: {w.status}")
db.close()
