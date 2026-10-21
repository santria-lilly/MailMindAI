from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import init_db
from app.services.demo_service import seed_demo_data
from app.routers import emails, tasks, ai, notifications, analytics, auth

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database and seed demo data
    init_db()
    seed_demo_data()
    print("[MailMind AI] Database initialized and demo dataset verified.")
    yield
    # Shutdown
    print("[MailMind AI] Server shutdown.")

app = FastAPI(
    title="MailMind AI API",
    description="AI-Based Smart Email Prioritization and Response System",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(emails.router)
app.include_router(tasks.router)
app.include_router(ai.router)
app.include_router(notifications.router)
app.include_router(analytics.router)
app.include_router(auth.router)

@app.get("/")
def root():
    return {
        "app": "MailMind AI",
        "status": "online",
        "version": settings.APP_VERSION,
        "docs_url": "/docs",
        "gmail_configured": settings.has_gmail_credentials,
        "ai_configured": settings.has_ai_credentials,
        "ai_provider": settings.AI_PROVIDER
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "environment": settings.APP_ENV,
        "version": settings.APP_VERSION
    }
