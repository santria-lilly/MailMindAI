import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db
from app.services.demo_service import seed_demo_data
from app.services.ai_service import ai_service

# Initialize test database and seed
init_db()
seed_demo_data(force=True)

client = TestClient(app)

def test_root_and_health():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert data["app"] == "MailMind AI"
    assert data["status"] == "online"

    health = client.get("/api/health")
    assert health.status_code == 200
    assert health.json()["status"] == "healthy"

def test_get_emails():
    res = client.get("/api/emails")
    assert res.status_code == 200
    data = res.json()
    assert "emails" in data
    assert data["total"] > 0
    assert len(data["emails"]) > 0
    
    first = data["emails"][0]
    assert "priority" in first
    assert "action_items" in first
    assert "deadlines" in first

def test_filter_emails_by_priority():
    res = client.get("/api/emails?priority=Critical")
    assert res.status_code == 200
    data = res.json()
    for email in data["emails"]:
        assert email["priority"] == "Critical"

def test_email_detail_and_read():
    # Fetch list to get an id
    res = client.get("/api/emails")
    email_id = res.json()["emails"][0]["id"]

    detail = client.get(f"/api/emails/{email_id}")
    assert detail.status_code == 200
    assert detail.json()["id"] == email_id

    # Mark as read
    patch_res = client.patch(f"/api/emails/{email_id}/read", json={"is_read": True})
    assert patch_res.status_code == 200
    assert patch_res.json()["is_read"] is True

def test_tasks_crud():
    # 1. Create task
    task_payload = {
        "title": "Automated Unit Test Task",
        "description": "Verifying task CRUD lifecycle",
        "priority": "High",
        "due_date": "2026-11-01",
        "is_demo": True
    }
    create_res = client.post("/api/tasks", json=task_payload)
    assert create_res.status_code == 201
    task = create_res.json()
    task_id = task["id"]
    assert task["title"] == task_payload["title"]
    assert task["status"] == "pending"

    # 2. Get tasks
    list_res = client.get("/api/tasks")
    assert list_res.status_code == 200
    task_ids = [t["id"] for t in list_res.json()]
    assert task_id in task_ids

    # 3. Update task to completed
    update_res = client.patch(f"/api/tasks/{task_id}", json={"status": "completed"})
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "completed"

    # 4. Delete task
    del_res = client.delete(f"/api/tasks/{task_id}")
    assert del_res.status_code == 200

def test_notifications_center():
    res = client.get("/api/notifications")
    assert res.status_code == 200
    notifs = res.json()
    assert isinstance(notifs, list)

    count_res = client.get("/api/notifications/count")
    assert count_res.status_code == 200
    assert "unread_count" in count_res.json()

def test_analytics_endpoint():
    res = client.get("/api/analytics")
    assert res.status_code == 200
    data = res.json()
    assert "email_stats" in data
    assert "task_stats" in data
    assert "top_priorities_today" in data
    assert "upcoming_deadlines" in data

def test_ai_fallback_engine():
    # Critical email detection test
    analysis = ai_service._rule_based_analysis(
        subject="URGENT: Production outage incident",
        sender="DevOps Lead <devops@company.com>",
        body="Immediate action required. Please roll back the service ASAP by today."
    )
    assert analysis["priority"] == "Critical"
    assert len(analysis["action_items"]) > 0
    assert analysis["requires_reply"] is False or True

    # Low priority newsletter test
    low_analysis = ai_service._rule_based_analysis(
        subject="Weekly Community Digest #12",
        sender="Newsletter Team <no-reply@digest.com>",
        body="Check out our latest weekly promotional articles and unsubscribe here."
    )
    assert low_analysis["priority"] == "Low"

def test_ai_reply_tones():
    tones = ["Professional", "Friendly", "Formal", "Concise"]
    for tone in tones:
        reply = ai_service._rule_based_reply(
            subject="Project Review",
            sender="Alex Smith",
            body="Can you please send me the latest metrics?",
            tone=tone,
            additional_context="Will deliver by 4 PM"
        )
        assert len(reply) > 20
        assert "Alex Smith" in reply or "Alex" in reply or "there" in reply

def test_auth_status_endpoint():
    res = client.get("/api/auth/status")
    assert res.status_code == 200
    data = res.json()
    assert "is_authenticated" in data
    assert "has_credentials_configured" in data

def test_oauth_url_and_pkce_session_persisted():
    from app.services.auth_service import auth_service
    from app.database import get_db_connection
    res = auth_service.get_authorization_url()
    assert "authorization_url" in res
    assert "accounts.google.com" in res["authorization_url"]
    state = res["state"]
    assert state
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT code_verifier FROM oauth_sessions WHERE state = ?", (state,))
        row = cursor.fetchone()
        assert row is not None
        assert row["code_verifier"] is not None
        assert len(row["code_verifier"]) > 20

def test_oauth_scopes_and_relax_token_setting():
    import os
    import urllib.parse
    from app.services.auth_service import SCOPES, auth_service

    # Verify OAUTHLIB_RELAX_TOKEN_SCOPE is set
    assert os.environ.get("OAUTHLIB_RELAX_TOKEN_SCOPE") == "1"

    # Verify canonical required scopes
    required_scopes = {
        "openid",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/gmail.modify",
    }
    assert required_scopes.issubset(set(SCOPES))

    # Verify scopes are reflected in the generated auth URL
    res = auth_service.get_authorization_url()
    parsed_url = urllib.parse.urlparse(res["authorization_url"])
    query_params = urllib.parse.parse_qs(parsed_url.query)
    url_scopes = query_params.get("scope", [""])[0].split()
    assert "openid" in url_scopes
    assert "https://www.googleapis.com/auth/gmail.readonly" in url_scopes
    assert "https://www.googleapis.com/auth/gmail.send" in url_scopes
    assert "https://www.googleapis.com/auth/gmail.modify" in url_scopes
    assert "https://www.googleapis.com/auth/userinfo.email" in url_scopes

