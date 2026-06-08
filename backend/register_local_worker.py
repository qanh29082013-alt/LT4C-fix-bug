
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import Column, String, Integer, DateTime, func, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
from app.db import engine

Base = declarative_base()

class Worker(Base):
    __tablename__ = "workers"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    base_url = Column(String(500), nullable=False)
    status = Column(String(50), default="active")
    max_sessions = Column(Integer, default=5)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

with Session(engine) as session:
    existing = session.query(Worker).filter(Worker.base_url == "http://localhost:4000").first()
    if not existing:
        worker = Worker(
            name="Local Worker",
            base_url="http://localhost:4000",
            max_sessions=10,
            status="active",
            updated_at=func.now()
        )
        session.add(worker)
        session.commit()
        print("Worker registered successfully.")
    else:
        print("Worker already registered.")
