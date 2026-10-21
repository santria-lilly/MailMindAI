# ✉️ MailMind AI — Smart Email Prioritization & Response System

> **Advanced Programming Practices College Project**  
> An autonomous, AI-driven productivity dashboard that intelligently triages emails, extracts deadlines and action items, generates contextual replies across multiple tones, and synchronizes deliverables with SQLite and the official Google Gmail API.

---

## 🎨 Design & Aesthetic System

MailMind AI features a custom-crafted design system inspired by modern executive productivity workspaces:
- **Palette**: Warm beige (`#FAF8F4`), off-white cream (`#FDFCF7`), sage green (`#52796F`, `#354F52`), and charcoal typography (`#1A202C`, `#2D3748`).
- **Typography**: Clean, readable sans-serif (*Plus Jakarta Sans*) paired with editorial serif accents (*Playfair Display*).
- **Components**: Subtle borders, rounded cards, tactile priority badges, glassmorphic dropdowns, and responsive layouts.

---

## 🌟 Core Features

### 1. Executive Command Center (Dashboard)
- **Top Three Priorities Today**: Instant focal deliverables sorted by urgency and due date with 1-click completion.
- **KPI Metrics**: Unread email counts, critical priority alerts, tasks due today, and overdue task counters.
- **Daily AI Briefing**: Synthesizes inbox state, overdue items, and actionable recommendations into a sharp 3-paragraph executive briefing.
- **Upcoming Deadlines**: Chronological calendar milestones extracted from email correspondence.
- **Recent Important Emails**: Quick-triage view of Critical and High priority incoming communications.

### 2. Smart Inbox
- **Multi-Category Prioritization**: Segment emails into **Critical**, **High**, **Medium**, and **Low** with real-time badges.
- **Rich Email Detail View**: View complete email bodies, sender avatars, timestamp headers, and AI priority rationales.
- **Search & Filters**: Search across subject, sender, and snippet, with filters for unread and priority categories.

### 3. AI Prioritization Engine
- **Configurable LLM Integration**: Powered by Google Gemini (`gemini-1.5-flash`) or OpenAI endpoints.
- **Intelligent Deterministic Fallback**: Works **100% reliably without an API key** using an advanced heuristic engine that scores urgency markers, authority senders, and deadlines.
- **Prompt Injection Defense**: Email content is isolated as untrusted data (`<email_data>`) to protect against prompt injection attacks.
- **Action Item Extraction**: Automatically identifies bulleted tasks and imperative action verbs.

### 4. Contextual AI Reply Generator
- **Four Distinct Tones**:
  - 👔 **Professional**: Balanced, diplomatic, and courteous.
  - 😊 **Friendly**: Warm, encouraging, and collaborative.
  - 🏛️ **Formal**: Strict protocol, academic and legal etiquette.
  - ⚡ **Concise**: Direct, bullet-pointed, zero fluff.
- **Editable Draft Workspace**: Full human oversight to modify, copy, or regenerate drafts.
- **Strict Human-in-the-Loop Confirmation**: Sending via Gmail API is permanently gated behind an explicit review and confirmation modal.

### 5. Task Management (SQLite)
- **1-Click Task Conversion**: Turn any extracted action item into a tracked task with one click.
- **Persistent Storage**: CRUD operations stored in local SQLite (`mailmind.db`).
- **Lifecycle Tracking**: Pending and completed states, due date editing, and priority reassignment.

### 6. In-App Notification Center
- **Alert Dropdown**: Live badge count in top navigation.
- **Categorized Alerts**: SEV-1 production emergencies, approaching submission deadlines, overdue tasks, and unanswered high-priority emails.
- **Interactive Navigation**: Clicking a notification opens the relevant email or task directly.

### 7. Workflow Analytics
- **Priority Distribution Bar**: Breakdown of critical, high, medium, and low volume.
- **Task Velocity & Completion Rate**: Visual meters showing pending vs completed tasks.
- **Dataset Transparency**: Clear labeling of live Gmail data versus demonstration datasets.

### 8. Official Gmail API & Google OAuth 2.0
- **Secure OAuth 2.0 Flow**: Offline access tokens with automatic refresh token rotation.
- **Safe Architecture**: Credentials and tokens never leak to the client-side browser.
- **Interactive Setup Screen**: Built-in visual guide if credentials have not been configured yet.

