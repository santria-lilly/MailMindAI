import os
from pathlib import Path
from dotenv import load_dotenv

# RFC 6749 Section 3.3: Allow token scope variations from Google (e.g., added openid or reordered scopes)
os.environ["OAUTHLIB_RELAX_TOKEN_SCOPE"] = "1"

def get_env_path() -> Path:
    backend_env = Path(__file__).resolve().parent.parent / ".env"
    if backend_env.exists():
        return backend_env
    root_env = Path(__file__).resolve().parent.parent.parent / ".env"
    return root_env

class Settings:
    APP_NAME: str = "MailMind AI"
    APP_VERSION: str = "1.0.0"

    def _reload_env(self) -> None:
        env_file = get_env_path()
        if env_file.exists():
            load_dotenv(dotenv_path=env_file, override=True)

    @property
    def APP_ENV(self) -> str:
        self._reload_env()
        return os.getenv("APP_ENV", "development").strip()

    @property
    def PORT(self) -> int:
        self._reload_env()
        return int(os.getenv("PORT", "8000"))

    @property
    def HOST(self) -> str:
        self._reload_env()
        return os.getenv("HOST", "0.0.0.0").strip()

    @property
    def FRONTEND_URL(self) -> str:
        self._reload_env()
        return os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")

    @property
    def DATABASE_PATH(self) -> str:
        self._reload_env()
        default_db = str(Path(__file__).resolve().parent.parent / "mailmind.db")
        return os.getenv("DATABASE_PATH", default_db).strip()

    @property
    def GOOGLE_CLIENT_ID(self) -> str:
        self._reload_env()
        return os.getenv("GOOGLE_CLIENT_ID", "").strip()

    @property
    def GOOGLE_CLIENT_SECRET(self) -> str:
        self._reload_env()
        return os.getenv("GOOGLE_CLIENT_SECRET", "").strip()

    @property
    def GOOGLE_REDIRECT_URI(self) -> str:
        self._reload_env()
        return os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback").strip()

    @property
    def GEMINI_API_KEY(self) -> str:
        self._reload_env()
        return os.getenv("GEMINI_API_KEY", "").strip()

    @property
    def GEMINI_MODEL(self) -> str:
        self._reload_env()
        return os.getenv("GEMINI_MODEL", "gemini-1.5-flash").strip()

    @property
    def OPENAI_API_KEY(self) -> str:
        self._reload_env()
        return os.getenv("OPENAI_API_KEY", "").strip()

    @property
    def OPENAI_MODEL(self) -> str:
        self._reload_env()
        return os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()

    @property
    def AI_PROVIDER(self) -> str:
        self._reload_env()
        return os.getenv("AI_PROVIDER", "gemini").strip()

    @property
    def has_gmail_credentials(self) -> bool:
        return bool(self.GOOGLE_CLIENT_ID and self.GOOGLE_CLIENT_SECRET)

    @property
    def has_ai_credentials(self) -> bool:
        if self.AI_PROVIDER.lower() == "openai":
            return bool(self.OPENAI_API_KEY)
        return bool(self.GEMINI_API_KEY)

settings = Settings()
