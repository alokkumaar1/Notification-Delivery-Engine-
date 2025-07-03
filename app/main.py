from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Dict

from app.tasks import send_notification
from app.models import Notification
from app.database import get_db

app = FastAPI()

# === ✅ Enable CORS ===
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Adjust if frontend is hosted elsewhere
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# === ✅ Request Schema ===
class NotificationRequest(BaseModel):
    type: str           # "email", "sms", "push"
    recipient: str      # ✅ Allow both emails and phone numbers
    message: str

# === ✅ POST /notify ===
@app.post("/notify", response_model=Dict[str, str])
def notify(request: NotificationRequest, db: Session = Depends(get_db)):
    notif_type = request.type.lower()

    # Add to DB with queued status
    new_notification = Notification(
        notif_type=notif_type,
        recipient=request.recipient,
        message=request.message,
        status="queued"
    )
    db.add(new_notification)
    db.commit()
    db.refresh(new_notification)

    # Send async task to Celery
    send_notification.delay(
        notif_type=notif_type,
        to=request.recipient,
        message=request.message,
        notif_id=new_notification.id
    )

    return {
        "status": "queued",
        "recipient": request.recipient,
        "type": notif_type
    }

# === ✅ GET /notifications ===
@app.get("/notifications")
def get_notifications(db: Session = Depends(get_db)):
    notifications = db.query(Notification).all()
    return [
        {
            "id": n.id,
            "type": n.notif_type,
            "to": n.recipient,
            "message": n.message,
            "status": n.status,
            "timestamp": n.timestamp.isoformat() if n.timestamp else None
        }
        for n in notifications
    ]