### 9. Demo Mode (Ready for College Presentation)
- **Pre-Seeded Sample Data**: 8 rich, realistic scenarios (SEV-1 production rollback, IEEE conference paper submission, Q4 cloud budget review, SOC-2 compliance questionnaire, agile retro, AWS invoice).
- **1-Click Demo Reset**: Instantly restore clean demo data at any time during an evaluation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS, Lucide React Icons |
| **Backend** | Python 3.11+ / 3.14, FastAPI, Uvicorn, Pydantic v2, HTTPX |
| **Database** | SQLite3 with schema migrations and foreign key enforcement |
| **Email Protocol**| Official Google Gmail API v1, Google Auth OAuthlib |
| **AI / LLM** | Google Gemini API (`v1beta`), OpenAI compatibility, Deterministic Rule Engine |
| **Testing** | Pytest, FastAPI TestClient |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## 📁 Project Structure

```
mailmind-AI/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application, CORS, and lifecycle
│   │   ├── config.py            # Environment settings
│   │   ├── database.py          # SQLite schema, tables, and indices
│   │   ├── schemas/             # Pydantic validation schemas
│   │   │   ├── email_schema.py
│   │   │   ├── task_schema.py
│   │   │   ├── reply_schema.py
│   │   │   └── notification_schema.py
│   │   ├── services/
│   │   │   ├── ai_service.py     # Gemini AI & rule-based fallback engine
│   │   │   ├── gmail_service.py  # Gmail API message sync, fetch, and send
│   │   │   ├── auth_service.py   # Google OAuth 2.0 token management
│   │   │   └── demo_service.py   # Pre-seeded realistic demo dataset
│   │   └── routers/
│   │       ├── emails.py         # Email list, detail, and priority triage
│   │       ├── tasks.py          # Task CRUD endpoints
│   │       ├── ai.py             # Reply generator and daily briefing
│   │       ├── notifications.py  # In-app notification center
│   │       ├── analytics.py      # Metrics and priority distribution
│   │       └── auth.py           # OAuth connect/disconnect and demo reset
│   ├── tests/
│   │   ├── test_api.py          # Pytest suite for API and fallback engine
│   │   └── __init__.py
│   ├── requirements.txt         # Backend Python dependencies
│   ├── run.py                   # Development server entry point
│   ├── Procfile                 # Production web server command
│   ├── .env.example             # Backend environment template
│   └── .env                     # Local backend configuration
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Navigation.tsx
│   │   │   ├── PriorityBadge.tsx
│   │   │   ├── NotificationCenter.tsx
│   │   │   ├── DailyBriefingCard.tsx
│   │   │   ├── EmailDetailModal.tsx
│   │   │   ├── ReplyModal.tsx
│   │   │   └── TaskModal.tsx
│   │   ├── views/               # Main application pages
│   │   │   ├── DashboardView.tsx
│   │   │   ├── InboxView.tsx
│   │   │   ├── TasksView.tsx
│   │   │   ├── AnalyticsView.tsx
│   │   │   └── SettingsView.tsx
│   │   ├── services/
│   │   │   └── api.ts           # Typed API client
│   │   ├── types/
│   │   │   └── index.ts         # TypeScript interfaces
│   │   ├── App.tsx              # Root component with state management
│   │   ├── main.tsx
│   │   └── index.css            # Tailwind directives and custom theme
│   ├── package.json
│   ├── tailwind.config.js       # Custom palette (cream, sage, charcoal)
│   ├── postcss.config.js
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── vite.config.ts
│   ├── .env.example
│   └── .env
├── run_app.bat                  # 1-Click Windows batch launcher
├── run_app.ps1                  # PowerShell launcher script
├── GMAIL_SETUP.md               # Complete Google Cloud & OAuth guide
├── DEPLOYMENT.md                # Vercel & Render cloud deployment guide
├── vercel.json                  # Vercel SPA routing configuration
├── render.yaml                  # Render web service configuration
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start Guide (Windows)

### Option A: 1-Click Launch (Recommended)
Double-click `run_app.bat` or run:
```powershell
.\run_app.bat
```
This automatically launches both the FastAPI backend and the React Vite frontend in separate terminal windows.

---

### Option B: Manual Command Line Launch

#### 1. Start the Backend:
Open a terminal in the root directory:
```powershell
cd backend
python run.py
```
- API will be live at: `http://localhost:8000`
- Interactive Swagger API Documentation: `http://localhost:8000/docs`

