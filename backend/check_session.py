
import uuid
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session
from sqlalchemy import Column, String, Integer, DateTime, func, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv

load_dotenv()
engine = create_engine(os.getenv("DATABASE_URL").replace("postgresql://", "postgresql+psycopg://"))
Base = declarative_base()

class VpsSession(Base):
    __tablename__ = "vps_sessions"
    id = Column(UUID(as_uuid=True), primary_key=True)
    status = Column(String(50))
    worker_route = Column(String(100))
    created_at = Column(DateTime(timezone=True))

with Session(engine) as session:
    s = session.query(VpsSession).order_by(VpsSession.created_at.desc()).first()
    if s:
        print(f"ID: {s.id}, Status: {s.status}, Route: {s.worker_route}")
    else:
        print("No session found.")
