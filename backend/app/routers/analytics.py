import json
from datetime import datetime, timezone
from fastapi import APIRouter
from app.database import get_db_connection

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("")
def get_analytics():
    """Calculates statistics, priority distributions, and dashboard metrics."""
    with get_db_connection() as conn:
        cursor = conn.cursor()

        # Email priority counts
        cursor.execute("""
            SELECT priority, COUNT(*) as count
            FROM emails
            GROUP BY priority
        """)
        priority_rows = cursor.fetchall()
        priority_dist = {r["priority"]: r["count"] for r in priority_rows}
        for p in ["Critical", "High", "Medium", "Low"]:
            if p not in priority_dist:
                priority_dist[p] = 0

        # Total, unread, demo counts
        cursor.execute("SELECT COUNT(*) as total FROM emails")
        total_emails = cursor.fetchone()["total"]

        cursor.execute("SELECT COUNT(*) as unread FROM emails WHERE is_read = 0")
        unread_emails = cursor.fetchone()["unread"]

        cursor.execute("SELECT COUNT(*) as demo FROM emails WHERE is_demo = 1")
        demo_emails = cursor.fetchone()["demo"]

        # Tasks stats
        cursor.execute("SELECT COUNT(*) as total FROM tasks")
        total_tasks = cursor.fetchone()["total"]

        cursor.execute("SELECT COUNT(*) as completed FROM tasks WHERE status = 'completed'")
        completed_tasks = cursor.fetchone()["completed"]

        pending_tasks = total_tasks - completed_tasks

        # Tasks due today or overdue
        today_str = datetime.now().strftime("%Y-%m-%d")
        
        cursor.execute("""
            SELECT COUNT(*) as count FROM tasks
            WHERE status = 'pending' AND due_date = ?
        """, (today_str,))
        tasks_due_today = cursor.fetchone()["count"]

        cursor.execute("""
            SELECT COUNT(*) as count FROM tasks
            WHERE status = 'pending' AND due_date < ?
        """, (today_str,))
        tasks_overdue = cursor.fetchone()["count"]

        # Top 3 tasks to prioritize today
        cursor.execute("""
            SELECT t.*, e.subject as email_subject
            FROM tasks t
            LEFT JOIN emails e ON t.email_id = e.id
            WHERE t.status = 'pending'
            ORDER BY
                CASE t.priority
                    WHEN 'Critical' THEN 1
                    WHEN 'High' THEN 2
                    WHEN 'Medium' THEN 3
                    WHEN 'Low' THEN 4
                    ELSE 5
                END,
                t.due_date ASC
            LIMIT 3
        """)
        top_tasks = [dict(r) for r in cursor.fetchall()]

        # Recent important emails (Critical or High)
        cursor.execute("""
            SELECT id, sender_name, subject, priority, received_at, is_read, summary
            FROM emails
            WHERE priority IN ('Critical', 'High')
            ORDER BY received_at DESC
            LIMIT 5
        """)
        recent_important = [dict(r) for r in cursor.fetchall()]

        # Extract upcoming deadlines from emails
        cursor.execute("SELECT id, subject, deadlines FROM emails WHERE deadlines != '[]' AND deadlines IS NOT NULL")
        deadline_rows = cursor.fetchall()
        upcoming_deadlines = []
        for r in deadline_rows:
            try:
                d_list = json.loads(r["deadlines"])
                for item in d_list:
                    upcoming_deadlines.append({
                        "email_id": r["id"],
                        "email_subject": r["subject"],
                        "title": item.get("title", "Deadline"),
                        "date": item.get("date", ""),
                        "is_urgent": item.get("is_urgent", False)
                    })
            except Exception:
                pass

        # Sort upcoming deadlines
        upcoming_deadlines = upcoming_deadlines[:6]

    return {
        "email_stats": {
            "total": total_emails,
            "unread": unread_emails,
            "critical": priority_dist.get("Critical", 0),
            "high": priority_dist.get("High", 0),
            "medium": priority_dist.get("Medium", 0),
            "low": priority_dist.get("Low", 0),
            "is_demo_dataset": demo_emails > 0 and (demo_emails == total_emails or total_emails == 0)
        },
        "task_stats": {
            "total": total_tasks,
            "pending": pending_tasks,
            "completed": completed_tasks,
            "due_today": tasks_due_today,
            "overdue": tasks_overdue,
            "completion_rate": round((completed_tasks / total_tasks * 100), 1) if total_tasks > 0 else 0
        },
        "top_priorities_today": top_tasks,
        "recent_important_emails": recent_important,
        "upcoming_deadlines": upcoming_deadlines
    }
