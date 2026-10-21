from pydantic import BaseModel
from typing import Optional

class ReplyGenerateRequest(BaseModel):
    email_id: str
    tone: str = "Professional"  # Professional, Friendly, Formal, Concise
    additional_context: Optional[str] = None

class ReplyGenerateResponse(BaseModel):
    reply_text: str
    subject: str
    recipient_email: str
    tone: str
    engine_used: str

class SendReplyRequest(BaseModel):
    email_id: str
    subject: str
    recipient_email: str
    reply_body: str
    is_demo: bool = False

class SendReplyResponse(BaseModel):
    success: bool
    message: str
    message_id: Optional[str] = None
    sent_at: Optional[str] = None
