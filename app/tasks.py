from celery import Celery
from email.message import EmailMessage
import smtplib
import os
from dotenv import load_dotenv
from twilio.rest import Client
from app.database import SessionLocal
from app.models import Notification

# === Load environment variables from .env ===
load_dotenv()

# ✅ Environment variables
TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_FROM = os.getenv("TWILIO_FROM_NUMBER")
GMAIL_USER = os.getenv("GMAIL_USER")
GMAIL_PASS = os.getenv("GMAIL_APP_PASSWORD")

# === Setup Celery with Redis ===
celery_app = Celery(
    "worker",
    broker="redis://redis:6379/0",
    backend="redis://redis:6379/0"
)

# === Email Sending Helper ===
def send_email(to_email: str, subject: str, body: str):
    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = GMAIL_USER
    msg['To'] = to_email
    msg.set_content(body)

    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(GMAIL_USER, GMAIL_PASS)
        smtp.send_message(msg)

# === SMS Sending Helper (Twilio) ===
def send_sms(to: str, body: str):
    client = Client(TWILIO_SID, TWILIO_AUTH)
    message = client.messages.create(
        body=body,
        from_=TWILIO_FROM,
        to=to
    )
    print(f"[TWILIO ✅] SMS sent to {to} (SID: {message.sid})")

# === Main Celery Task for Notification ===
@celery_app.task(bind=True, max_retries=3)
def send_notification(self, notif_type, to, message, notif_id):
    db = SessionLocal()
    try:
        print(f"\n[SEND] Type: {notif_type}, To: {to}, Message: {message}")

        if notif_type == "email":
            send_email(to, "📣 New Notification", message)

        elif notif_type == "sms":
            send_sms(to, message)

        elif notif_type == "push":
            print(f"[SIMULATED PUSH 🔔] To: {to} | Message: {message}")
            # Replace with push logic if needed

        else:
            raise ValueError(f"Unsupported notification type: {notif_type}")

        # ✅ Update status in DB
        notification = db.query(Notification).get(notif_id)
        if notification:
            notification.status = "SUCCESS"
            db.commit()
            print(f"[DB ✅] Notification {notif_id} marked as SUCCESS")

    except Exception as e:
        print(f"[ERROR ❌] Failed to send {notif_type}: {e}")
        notification = db.query(Notification).get(notif_id)
        if notification:
            notification.status = f"FAILED: {str(e)}"
            db.commit()
        raise self.retry(exc=e)

    finally:
        db.close()
