# 🚀 Production Deployment Guide: MailMind AI

This guide explains how to deploy **MailMind AI** to cloud hosting platforms:
- **Frontend**: [Vercel](https://vercel.com) (React, Vite, TypeScript, Tailwind CSS)
- **Backend**: [Render](https://render.com) (FastAPI, SQLite, Python 3.11+)

---

## 🏗️ Architecture Overview in Production

```
+-----------------------------------+       +-----------------------------------+
|          Vercel (Frontend)        | ----> |          Render (Backend)         |
|  - React 19 + Vite SPA            | HTTPS |  - FastAPI ASGI Web Service       |
|  - Static Edge CDN Delivery       |  CORS |  - SQLite Database with Disk      |
|  - URL: https://mailmind.vercel.app|       |  - URL: https://mailmind-api.onrender.com |
+-----------------------------------+       +-----------------------------------+
                                                           |
                                      +--------------------+--------------------+
                                      |                                         |
                                      v                                         v
                         +-----------------------+              +-----------------------+
                         |    Google Gmail API   |              |   Google Gemini AI    |
                         |  OAuth 2.0 Triage     |              |  Prioritization & LLM |
                         +-----------------------+              +-----------------------+
```

---

## Part 1: Deploy Backend on Render

### Step 1: Push Project to GitHub
1. Initialize git in your local workspace if not already done:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Complete MailMind AI system"
   ```
2. Create a new repository on [GitHub](https://github.com) (public or private).
3. Push your repository:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/mailmind-AI.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Create Web Service on Render
1. Log in to [Render](https://dashboard.render.com).
2. Click **New + > Web Service**.
3. Connect your GitHub repository `mailmind-AI`.
4. Configure service settings:
   - **Name**: `mailmind-api`
   - **Region**: Closest to you (e.g. Frankfurt, Oregon, Singapore)
   - **Branch**: `main`
   - **Root Directory**: Leave blank (root of repo)
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --app-dir backend`
   - **Instance Type**: `Free` (or Starter for persistent disks)

### Step 3: Add Backend Environment Variables on Render
Under the **Environment Variables** section, add:
| Key | Value | Description |
|---|---|---|
| `APP_ENV` | `production` | Production environment flag |
| `PORT` | `10000` | Port assigned by Render |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | Your Vercel frontend URL (update after Step 2) |
| `DATABASE_PATH` | `/opt/render/project/src/backend/mailmind.db` | Location of SQLite database file |
| `GOOGLE_CLIENT_ID` | `your-google-client-id` | *(Optional for demo mode)* |
| `GOOGLE_CLIENT_SECRET`| `your-google-client-secret` | *(Optional for demo mode)* |
| `GOOGLE_REDIRECT_URI` | `https://your-backend.onrender.com/api/auth/google/callback` | Render OAuth callback endpoint |
| `GEMINI_API_KEY` | `your-gemini-api-key` | *(Optional - fallback engine works without it)* |
| `AI_PROVIDER` | `gemini` | AI engine selection |

5. Click **Create Web Service**. Render will build and deploy your API. Note your backend URL (e.g., `https://mailmind-api.onrender.com`).

---

## Part 2: Deploy Frontend on Vercel

### Step 1: Import Project to Vercel
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New... > Project**.
3. Import your GitHub repository `mailmind-AI`.

### Step 2: Configure Project Settings on Vercel
1. **Framework Preset**: `Vite` (automatically detected).
2. **Root Directory**: Click *Edit* and select `frontend`.
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### Step 3: Set Environment Variables on Vercel
Expand **Environment Variables** and add:
| Key | Value |
|---|---|
| `VITE_API_URL` | `https://your-backend.onrender.com` (Your live Render backend URL) |

6. Click **Deploy**.
7. Vercel will build and deploy your application. You will receive your production URL (e.g. `https://mailmind-ai.vercel.app`).

---

## Part 3: Final Production Cross-Linking

1. **Update `FRONTEND_URL` on Render**:
   - Go back to Render Dashboard > your service > **Environment**.
   - Update `FRONTEND_URL` to your actual Vercel URL: `https://mailmind-ai.vercel.app`.
   - Save changes (Render will automatically redeploy).

2. **Update Google Cloud Console Authorized URIs**:
   - Open [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials).
   - Edit your Web Client credentials:
     - Under **Authorized JavaScript origins**, add your Vercel URL: `https://mailmind-ai.vercel.app`.
     - Under **Authorized redirect URIs**, add your Render callback: `https://mailmind-api.onrender.com/api/auth/google/callback`.
   - Click **Save**.

Your production deployment is now fully live, responsive, secure, and ready for showcase!
