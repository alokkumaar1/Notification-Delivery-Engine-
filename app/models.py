from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

# SQLite database
DATABASE_URL = "sqlite:///./notifications.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# Table for notifications
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    notif_type = Column(String)
    recipient = Column(String)
    message = Column(String)
    status = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Create the table if not exists
Base.metadata.create_all(bind=engine)
