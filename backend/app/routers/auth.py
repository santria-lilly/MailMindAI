import urllib.parse
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import RedirectResponse
from app.config import settings
from app.services.auth_service import auth_service
from app.services.demo_service import seed_demo_data

router = APIRouter(prefix="/api/auth", tags=["Authentication & Integration"])

@router.get("/status")
def get_status():
    """Returns current Gmail OAuth connection status and AI credentials status."""
    return auth_service.get_auth_status()

@router.get("/google/url")
def get_google_auth_url():
    """Generates the Google OAuth 2.0 authorization URL."""
    if not settings.has_gmail_credentials:
        raise HTTPException(
            status_code=400,
            detail="Google Client ID and Secret are not configured in backend/.env. Please see GMAIL_SETUP.md."
        )
    try:
        return auth_service.get_authorization_url()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/google/callback")
def handle_google_callback(
    code: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
    error: Optional[str] = Query(None)
):
    """Callback receiver for Google OAuth 2.0 flow."""
    if error:
        redirect_url = f"{settings.FRONTEND_URL}/settings?error={urllib.parse.quote(error)}"
        return RedirectResponse(url=redirect_url)

    if not code:
        redirect_url = f"{settings.FRONTEND_URL}/settings?error=Missing%20authorization%20code.%20Please%20try%20logging%20in%20again."
        return RedirectResponse(url=redirect_url)

    try:
        result = auth_service.exchange_code_for_token(code=code, state=state)
        user_email = urllib.parse.quote(result.get("user_email", ""))
        redirect_url = f"{settings.FRONTEND_URL}/settings?connected=true&email={user_email}"
        return RedirectResponse(url=redirect_url)
    except Exception as e:
        error_msg = urllib.parse.quote(str(e))
        redirect_url = f"{settings.FRONTEND_URL}/settings?error={error_msg}"
        return RedirectResponse(url=redirect_url)

@router.post("/disconnect")
def disconnect_account():
    """Disconnects the connected Gmail account and revokes stored session tokens."""
    auth_service.disconnect()
    return {"success": True, "message": "Google account disconnected successfully."}

@router.post("/reset-demo")
def reset_demo_database():
    """Resets and re-seeds the realistic demo dataset in SQLite for demonstrations."""
    seed_demo_data(force=True)
    return {"success": True, "message": "Demo data reset successfully with realistic sample emails, tasks, and notifications."}
