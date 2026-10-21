from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from app.database import get_db_connection
from app.schemas.notification_schema import NotificationResponse, NotificationCountResponse

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

def _format_notif_row(row) -> NotificationResponse:
    return NotificationResponse(
        id=row["id"],
        type=row["type"],
        title=row["title"],
        message=row["message"],
        link_id=row["link_id"],
        priority=row["priority"] or "Medium",
        is_read=bool(row["is_read"]),
        created_at=row["created_at"],
        is_demo=bool(row["is_demo"])
    )

@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    is_read: Optional[bool] = Query(None),
    limit: int = Query(20, ge=1, le=50)
):
    """Retrieves in-app notifications."""
    query = "SELECT * FROM notifications"
    params = []
    if is_read is not None:
        query += " WHERE is_read = ?"
        params.append(1 if is_read else 0)
    query += " ORDER BY created_at DESC LIMIT ?"
    params.append(limit)

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [_format_notif_row(r) for r in rows]

@router.get("/count", response_model=NotificationCountResponse)
def get_notification_counts():
    """Gets total and unread notification counts for the top navigation bell badge."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as total FROM notifications")
        total = cursor.fetchone()["total"]

        cursor.execute("SELECT COUNT(*) as unread FROM notifications WHERE is_read = 0")
        unread = cursor.fetchone()["unread"]

        return NotificationCountResponse(unread_count=unread, total_count=total)

@router.patch("/{notification_id}/read")
def mark_notification_read(notification_id: str):
    """Marks a single notification as read."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE notifications SET is_read = 1 WHERE id = ?", (notification_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Notification not found")
    return {"success": True, "id": notification_id, "is_read": True}

@router.post("/mark-all-read")
def mark_all_notifications_read():
    """Marks all notifications as read."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE notifications SET is_read = 1")
    return {"success": True, "message": "All notifications marked as read"}