#### 2. Start the Frontend:
Open a second terminal in the root directory:
```powershell
cd frontend
cmd /c npm run dev
```
- Web Application will be live at: `http://localhost:5173`

---

## 🧪 Running Automated Tests

MailMind AI includes a comprehensive test suite covering API endpoints, SQLite persistence, and AI rule-based heuristics.

To run the backend tests:
```powershell
python -m pytest backend/tests -v
```

Expected output:
```text
backend/tests/test_api.py::test_root_and_health PASSED            [ 10%]
backend/tests/test_api.py::test_get_emails PASSED                 [ 20%]
backend/tests/test_api.py::test_filter_emails_by_priority PASSED  [ 30%]
backend/tests/test_api.py::test_email_detail_and_read PASSED      [ 40%]
backend/tests/test_api.py::test_tasks_crud PASSED                 [ 50%]
backend/tests/test_api.py::test_notifications_center PASSED       [ 60%]
backend/tests/test_api.py::test_analytics_endpoint PASSED         [ 70%]
backend/tests/test_api.py::test_ai_fallback_engine PASSED         [ 80%]
backend/tests/test_api.py::test_ai_reply_tones PASSED             [ 90%]
backend/tests/test_api.py::test_auth_status_endpoint PASSED       [100%]
======================== 10 passed in 1.15s ========================
```

To test the frontend build:
```powershell
cd frontend
cmd /c npm run build
```

---

## 🎓 College Presentation & Viva Walkthrough

When presenting this project to your professors or evaluators, follow this recommended walkthrough:

1. **Dashboard Overview**:
   - Point out the **Executive Command Center** designed with the custom warm beige, off-white, sage green, and charcoal color palette.
   - Show the **Daily AI Briefing** summarizing today's key focuses.
   - Explain the KPI cards (Unread emails, Critical priority items, Tasks due today).

2. **Demonstrate Smart Inbox & Triage**:
   - Click on the **Smart Inbox** tab.
   - Filter by **Critical** priority: Click the **CRITICAL INCIDENT: Production Service Degradation** email from CTO Sarah Jenkins.
   - Show the **AI Intelligence Analysis box**:
     - Explain why it was classified as Critical (SEV-1 incident + immediate rollback mandate).
     - Point out the extracted deadlines and action items.

3. **Demonstrate 1-Click Action Item to Task Conversion**:
   - In the email modal, click **Convert to Task** next to *"Roll back release v2.4.1 to stable v2.4.0"*.
   - Show how the Task Modal automatically pre-fills title, priority, due date, and links the source email!
   - Save the task, then switch to the **Tasks** tab to show it persisted in SQLite. Complete it with 1 click.

4. **Demonstrate AI Reply Generator & Safety Confirmation**:
   - In the email view, click **Reply with AI**.
   - Cycle through the 4 tones (**Professional**, **Friendly**, **Formal**, **Concise**) to show how the language adjusts dynamically.
   - Add a custom note: *"Mention I will monitor Datadog logs after lunch"*. Click **Regenerate**.
   - Emphasize the **Human-in-the-Loop Security Rule**: Show that the user can edit the draft and must explicitly click **Review & Confirm Send** before any email can be dispatched.

5. **Demonstrate In-App Notification Center**:
   - Click the bell icon in the top right to show alerts for urgent emails, approaching IEEE deadlines, and overdue tasks.
   - Click a notification to demonstrate deep-linking.

6. **Demonstrate Analytics**:
   - Open the **Analytics** tab to show the priority distribution chart and task completion rate.

7. **Show Real Gmail OAuth Architecture**:
   - Go to **Settings & Setup**. Show the Gmail API configuration status and the built-in step-by-step setup guide. Explain that real Gmail integration is fully implemented and works immediately once client credentials are added to `backend/.env`.

---

## 📚 Documentation Links

- [Official Gmail API & OAuth 2.0 Setup Guide](file:///c:/Users/Roshan/Desktop/mailmind-AI/GMAIL_SETUP.md)
- [Production Deployment Guide (Vercel & Render)](file:///c:/Users/Roshan/Desktop/mailmind-AI/DEPLOYMENT.md)

---

## 📄 License & Academic Integrity

Created for the **Advanced Programming Practices** college capstone evaluation. All source code, database schemas, and interface assets are organized for clean academic review and production cloud deployment.
