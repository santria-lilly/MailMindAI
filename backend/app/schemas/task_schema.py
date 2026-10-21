from pydantic import BaseModel, Field
from typing import Optional

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = ""
    priority: str = "Medium"  # Critical, High, Medium, Low
    due_date: Optional[str] = None
    email_id: Optional[str] = None

class TaskCreate(TaskBase):
    is_demo: bool = False

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None  # pending, completed
    due_date: Optional[str] = None

class TaskResponse(BaseModel):
    id: str
    email_id: Optional[str] = None
    title: str
    description: str = ""
    priority: str = "Medium"
    status: str = "pending"
    due_date: Optional[str] = None
    created_at: str
    updated_at: str
    is_demo: bool = False
    email_subject: Optional[str] = None
