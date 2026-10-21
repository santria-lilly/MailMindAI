import os
import json
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import Flow
from googleapiclient.discovery import build

from app.config import settings
from app.database import get_db_connection

# RFC 6749 Section 3.3: Allow token scope differences if Google appends openid or consolidates scopes
os.environ["OAUTHLIB_RELAX_TOKEN_SCOPE"] = "1"

# Allow HTTP for local development OAuth callback (RFC 6749)
if settings.APP_ENV != "production":
    os.environ["OAUTHLIB_INSECURE_TRANSPORT"] = "1"

SCOPES = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.modify",
]

class AuthService:
    """
    Handles Google OAuth 2.0 authorization, callback code exchange,
    token refresh, and session persistence in SQLite.
    """

    def _get_client_config(self) -> Dict[str, Any]:
        if not settings.has_gmail_credentials:
            raise ValueError("Google Client ID and Client Secret are not configured in environment.")
        return {
            "web": {
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [settings.GOOGLE_REDIRECT_URI]
            }
        }

    def get_authorization_url(self) -> Dict[str, str]:
        """Creates Google OAuth authorization URL and persists PKCE code_verifier."""
        client_config = self._get_client_config()
        flow = Flow.from_client_config(
            client_config,
            scopes=SCOPES,
            redirect_uri=settings.GOOGLE_REDIRECT_URI
        )
        auth_url, state = flow.authorization_url(
            access_type="offline",
            include_granted_scopes="true",
            prompt="consent"
        )
        code_verifier = getattr(flow, "code_verifier", None)

        # Persist state & PKCE code_verifier securely in SQLite for callback validation
        now_str = datetime.now(timezone.utc).isoformat()
        with get_db_connection() as conn:
            cursor = conn.cursor()
            # Clean up old sessions (> 30 minutes)
            cursor.execute("DELETE FROM oauth_sessions WHERE created_at < datetime('now', '-30 minutes')")
            cursor.execute("""
                INSERT OR REPLACE INTO oauth_sessions (state, code_verifier, created_at)
                VALUES (?, ?, ?)
            """, (state, code_verifier, now_str))

        return {"authorization_url": auth_url, "state": state}

    def exchange_code_for_token(self, code: str, state: Optional[str] = None) -> Dict[str, Any]:
        """
        Validates state parameter, retrieves PKCE code_verifier, and exchanges
        authorization code for access and refresh tokens, storing in SQLite.
        """
        code_verifier = None
        if state:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT code_verifier FROM oauth_sessions WHERE state = ?", (state,))
                row = cursor.fetchone()
                if row:
                    code_verifier = row["code_verifier"]
                    # Delete session after retrieval to prevent replay
                    cursor.execute("DELETE FROM oauth_sessions WHERE state = ?", (state,))
                else:
                    # If state not found, could be expired or already used
                    raise ValueError("OAuth session expired or state mismatch. Please click 'Connect Google Account' to start a fresh login.")
        else:
            # Fallback to most recent session if state was omitted
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT code_verifier FROM oauth_sessions ORDER BY created_at DESC LIMIT 1")
                row = cursor.fetchone()
                if row:
                    code_verifier = row["code_verifier"]

        client_config = self._get_client_config()
        flow = Flow.from_client_config(
            client_config,
            scopes=SCOPES,
            state=state,
            redirect_uri=settings.GOOGLE_REDIRECT_URI
        )
        if code_verifier:
            flow.code_verifier = code_verifier

        try:
            flow.fetch_token(code=code)
        except Warning as w:
            print(f"[AuthService] Scope notice during token exchange: {w}")
            if hasattr(w, "token") and w.token:
                flow.oauth2session.token = w.token
        except Exception as e:
            err_msg = str(e)
            if "invalid_grant" in err_msg.lower():
                raise ValueError("The Google authorization code has expired or was already used. Please click 'Connect Google Account' to start a fresh login.")
            elif "scope has changed" in err_msg.lower():
                print(f"[AuthService] Scope changed notice tolerated: {err_msg}")
                if hasattr(e, "token") and getattr(e, "token", None):
                    flow.oauth2session.token = getattr(e, "token")
            else:
                raise ValueError(f"Google OAuth verification failed: {err_msg}")

        creds = flow.credentials

        # Retrieve user email using the Gmail profile API
        user_email = "primary"
        try:
            service = build("gmail", "v1", credentials=creds)
            profile = service.users().getProfile(userId="me").execute()
            user_email = profile.get("emailAddress", "primary")
        except Exception as e:
            print(f"[AuthService] Warning retrieving profile: {e}")

        # Store serialized credentials securely in SQLite
        token_data = {
            "token": creds.token,
            "refresh_token": creds.refresh_token,
            "token_uri": creds.token_uri,
            "client_id": creds.client_id,
            "client_secret": creds.client_secret,
            "scopes": creds.scopes,
            "expiry": creds.expiry.isoformat() if creds.expiry else None
        }

        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT OR REPLACE INTO oauth_tokens (user_email, token_data, updated_at)
                VALUES (?, ?, ?)
            """, (user_email, json.dumps(token_data), datetime.now(timezone.utc).isoformat()))

        return {
            "success": True,
            "user_email": user_email,
            "message": "Google account connected successfully"
        }

    def get_credentials(self, user_email: Optional[str] = None) -> Optional[Credentials]:
        """Retrieves and automatically refreshes Google OAuth credentials from SQLite."""
        with get_db_connection() as conn:
            cursor = conn.cursor()
            if user_email:
                cursor.execute("SELECT token_data FROM oauth_tokens WHERE user_email = ?", (user_email,))
            else:
                cursor.execute("SELECT user_email, token_data FROM oauth_tokens ORDER BY updated_at DESC LIMIT 1")
            
            row = cursor.fetchone()
            if not row:
                return None

            user_email = user_email or row["user_email"]
            token_info = json.loads(row["token_data"])

        creds = Credentials(
            token=token_info.get("token"),
            refresh_token=token_info.get("refresh_token"),
            token_uri=token_info.get("token_uri"),
            client_id=token_info.get("client_id") or settings.GOOGLE_CLIENT_ID,
            client_secret=token_info.get("client_secret") or settings.GOOGLE_CLIENT_SECRET,
            scopes=token_info.get("scopes") or SCOPES
        )

        # Refresh if expired
        if creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
                token_info["token"] = creds.token
                token_info["expiry"] = creds.expiry.isoformat() if creds.expiry else None
                with get_db_connection() as conn:
                    conn.cursor().execute("""
                        UPDATE oauth_tokens SET token_data = ?, updated_at = ?
                        WHERE user_email = ?
                    """, (json.dumps(token_info), datetime.now(timezone.utc).isoformat(), user_email))
            except Exception as e:
                print(f"[AuthService] Error refreshing token: {e}")
                return None

        return creds

    def disconnect(self, user_email: Optional[str] = None) -> bool:
        """Removes OAuth credentials from the local database."""
        with get_db_connection() as conn:
            cursor = conn.cursor()
            if user_email:
                cursor.execute("DELETE FROM oauth_tokens WHERE user_email = ?", (user_email,))
            else:
                cursor.execute("DELETE FROM oauth_tokens")
        return True

    def get_auth_status(self) -> Dict[str, Any]:
        """Returns connection and configuration status for the UI setup screen."""
        has_creds = settings.has_gmail_credentials
        connected_email = None
        is_authenticated = False

        try:
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT user_email FROM oauth_tokens ORDER BY updated_at DESC LIMIT 1")
                row = cursor.fetchone()
                if row:
                    connected_email = row["user_email"]
                    is_authenticated = True
        except Exception:
            pass

        return {
            "has_credentials_configured": has_creds,
            "is_authenticated": is_authenticated,
            "connected_email": connected_email,
            "client_id_configured": bool(settings.GOOGLE_CLIENT_ID.strip()),
            "client_secret_configured": bool(settings.GOOGLE_CLIENT_SECRET.strip()),
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "ai_configured": settings.has_ai_credentials,
            "ai_provider": settings.AI_PROVIDER
        }

auth_service = AuthService()
