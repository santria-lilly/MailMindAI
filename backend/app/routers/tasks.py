import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from app.database import get_db_connection
from app.schemas.task_schema import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

def _format_task_row(row) -> TaskResponse:
    email_subject = None
    try:
        email_subject = row["email_subject"]
    except (IndexError, KeyError):
        pass

    return TaskResponse(
        id=row["id"],
        email_id=row["email_id"],
        title=row["title"],
        description=row["description"] or "",
        priority=row["priority"],
        status=row["status"],
        due_date=row["due_date"],
        created_at=row["created_at"],
        updated_at=row["updated_at"],
        is_demo=bool(row["is_demo"]),
        email_subject=email_subject
    )

@router.get("", response_model=List[TaskResponse])
def get_tasks(
    status: Optional[str] = Query(None, description="Filter by status: pending, completed"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    is_demo: Optional[bool] = Query(None)
):
    """Retrieves tasks sorted by priority and due date."""
    query_parts = ["1=1"]
    params = []

    if status:
        query_parts.append("t.status = ?")
        params.append(status)

    if priority:
        query_parts.append("t.priority = ?")
        params.append(priority)

    if is_demo is not None:
        query_parts.append("t.is_demo = ?")
        params.append(1 if is_demo else 0)

    where_clause = " AND ".join(query_parts)

    with get_db_connection() as conn:
        cursor = conn.cursor()
        query = f"""
            SELECT t.*, e.subject as email_subject
            FROM tasks t
            LEFT JOIN emails e ON t.email_id = e.id
            WHERE {where_clause}
            ORDER BY
                CASE t.status WHEN 'pending' THEN 0 ELSE 1 END,
                CASE t.priority
                    WHEN 'Critical' THEN 1
                    WHEN 'High' THEN 2
                    WHEN 'Medium' THEN 3
                    WHEN 'Low' THEN 4
                    ELSE 5
                END,
                t.due_date ASC
        """
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [_format_task_row(r) for r in rows]

@router.post("", response_model=TaskResponse, status_code=201)
def create_task(payload: TaskCreate):
    """Creates a new task, optionally linked to an email or action item."""
    task_id = f"task-{uuid.uuid4().hex[:8]}"
    now_str = datetime.now(timezone.utc).isoformat()

    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Verify email exists if email_id is provided
        email_subject = None
        if payload.email_id:
            cursor.execute("SELECT subject FROM emails WHERE id = ?", (payload.email_id,))
            email_row = cursor.fetchone()
            if email_row:
                email_subject = email_row["subject"]

        cursor.execute("""
            INSERT INTO tasks (
                id, email_id, title, description, priority, status,
                due_date, created_at, updated_at, is_demo
            ) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?)
        """, (
            task_id,
            payload.email_id,
            payload.title.strip(),
            payload.description or "",
            payload.priority,
            payload.due_date,
            now_str,
            now_str,
            1 if payload.is_demo else 0
        ))

        cursor.execute("""
            SELECT t.*, e.subject as email_subject
            FROM tasks t
            LEFT JOIN emails e ON t.email_id = e.id
            WHERE t.id = ?
        """, (task_id,))
        new_row = cursor.fetchone()
        return _format_task_row(new_row)

@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(task_id: str, payload: TaskUpdate):
    """Updates task fields (status, priority, due date, title)."""
    now_str = datetime.now(timezone.utc).isoformat()
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
        task_row = cursor.fetchone()
        if not task_row:
            raise HTTPException(status_code=404, detail="Task not found")

        updates = []
        params = []

        if payload.title is not None:
            updates.append("title = ?")
            params.append(payload.title.strip())

        if payload.description is not None:
            updates.append("description = ?")
            params.append(payload.description)

        if payload.priority is not None:
            updates.append("priority = ?")
            params.append(payload.priority)

        if payload.status is not None:
            updates.append("status = ?")
            params.append(payload.status)

        if payload.due_date is not None:
            updates.append("due_date = ?")
            params.append(payload.due_date)

        if not updates:
            cursor.execute("""
                SELECT t.*, e.subject as email_subject
                FROM tasks t
                LEFT JOIN emails e ON t.email_id = e.id
                WHERE t.id = ?
            """, (task_id,))
            return _format_task_row(cursor.fetchone())

        updates.append("updated_at = ?")
        params.append(now_str)
        params.append(task_id)

        update_sql = f"UPDATE tasks SET {', '.join(updates)} WHERE id = ?"
        cursor.execute(update_sql, params)

        cursor.execute("""
            SELECT t.*, e.subject as email_subject
            FROM tasks t
            LEFT JOIN emails e ON t.email_id = e.id
            WHERE t.id = ?
        """, (task_id,))
        return _format_task_row(cursor.fetchone())

@router.delete("/{task_id}")
def delete_task(task_id: str):
    """Deletes a task by ID."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Task not found")
    return {"success": True, "message": "Task deleted successfully", "task_id": task_id}
