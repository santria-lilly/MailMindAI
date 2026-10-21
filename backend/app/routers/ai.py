from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException
from app.database import get_db_connection
from app.schemas.reply_schema import (
    ReplyGenerateRequest,
    ReplyGenerateResponse,
    SendReplyRequest,
    SendReplyResponse
)
from app.services.ai_service import ai_service
from app.services.gmail_service import gmail_service
from app.services.auth_service import auth_service

router = APIRouter(prefix="/api/ai", tags=["AI Integration"])

@router.post("/generate-reply", response_model=ReplyGenerateResponse)
async def generate_reply(payload: ReplyGenerateRequest):
    """
    Generates a context-aware email reply in one of 4 tones:
    Professional, Friendly, Formal, or Concise.
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM emails WHERE id = ?", (payload.email_id,))
        email_row = cursor.fetchone()
        if not email_row:
            raise HTTPException(status_code=404, detail="Email not found")

        subject = email_row["subject"]
        sender = f"{email_row['sender_name']} <{email_row['sender_email']}>"
        body = email_row["body"]
        recipient = email_row["sender_email"]

    reply_result = await ai_service.generate_reply(
        subject=subject,
        sender=sender,
        body=body,
        tone=payload.tone,
        additional_context=payload.additional_context
    )

    return ReplyGenerateResponse(
        reply_text=reply_result["reply_text"],
        subject=f"Re: {subject.replace('Re:', '').replace('RE:', '').strip()}",
        recipient_email=recipient,
        tone=payload.tone,
        engine_used=reply_result["engine_used"]
    )

@router.post("/send-reply", response_model=SendReplyResponse)
def send_reply(payload: SendReplyRequest):
    """
    Sends an email reply.
    For live Gmail: Dispatches via official Gmail API after explicit user review.
    For Demo mode: Records confirmed simulated dispatch.
    """
    now_str = datetime.now(timezone.utc).isoformat()

    # Find email details
    thread_id = None
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT thread_id, is_demo FROM emails WHERE id = ?", (payload.email_id,))
        row = cursor.fetchone()
        if row:
            thread_id = row["thread_id"]

    is_demo_mode = payload.is_demo or (row and bool(row["is_demo"]))
    auth_status = auth_service.get_auth_status()

    if not is_demo_mode and auth_status["is_authenticated"]:
        # Real Gmail dispatch
        try:
            result = gmail_service.send_reply(
                to_email=payload.recipient_email,
                subject=payload.subject,
                reply_body=payload.reply_body,
                thread_id=thread_id
            )
            return SendReplyResponse(
                success=True,
                message=f"Reply sent successfully to {payload.recipient_email} via Gmail API.",
                message_id=result.get("message_id"),
                sent_at=result.get("sent_at", now_str)
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to send via Gmail API: {str(e)}")
    else:
        # Confirmed simulated dispatch in Demo mode
        return SendReplyResponse(
            success=True,
            message=f"[Demo Mode] Confirmed reply successfully simulated to {payload.recipient_email}.",
            message_id=f"demo-sent-{datetime.now().strftime('%H%M%S')}",
            sent_at=now_str
        )

@router.get("/daily-briefing")
async def get_daily_briefing():
    """Generates an executive briefing synthesizing high-priority emails and pending tasks."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM emails ORDER BY received_at DESC LIMIT 20")
        emails = [dict(r) for r in cursor.fetchall()]

        cursor.execute("SELECT * FROM tasks WHERE status = 'pending' ORDER BY due_date ASC")
        tasks = [dict(r) for r in cursor.fetchall()]

    briefing = await ai_service.generate_daily_briefing(emails, tasks)
    return {
        "briefing": briefing,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "is_ai_powered": ai_service.is_ai_available
    }
