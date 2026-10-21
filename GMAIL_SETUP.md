# 🔐 Gmail API & Google OAuth 2.0 Setup Guide

This guide walks you through configuring official Google OAuth 2.0 credentials and the Gmail API for **MailMind AI**.

---

## 🌟 Overview

MailMind AI integrates with the official Google Gmail API to:
1. **Retrieve real emails** with thread context, headers, and formatted bodies.
2. **Prioritize emails** using AI models or intelligent fallback heuristics.
3. **Draft contextual replies** across 4 professional tones.
4. **Send replies via Gmail API** *strictly after explicit user review and confirmation*.

> [!NOTE]
> **No Credentials Yet? No Problem!**
> MailMind AI comes equipped with **Demo Mode**. You can demonstrate all dashboard metrics, AI triage, reply generation, task creation, and notifications immediately without setting up Google credentials first.

---

## 📋 Step-by-Step Google Cloud Configuration

### Step 1: Create a Google Cloud Project
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Log in with your standard Google / Gmail account.
3. Click the **Project Selector** dropdown at the top of the page.
4. Click **New Project**.
5. Set Project Name: `MailMind-AI` (or any preferred name).
6. Click **Create** and ensure the new project is selected in the top bar.

---

### Step 2: Enable the Gmail API
1. In the left navigation menu, go to **APIs & Services > Library**.
2. In the search bar, type `Gmail API`.
3. Click on **Gmail API** from the results.
4. Click the blue **Enable** button.

---

### Step 3: Configure the OAuth Consent Screen
1. In the left menu, select **APIs & Services > OAuth consent screen**.
2. Under **User Type**, select **External**, then click **Create**.
3. Fill in the required application details:
   - **App name**: `MailMind AI`
   - **User support email**: Select your email address.
   - **Developer contact information**: Enter your email address.
4. Click **Save and Continue**.
5. **Scopes** screen:
   - Click **Add or Remove Scopes**.
   - Filter or manually add the following scopes:
     - `https://www.googleapis.com/auth/gmail.readonly` (Read messages and metadata)
     - `https://www.googleapis.com/auth/gmail.send` (Send replies on your behalf)
     - `https://www.googleapis.com/auth/gmail.modify` (Mark messages as read/unread)
     - `https://www.googleapis.com/auth/userinfo.email` (View connected user email)
   - Click **Update**, then **Save and Continue**.
6. **Test Users** screen *(Crucial for development mode)*:
   - Click **+ Add Users**.
   - Enter your personal Gmail address (and any other test accounts you plan to log in with).
   - Click **Save and Continue**.
7. Review the summary and click **Back to Dashboard**.

---

### Step 4: Create OAuth 2.0 Web Client Credentials
1. In the left menu, select **APIs & Services > Credentials**.
2. Click **+ Create Credentials** at the top, then choose **OAuth client ID**.
3. For **Application type**, choose **Web application**.
4. Set **Name**: `MailMind AI Web Client`.
5. Under **Authorized JavaScript origins**, click **+ Add URI** and add:
   ```text
   http://localhost:5173
   http://localhost:8000
   ```
6. Under **Authorized redirect URIs**, click **+ Add URI** and add:
   ```text
   http://localhost:8000/api/auth/google/callback
   ```
   *(For production deployment, you will also add your Render backend callback URL here).*
7. Click **Create**.
8. A modal will appear displaying your **Client ID** and **Client Secret**. Keep this window open or copy both values.

---

### Step 5: Configure Backend Environment Variables
1. In your project workspace, open `backend/.env`.
2. Paste your Google credentials:

```ini
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:8000/api/auth/google/callback
```

3. Save the file.

---

### Step 6: Connect Your Account in MailMind AI
1. Start your backend (`python backend/run.py`) and frontend (`cd frontend && npm run dev`).
2. Open `http://localhost:5173` in your browser.
3. Click on the **Settings & Setup** tab in the navigation.
4. Under **Official Gmail API Integration**, the status will now show **Configured**.
5. Click **Connect Google Account**.
6. Google's consent screen will appear. Select your test Gmail account.
7. Click **Continue** (you may see a standard "Google hasn't verified this app" notice during development; click **Advanced > Go to MailMind AI (unsafe)** to proceed).
8. Once approved, Google will redirect you back to MailMind AI with an active connection badge showing your Gmail address!

---

## 🔒 Security Best Practices Implemented

- **No Frontend Exposure**: OAuth client secret and authorization tokens are strictly processed and stored on the backend.
- **SQLite Token Storage**: Tokens are stored locally in the backend `mailmind.db` with automated refresh token rotation.
- **Untrusted Input Isolation**: All email subject and body contents are isolated in sandboxed prompts to defend against prompt injection.
- **Human-in-the-Loop Confirmation**: Sending emails via Gmail requires explicit manual review, editable draft verification, and modal confirmation before any message is dispatched.

---

## ❓ Troubleshooting Common Errors

### 1. `redirect_uri_mismatch` (Error 400)
- **Cause**: The redirect URI in Google Cloud Console does not match `GOOGLE_REDIRECT_URI`.
- **Solution**: Verify that `http://localhost:8000/api/auth/google/callback` is added word-for-word (no trailing slashes) under **Authorized redirect URIs** in Google Cloud Console.

### 2. `access_denied` / `Error 403: access_denied`
- **Cause**: The Google account you are attempting to connect is not listed under **Test Users** on the OAuth Consent Screen.
- **Solution**: Go to Google Cloud Console > APIs & Services > OAuth consent screen > Test users, click **+ Add Users**, and add your Gmail address.

### 3. "Google hasn't verified this app" Warning
- **Cause**: Normal for personal development and college capstone projects.
- **Solution**: Click **Advanced** at the bottom left of the consent screen, then click **Go to MailMind AI (unsafe)**.
