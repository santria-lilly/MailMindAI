import json
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from app.database import get_db_connection
from app.schemas.email_schema import EmailResponse, EmailListResponse, EmailMarkReadRequest
from app.services.ai_service import ai_service
from app.services.gmail_service import gmail_service
from app.services.auth_service import auth_service

router = APIRouter(prefix="/api/emails", tags=["Emails"])

def _format_email_row(row) -> EmailResponse:
    action_items = []
    deadlines = []
    labels = []
    try:
        action_items = json.loads(row["action_items"]) if row["action_items"] else []
    except Exception:
        pass
    try:
        deadlines = json.loads(row["deadlines"]) if row["deadlines"] else []
    except Exception:
        pass
    try:
        labels = json.loads(row["labels"]) if row["labels"] else []
    except Exception:
        pass

    return EmailResponse(
        id=row["id"],
        thread_id=row["thread_id"],
        sender_name=row["sender_name"],
        sender_email=row["sender_email"],
        recipient_email=row["recipient_email"],
        subject=row["subject"],
        snippet=row["snippet"],
        body=row["body"],
        received_at=row["received_at"],
        is_read=bool(row["is_read"]),
        priority=row["priority"],
        priority_reason=row["priority_reason"],
        action_items=action_items,
        deadlines=deadlines,
        summary=row["summary"],
        requires_reply=bool(row["requires_reply"]),
        is_demo=bool(row["is_demo"]),
        labels=labels
    )

@router.get("", response_model=EmailListResponse)
def get_emails(
    priority: Optional[str] = Query(None, description="Filter by priority: Critical, High, Medium, Low"),
    is_read: Optional[bool] = Query(None, description="Filter by read status"),
    search: Optional[str] = Query(None, description="Search term for subject, sender, or body"),
    is_demo: Optional[bool] = Query(None, description="Filter by demo status"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """Retrieves paginated emails with priority and keyword filters."""
    query_parts = ["1=1"]
    params = []

    if priority:
        query_parts.append("priority = ?")
        params.append(priority)

    if is_read is not None:
        query_parts.append("is_read = ?")
        params.append(1 if is_read else 0)

    if is_demo is not None:
        query_parts.append("is_demo = ?")
        params.append(1 if is_demo else 0)

    if search:
        search_like = f"%{search.strip()}%"
        query_parts.append("(subject LIKE ? OR sender_name LIKE ? OR sender_email LIKE ? OR snippet LIKE ?)")
        params.extend([search_like, search_like, search_like, search_like])

    where_clause = " AND ".join(query_parts)

    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Count total matching
        count_query = f"SELECT COUNT(*) as total FROM emails WHERE {where_clause}"
        cursor.execute(count_query, params)
        total = cursor.fetchone()["total"]

        # Count unread & critical
        cursor.execute("SELECT COUNT(*) as unread FROM emails WHERE is_read = 0")
        unread_count = cursor.fetchone()["unread"]

        cursor.execute("SELECT COUNT(*) as critical FROM emails WHERE priority = 'Critical'")
        critical_count = cursor.fetchone()["critical"]

        # Fetch emails
        fetch_query = f"""
            SELECT * FROM emails
            WHERE {where_clause}
            ORDER BY
                CASE priority
                    WHEN 'Critical' THEN 1
                    WHEN 'High' THEN 2
                    WHEN 'Medium' THEN 3
                    WHEN 'Low' THEN 4
                    ELSE 5
                END,
                received_at DESC
            LIMIT ? OFFSET ?
        """
        cursor.execute(fetch_query, params + [limit, offset])
        rows = cursor.fetchall()
        emails = [_format_email_row(r) for r in rows]

    return EmailListResponse(
        emails=emails,
        total=total,
        unread_count=unread_count,
        critical_count=critical_count,
        is_demo=bool(is_demo) if is_demo is not None else False
    )

@router.get("/{email_id}", response_model=EmailResponse)
def get_email_detail(email_id: str):
    """Retrieves details of a specific email by ID."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM emails WHERE id = ?", (email_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Email not found")
        return _format_email_row(row)

@router.patch("/{email_id}/read")
def mark_email_read(email_id: str, payload: EmailMarkReadRequest):
    """Marks an email as read or unread."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT is_demo FROM emails WHERE id = ?", (email_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Email not found")
        
        cursor.execute("UPDATE emails SET is_read = ? WHERE id = ?", (1 if payload.is_read else 0, email_id))
        
        # If it's a real Gmail message, sync back to Gmail
        if not bool(row["is_demo"]) and payload.is_read:
            try:
                gmail_service.mark_as_read(email_id)
            except Exception as e:
                print(f"[Emails Router] Notice: Could not sync read status to Gmail: {e}")

    return {"success": True, "email_id": email_id, "is_read": payload.is_read}

@router.post("/{email_id}/prioritize", response_model=EmailResponse)
async def re_prioritize_email(email_id: str):
    """Forces an AI re-analysis and classification on an existing email."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM emails WHERE id = ?", (email_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Email not found")

        subject = row["subject"]
        sender = f"{row['sender_name']} <{row['sender_email']}>"
        body = row["body"]

    # Run AI analysis
    analysis = await ai_service.analyze_email(subject, sender, body)

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE emails SET
                priority = ?,
                priority_reason = ?,
                action_items = ?,
                deadlines = ?,
                summary = ?,
                requires_reply = ?
            WHERE id = ?
        """, (
            analysis["priority"],
            analysis["priority_reason"],
            json.dumps(analysis["action_items"]),
            json.dumps(analysis["deadlines"]),
            analysis["summary"],
            1 if analysis["requires_reply"] else 0,
            email_id
        ))

        cursor.execute("SELECT * FROM emails WHERE id = ?", (email_id,))
        updated_row = cursor.fetchone()
        return _format_email_row(updated_row)

@router.post("/sync")
async def sync_gmail_inbox():
    """Fetches real recent emails from Gmail and triages them via AI."""
    status = auth_service.get_auth_status()
    if not status["is_authenticated"]:
        raise HTTPException(
            status_code=400,
            detail="Gmail account is not connected. Connect via OAuth or use Demo Mode."
        )

    try:
        synced = await gmail_service.sync_and_triage_inbox(max_count=15)
        return {
            "success": True,
            "synced_count": len(synced),
            "message": f"Successfully synced and triaged {len(synced)} new email(s) from Gmail."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to sync Gmail: {str(e)}")
