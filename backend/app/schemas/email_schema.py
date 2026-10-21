from pydantic import BaseModel, Field
from typing import List, Optional, Any

class DeadlineItem(BaseModel):
    title: str
    date: str
    is_urgent: bool = False

class EmailResponse(BaseModel):
    id: str
    thread_id: Optional[str] = None
    sender_name: str
    sender_email: str
    recipient_email: Optional[str] = None
    subject: str
    snippet: str
    body: str
    received_at: str
    is_read: bool = False
    priority: str = "Medium"  # Critical, High, Medium, Low
    priority_reason: Optional[str] = None
    action_items: List[str] = Field(default_factory=list)
    deadlines: List[DeadlineItem] = Field(default_factory=list)
    summary: Optional[str] = None
    requires_reply: bool = False
    is_demo: bool = False
    labels: List[str] = Field(default_factory=list)

class EmailListResponse(BaseModel):
    emails: List[EmailResponse]
    total: int
    unread_count: int
    critical_count: int
    is_demo: bool = False

class EmailPrioritizationRequest(BaseModel):
    email_id: str

class EmailMarkReadRequest(BaseModel):
    is_read: bool = True
