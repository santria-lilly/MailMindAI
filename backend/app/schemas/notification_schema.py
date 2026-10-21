from pydantic import BaseModel
from typing import Optional

class NotificationResponse(BaseModel):
    id: str
    type: str  # urgent_email, deadline, overdue_task, unanswered
    title: str
    message: str
    link_id: Optional[str] = None
    priority: str = "Medium"
    is_read: bool = False
    created_at: str
    is_demo: bool = False

class NotificationCountResponse(BaseModel):
    unread_count: int
    total_count: int
