import sqlite3
import json
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Generator, Any, Dict, List, Optional
from app.config import settings

def get_db_path() -> Path:
    p = Path(settings.DATABASE_PATH)
    p.parent.mkdir(parents=True, exist_ok=True)
    return p

@contextmanager
def get_db_connection() -> Generator[sqlite3.Connection, None, None]:
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db() -> None:
    """Initialize database tables with appropriate schema and indices."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Emails Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS emails (
                id TEXT PRIMARY KEY,
                thread_id TEXT,
                sender_name TEXT,
                sender_email TEXT,
                recipient_email TEXT,
                subject TEXT,
                snippet TEXT,
                body TEXT,
                received_at TEXT,
                is_read INTEGER DEFAULT 0,
                priority TEXT DEFAULT 'Medium',
                priority_reason TEXT,
                action_items TEXT DEFAULT '[]',
                deadlines TEXT DEFAULT '[]',
                summary TEXT,
                requires_reply INTEGER DEFAULT 0,
                is_demo INTEGER DEFAULT 0,
                labels TEXT DEFAULT '[]',
                created_at TEXT
            );
        """)

        # Tasks Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id TEXT PRIMARY KEY,
                email_id TEXT,
                title TEXT NOT NULL,
                description TEXT DEFAULT '',
                priority TEXT DEFAULT 'Medium',
                status TEXT DEFAULT 'pending',
                due_date TEXT,
                created_at TEXT,
                updated_at TEXT,
                is_demo INTEGER DEFAULT 0,
                FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE SET NULL
            );
        """)

        # Notifications Table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id TEXT PRIMARY KEY,
                type TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                link_id TEXT,
                priority TEXT DEFAULT 'Medium',
                is_read INTEGER DEFAULT 0,
                created_at TEXT,
                is_demo INTEGER DEFAULT 0
            );
        """)

        # OAuth Tokens Table (Store encrypted or serialized token info securely)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS oauth_tokens (
                user_email TEXT PRIMARY KEY,
                token_data TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );
        """)

        # OAuth Sessions Table (PKCE code_verifier & state parameter persistence)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS oauth_sessions (
                state TEXT PRIMARY KEY,
                code_verifier TEXT,
                created_at TEXT NOT NULL
            );
        """)

        # Indices for optimal query performance
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_emails_priority ON emails(priority);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_emails_is_read ON emails(is_read);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_emails_received_at ON emails(received_at DESC);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_emails_is_demo ON emails(is_demo);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);")
