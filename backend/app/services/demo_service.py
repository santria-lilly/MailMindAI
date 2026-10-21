import json
from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
from app.database import get_db_connection

DEMO_EMAILS: List[Dict[str, Any]] = [
    {
        "id": "demo-email-001",
        "thread_id": "thread-001",
        "sender_name": "Sarah Jenkins (CTO)",
        "sender_email": "s.jenkins@enterprise-tech.io",
        "recipient_email": "user@mailmind.ai",
        "subject": "CRITICAL INCIDENT: Production Service Degradation on Core API",
        "snippet": "We have detected severe latency spikes and connection timeouts across cluster-east. Immediate intervention is required before 2:00 PM...",
        "body": (
            "Team,\n\n"
            "At 11:42 AM UTC, our monitoring alerts flagged a SEV-1 incident on the primary payment processing gateway. "
            "Customer transaction latencies have exceeded 4500ms and failure rates have spiked to 8.2%.\n\n"
            "Action required immediately:\n"
            "1. Roll back release v2.4.1 to the last stable build (v2.4.0).\n"
            "2. Inspect database connection pool exhaustion logs in Datadog.\n"
            "3. Join the emergency war room bridge and provide an ETA for restoration by 2:00 PM today.\n\n"
            "Please confirm receipt of this directive immediately and ping the #incident-war-room Slack channel.\n\n"
            "Regards,\n"
            "Sarah Jenkins\n"
            "Chief Technology Officer"
        ),
        "received_at": (datetime.now(timezone.utc) - timedelta(minutes=24)).isoformat(),
        "is_read": False,
        "priority": "Critical",
        "priority_reason": "Executive SEV-1 incident alert with immediate rollback mandate and strict 2:00 PM milestone.",
        "action_items": [
            "Roll back release v2.4.1 to stable v2.4.0",
            "Investigate connection pool exhaustion logs in Datadog",
            "Join emergency war room bridge and provide ETA by 2:00 PM"
        ],
        "deadlines": [
            {
                "title": "Incident Resolution ETA",
                "date": (datetime.now() + timedelta(hours=2)).strftime("%Y-%m-%d %H:%M"),
                "is_urgent": True
            }
        ],
        "summary": "SEV-1 incident detected on core payment gateway with latency spikes. CTO mandates immediate rollback to v2.4.0 and ETA update by 2:00 PM.",
        "requires_reply": True,
        "is_demo": True,
        "labels": ["Incident", "Executive", "Action Required"]
    },
    {
        "id": "demo-email-002",
        "thread_id": "thread-002",
        "sender_name": "Prof. Vikram Nair (Capstone Chair)",
        "sender_email": "vnair@university.edu",
        "recipient_email": "user@mailmind.ai",
        "subject": "FINAL DEADLINE: Camera-Ready Submission & Artifact Repository Due Tonight",
        "snippet": "Reminder: The portal closes tonight at 11:59 PM sharp for all final capstone submissions and GitHub repo archives...",
        "body": (
            "Dear Student,\n\n"
            "This is a formal reminder that the IEEE Capstone Conference portal will close at 11:59 PM tonight (strict deadline).\n\n"
            "Before the portal locks, please ensure you have completed the following:\n"
            "* Upload the final camera-ready PDF formatted in standard two-column IEEE format.\n"
            "* Submit the public GitHub repository link containing your complete source code and documentation.\n"
            "* Complete and electronically sign the copyright release consent form.\n\n"
            "Late submissions will automatically forfeit eligibility for conference publication.\n\n"
            "Best of luck,\n"
            "Prof. Vikram Nair, Ph.D.\n"
            "Faculty Evaluation Board Chair"
        ),
        "received_at": (datetime.now(timezone.utc) - timedelta(hours=2, minutes=10)).isoformat(),
        "is_read": False,
        "priority": "Critical",
        "priority_reason": "Final academic capstone submission deadline tonight at 11:59 PM. Critical consequences if missed.",
        "action_items": [
            "Upload final camera-ready PDF in IEEE two-column format",
            "Submit public GitHub repository link with full documentation",
            "Electronically sign copyright consent release form"
        ],
        "deadlines": [
            {
                "title": "Portal Submission Cutoff",
                "date": datetime.now().strftime("%Y-%m-%d 23:59"),
                "is_urgent": True
            }
        ],
        "summary": "Firm deadline tonight at 11:59 PM to submit camera-ready IEEE paper, public GitHub repository, and signed copyright consent form.",
        "requires_reply": False,
        "is_demo": True,
        "labels": ["Academic", "Deadline", "Capstone"]
    },
    {
        "id": "demo-email-003",
        "thread_id": "thread-003",
        "sender_name": "Elena Rostova (VP Finance)",
        "sender_email": "e.rostova@enterprise-tech.io",
        "recipient_email": "user@mailmind.ai",
        "subject": "Urgent Review: Q4 Engineering Cloud Budget & Headcount Allocation",
        "snippet": "Please review the updated Q4 allocation sheet. We need your departmental sign-off ahead of tomorrow morning's executive board review...",
        "body": (
            "Hi team,\n\n"
            "Attached is the finalized Q4 operating budget draft for engineering infrastructure and new AI services tooling.\n\n"
            "We have reallocated an additional $35,000 toward GPU compute and cloud API credits. "
            "Could you please review the attached breakdown and provide written sign-off before 10:00 AM tomorrow?\n\n"
            "Items for your attention:\n"
            "- Verify forecasted API spend for the smart email triage microservices\n"
            "- Confirm team workstation hardware upgrades\n\n"
            "Thank you,\n"
            "Elena Rostova\n"
            "Vice President of Financial Operations"
        ),
        "received_at": (datetime.now(timezone.utc) - timedelta(hours=4)).isoformat(),
        "is_read": True,
        "priority": "High",
        "priority_reason": "Financial sign-off requested by Vice President ahead of executive board review tomorrow morning.",
        "action_items": [
            "Review Q4 budget spreadsheet for engineering compute allocation",
            "Confirm forecasted API spend for AI microservices",
            "Send formal written sign-off by 10:00 AM tomorrow"
        ],
        "deadlines": [
            {
                "title": "Executive Board Budget Review",
                "date": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d 10:00"),
                "is_urgent": True
            }
        ],
        "summary": "VP Finance requests formal review and written sign-off on Q4 engineering cloud and API budgets by 10:00 AM tomorrow morning.",
        "requires_reply": True,
        "is_demo": True,
        "labels": ["Finance", "High Priority"]
    },
    {
        "id": "demo-email-004",
        "thread_id": "thread-004",
        "sender_name": "David Chen (Lead Architect)",
        "sender_email": "dchen@tech-partners.org",
        "recipient_email": "user@mailmind.ai",
        "subject": "Client SOC-2 Security Questionnaire: Input needed by Thursday",
        "snippet": "Our enterprise banking client requested our data retention and encryption practices for the AI classification pipeline...",
        "body": (
            "Hi,\n\n"
            "The enterprise compliance audit team from Horizon Bank submitted their vendor security evaluation questionnaire. "
            "They have 12 specific questions concerning:\n\n"
            "1. End-to-end encryption in transit (TLS 1.3) and at rest (AES-256 for SQLite / tokens).\n"
            "2. Handling of sensitive PII in email payloads sent to LLM endpoints.\n"
            "3. OAuth token revocation mechanisms and token expiry policies.\n\n"
            "Please review questions 4 through 8 and send your answers by Thursday 3:00 PM so we can package the final submission.\n\n"
            "Best,\n"
            "David Chen"
        ),
        "received_at": (datetime.now(timezone.utc) - timedelta(hours=6)).isoformat(),
        "is_read": False,
        "priority": "High",
        "priority_reason": "Client audit compliance questionnaire requiring technical security responses by Thursday.",
        "action_items": [
            "Review security audit questions 4 through 8",
            "Document encryption and token security policies",
            "Return responses to David Chen by Thursday 3:00 PM"
        ],
        "deadlines": [
            {
                "title": "SOC-2 Questionnaire Feedback",
                "date": (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d 15:00"),
                "is_urgent": False
            }
        ],
        "summary": "Enterprise banking partner requests technical answers on encryption, PII handling, and OAuth security by Thursday 3:00 PM.",
        "requires_reply": True,
        "is_demo": True,
        "labels": ["Security", "Compliance"]
    },
    {
        "id": "demo-email-005",
        "thread_id": "thread-005",
        "sender_name": "Maya Lin (Senior Product Manager)",
        "sender_email": "mlin@enterprise-tech.io",
        "recipient_email": "user@mailmind.ai",
        "subject": "Sprint 14 Retrospective & Feature Demo: Friday 4:00 PM",
        "snippet": "Agenda is live for our upcoming bi-weekly sprint retrospective. Please add any kudos or process blocker topics...",
        "body": (
            "Hello team,\n\n"
            "We are approaching the conclusion of Sprint 14! The retro and demo session is scheduled for this Friday at 4:00 PM.\n\n"
            "Please remember to:\n"
            "- Update the status of your Jira tickets before noon on Friday\n"
            "- Add at least one reflection item to our Miro board (What went well / What can we improve)\n"
            "- If you plan to demonstrate the AI Email Triage prototype, verify your test environment beforehand\n\n"
            "Looking forward to celebrating our sprint wins!\n\n"
            "Maya"
        ),
        "received_at": (datetime.now(timezone.utc) - timedelta(hours=14)).isoformat(),
        "is_read": True,
        "priority": "Medium",
        "priority_reason": "Standard sprint cadence and team retrospective scheduled for Friday.",
        "action_items": [
            "Update Jira ticket statuses before Friday noon",
            "Add retrospective feedback notes to Miro board",
            "Verify live demo environment for the MailMind prototype"
        ],
        "deadlines": [
            {
                "title": "Sprint 14 Retrospective",
                "date": (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d 16:00"),
                "is_urgent": False
            }
        ],
        "summary": "Sprint 14 demo and retrospective set for Friday at 4:00 PM. Team requested to update Jira tickets and add Miro board notes.",
        "requires_reply": False,
        "is_demo": True,
        "labels": ["Product", "Agile"]
    },
    {
        "id": "demo-email-006",
        "thread_id": "thread-006",
        "sender_name": "Dr. Aris Thorne (Dean of Engineering)",
        "sender_email": "dean.office@university.edu",
        "recipient_email": "user@mailmind.ai",
        "subject": "Invitation: Keynote Session on Autonomous Agent Architectures",
        "snippet": "We would like to cordially invite you to speak at the upcoming Computing Systems Symposium next month...",
        "body": (
            "Dear Colleague,\n\n"
            "On behalf of the Faculty of Engineering and Applied Sciences, it is our distinct pleasure to invite you "
            "as a keynote speaker for the 2026 Computing Systems Symposium.\n\n"
            "Given your impressive work on MailMind AI and autonomous workflow agents, our faculty and graduate researchers "
            "would be honored to hear your insights on real-world AI integration, OAuth security, and deterministic fallback systems.\n\n"
            "The symposium is scheduled for November 18th. Please let us know if your schedule permits participation by next Monday.\n\n"
            "Warm regards,\n"
            "Dr. Aris Thorne\n"
            "Dean of Engineering"
        ),
        "received_at": (datetime.now(timezone.utc) - timedelta(days=1, hours=3)).isoformat(),
        "is_read": True,
        "priority": "Medium",
        "priority_reason": "Distinguished invitation to deliver keynote address at annual engineering symposium.",
        "action_items": [
            "Review symposium keynote agenda for November 18",
            "Reply with availability and session title by next Monday"
        ],
        "deadlines": [
            {
                "title": "Keynote RSVP Deadline",
                "date": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
                "is_urgent": False
            }
        ],
        "summary": "Dean of Engineering invites you to present a keynote lecture on autonomous agent architectures at the November symposium.",
        "requires_reply": True,
        "is_demo": True,
        "labels": ["Academic", "Speaking"]
    },
    {
        "id": "demo-email-007",
        "thread_id": "thread-007",
        "sender_name": "AWS Cloud Billing Team",
        "sender_email": "no-reply-billing@amazon.com",
        "recipient_email": "user@mailmind.ai",
        "subject": "Monthly Cloud Infrastructure Usage Summary - October",
        "snippet": "Your AWS billing statement for the current billing cycle is now available in the AWS Billing Console...",
        "body": (
            "Dear Customer,\n\n"
            "Your monthly AWS account billing statement is now available.\n\n"
            "Account ID: 8492-4820-1192\n"
            "Billing Period: October 1 - October 31\n"
            "Total Incurred Charges: $42.18 USD\n\n"
            "Your registered credit card ending in 4012 will be processed automatically on November 3.\n"
            "No manual action is required unless you wish to dispute any usage charges.\n\n"
            "Thank you for choosing Amazon Web Services."
        ),
        "received_at": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat(),
        "is_read": True,
        "priority": "Low",
        "priority_reason": "Automated monthly infrastructure invoice with automatic credit card payment.",
        "action_items": [],
        "deadlines": [],
        "summary": "Automated monthly AWS usage invoice for $42.18 USD. Charged automatically to registered card on November 3.",
        "requires_reply": False,
        "is_demo": True,
        "labels": ["Billing", "Automated"]
    },
    {
        "id": "demo-email-008",
        "thread_id": "thread-008",
        "sender_name": "Tech Radar Weekly",
        "sender_email": "digest@techradarweekly.dev",
        "recipient_email": "user@mailmind.ai",
        "subject": "Tech Radar #88: The Evolution of Local AI Models & Multi-Agent Frameworks",
        "snippet": "In this week's issue: Why smaller distilled models are dominating production edge deployments, plus Rust vs Go benchmarks...",
        "body": (
            "Hey Devs!\n\n"
            "Welcome to Issue #88 of Tech Radar Weekly.\n\n"
            "Top stories this week:\n"
            "1. How modern teams deploy resilient fallback engines alongside frontier LLMs\n"
            "2. Optimizing SQLite for high-throughput single-node microservices\n"
            "3. Tailwind CSS design systems for executive productivity tools\n\n"
            "Enjoy reading, and see you next Tuesday!\n"
            "— The Tech Radar Editorial Board"
        ),
        "received_at": (datetime.now(timezone.utc) - timedelta(days=3)).isoformat(),
        "is_read": True,
        "priority": "Low",
        "priority_reason": "Weekly technical educational newsletter. Informational content with no action required.",
        "action_items": [],
        "deadlines": [],
        "summary": "Weekly tech digest covering local AI models, resilient fallback engines, and modern frontend productivity designs.",
        "requires_reply": False,
        "is_demo": True,
        "labels": ["Newsletter"]
    }
]

DEMO_TASKS = [
    {
        "id": "demo-task-001",
        "email_id": "demo-email-001",
        "title": "Resolve Project Alpha SEV-1 production deployment blocker",
        "description": "Roll back release v2.4.1 to v2.4.0 and provide ETA to CTO Sarah Jenkins by 2:00 PM.",
        "priority": "Critical",
        "status": "pending",
        "due_date": datetime.now().strftime("%Y-%m-%d"),
        "is_demo": True
    },
    {
        "id": "demo-task-002",
        "email_id": "demo-email-002",
        "title": "Upload IEEE Capstone Camera-Ready PDF & Repository Archive",
        "description": "Format two-column PDF and submit public repository link before midnight portal closure.",
        "priority": "Critical",
        "status": "pending",
        "due_date": datetime.now().strftime("%Y-%m-%d"),
        "is_demo": True
    },
    {
        "id": "demo-task-003",
        "email_id": "demo-email-003",
        "title": "Review and sign off on Q4 Engineering Cloud & GPU Budget",
        "description": "Check $35k compute reallocations and confirm with VP Elena Rostova.",
        "priority": "High",
        "status": "pending",
        "due_date": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"),
        "is_demo": True
    },
    {
        "id": "demo-task-004",
        "email_id": "demo-email-004",
        "title": "Answer SOC-2 Security Questionnaire (Questions 4-8)",
        "description": "Provide data encryption and OAuth lifecycle documentation for Horizon Bank audit.",
        "priority": "High",
        "status": "pending",
        "due_date": (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d"),
        "is_demo": True
    },
    {
        "id": "demo-task-005",
        "email_id": "demo-email-005",
        "title": "Submit weekly progress report to project advisor",
        "description": "Document Sprint 14 milestones and prototype metrics.",
        "priority": "Medium",
        "status": "completed",
        "due_date": (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"),
        "is_demo": True
    }
]

DEMO_NOTIFICATIONS = [
    {
        "id": "demo-notif-001",
        "type": "urgent_email",
        "title": "SEV-1 Production Incident Alert",
        "message": "CTO Sarah Jenkins issued a critical rollback directive for release v2.4.1.",
        "link_id": "demo-email-001",
        "priority": "Critical",
        "is_read": False,
        "is_demo": True
    },
    {
        "id": "demo-notif-002",
        "type": "deadline",
        "title": "Approaching Submission Deadline",
        "message": "IEEE Capstone Conference camera-ready portal closes tonight at 11:59 PM.",
        "link_id": "demo-email-002",
        "priority": "Critical",
        "is_read": False,
        "is_demo": True
    },
    {
        "id": "demo-notif-003",
        "type": "overdue_task",
        "title": "Task Reminder",
        "message": "Project Alpha production incident requires status update before 2:00 PM.",
        "link_id": "demo-task-001",
        "priority": "High",
        "is_read": False,
        "is_demo": True
    },
    {
        "id": "demo-notif-004",
        "type": "unanswered",
        "title": "Unanswered High-Priority Email",
        "message": "Elena Rostova requested budget approval feedback before tomorrow morning.",
        "link_id": "demo-email-003",
        "priority": "High",
        "is_read": True,
        "is_demo": True
    }
]

def seed_demo_data(force: bool = False) -> None:
    """
    Seeds realistic demo emails, tasks, and notifications into SQLite.
    If data already exists and force is False, preserves user changes.
    """
    now_str = datetime.now(timezone.utc).isoformat()
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Check if demo emails already exist
        cursor.execute("SELECT COUNT(*) as count FROM emails WHERE is_demo = 1")
        row = cursor.fetchone()
        demo_count = row["count"] if row else 0

        if demo_count > 0 and not force:
            return  # Already seeded

        if force:
            cursor.execute("DELETE FROM notifications WHERE is_demo = 1")
            cursor.execute("DELETE FROM tasks WHERE is_demo = 1")
            cursor.execute("DELETE FROM emails WHERE is_demo = 1")

        # Insert Demo Emails
        for email in DEMO_EMAILS:
            cursor.execute("""
                INSERT OR REPLACE INTO emails (
                    id, thread_id, sender_name, sender_email, recipient_email,
                    subject, snippet, body, received_at, is_read, priority,
                    priority_reason, action_items, deadlines, summary,
                    requires_reply, is_demo, labels, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                email["id"],
                email["thread_id"],
                email["sender_name"],
                email["sender_email"],
                email["recipient_email"],
                email["subject"],
                email["snippet"],
                email["body"],
                email["received_at"],
                1 if email["is_read"] else 0,
                email["priority"],
                email["priority_reason"],
                json.dumps(email["action_items"]),
                json.dumps(email["deadlines"]),
                email["summary"],
                1 if email["requires_reply"] else 0,
                1,
                json.dumps(email["labels"]),
                now_str
            ))

        # Insert Demo Tasks
        for task in DEMO_TASKS:
            cursor.execute("""
                INSERT OR REPLACE INTO tasks (
                    id, email_id, title, description, priority, status,
                    due_date, created_at, updated_at, is_demo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                task["id"],
                task["email_id"],
                task["title"],
                task["description"],
                task["priority"],
                task["status"],
                task["due_date"],
                now_str,
                now_str,
                1
            ))

        # Insert Demo Notifications
        for notif in DEMO_NOTIFICATIONS:
            cursor.execute("""
                INSERT OR REPLACE INTO notifications (
                    id, type, title, message, link_id, priority, is_read, created_at, is_demo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                notif["id"],
                notif["type"],
                notif["title"],
                notif["message"],
                notif["link_id"],
                notif["priority"],
                1 if notif["is_read"] else 0,
                now_str,
                1
            ))
