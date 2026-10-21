import base64
import email
from email.mime.text import MIMEText
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from googleapiclient.discovery import build

from app.services.auth_service import auth_service
from app.services.ai_service import ai_service
from app.database import get_db_connection

class GmailService:
    """
    Official Google Gmail API Client Service.
    Handles email retrieval, message parsing, thread analysis,
    AI triage synchronization, and sending user-confirmed replies.
    """

    def _get_gmail_client(self):
        creds = auth_service.get_credentials()
        if not creds:
            raise ValueError("No authenticated Google account found. Please connect your Gmail account.")
        return build("gmail", "v1", credentials=creds)

    def fetch_messages(self, query: str = "", max_results: int = 15, page_token: Optional[str] = None) -> Dict[str, Any]:
        """Fetches list of message headers and IDs matching search query."""
        service = self._get_gmail_client()
        response = service.users().messages().list(
            userId="me",
            q=query,
            maxResults=min(max_results, 50),
            pageToken=page_token
        ).execute()

        messages = response.get("messages", [])
        next_page_token = response.get("nextPageToken")
        
        detailed_messages = []
        for msg in messages:
            try:
                details = self.get_message_detail(msg["id"])
                detailed_messages.append(details)
            except Exception as e:
                print(f"[GmailService] Error fetching details for message {msg.get('id')}: {e}")

        return {
            "messages": detailed_messages,
            "next_page_token": next_page_token,
            "result_size_estimate": response.get("resultSizeEstimate", len(detailed_messages))
        }

    def get_message_detail(self, message_id: str) -> Dict[str, Any]:
        """Fetches and parses a single Gmail message with headers and body."""
        service = self._get_gmail_client()
        message = service.users().messages().get(
            userId="me",
            id=message_id,
            format="full"
        ).execute()

        payload = message.get("payload", {})
        headers_list = payload.get("headers", [])
        headers = {h["name"].lower(): h["value"] for h in headers_list}

        subject = headers.get("subject", "(No Subject)")
        sender = headers.get("from", "Unknown Sender")
        to_email = headers.get("to", "")
        date_str = headers.get("date", "")
        thread_id = message.get("threadId", "")
        snippet = message.get("snippet", "")
        label_ids = message.get("labelIds", [])
        is_read = "UNREAD" not in label_ids

        body = self._extract_body(payload) or snippet

        # Parse sender name and email
        sender_name, sender_email = self._parse_sender(sender)

        return {
            "id": message["id"],
            "thread_id": thread_id,
            "sender_name": sender_name,
            "sender_email": sender_email,
            "recipient_email": to_email,
            "subject": subject,
            "snippet": snippet,
            "body": body,
            "received_at": date_str or datetime.now(timezone.utc).isoformat(),
            "is_read": is_read,
            "labels": label_ids,
            "message_id_header": headers.get("message-id", "")
        }

    def get_thread_context(self, thread_id: str) -> List[Dict[str, Any]]:
        """Retrieves entire conversation thread for full contextual understanding."""
        service = self._get_gmail_client()
        thread = service.users().threads().get(userId="me", id=thread_id, format="full").execute()
        messages = thread.get("messages", [])
        thread_items = []
        for msg in messages:
            payload = msg.get("payload", {})
            headers = {h["name"].lower(): h["value"] for h in payload.get("headers", [])}
            sender_name, sender_email = self._parse_sender(headers.get("from", ""))
            thread_items.append({
                "id": msg["id"],
                "sender_name": sender_name,
                "sender_email": sender_email,
                "date": headers.get("date", ""),
                "snippet": msg.get("snippet", ""),
                "body": self._extract_body(payload)
            })
        return thread_items

    async def sync_and_triage_inbox(self, max_count: int = 15) -> List[Dict[str, Any]]:
        """
        Synchronizes recent Gmail messages into SQLite and runs AI prioritization pipeline.
        Saves triage output and generates alerts for critical items.
        """
        service = self._get_gmail_client()
        res = service.users().messages().list(userId="me", maxResults=max_count).execute()
        messages = res.get("messages", [])

        triaged_emails = []
        now_str = datetime.now(timezone.utc).isoformat()

        for msg_summary in messages:
            msg_id = msg_summary["id"]
            
            # Check if email is already in database
            with get_db_connection() as conn:
                row = conn.cursor().execute("SELECT id FROM emails WHERE id = ?", (msg_id,)).fetchone()
                if row:
                    continue  # Already triaged

            # Fetch full detail
            email_data = self.get_message_detail(msg_id)
            
            # Run AI or Fallback analysis
            analysis = await ai_service.analyze_email(
                subject=email_data["subject"],
                sender=f"{email_data['sender_name']} <{email_data['sender_email']}>",
                body=email_data["body"]
            )

            # Store in SQLite
            with get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT OR REPLACE INTO emails (
                        id, thread_id, sender_name, sender_email, recipient_email,
                        subject, snippet, body, received_at, is_read, priority,
                        priority_reason, action_items, deadlines, summary,
                        requires_reply, is_demo, labels, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    email_data["id"],
                    email_data["thread_id"],
                    email_data["sender_name"],
                    email_data["sender_email"],
                    email_data["recipient_email"],
                    email_data["subject"],
                    email_data["snippet"],
                    email_data["body"],
                    email_data["received_at"],
                    1 if email_data["is_read"] else 0,
                    analysis["priority"],
                    analysis["priority_reason"],
                    json.dumps(analysis["action_items"]),
                    json.dumps(analysis["deadlines"]),
                    analysis["summary"],
                    1 if analysis["requires_reply"] else 0,
                    0,  # Real Gmail email
                    json.dumps(email_data["labels"]),
                    now_str
                ))

                # If Critical priority, trigger in-app notification
                if analysis["priority"] == "Critical":
                    cursor.execute("""
                        INSERT INTO notifications (id, type, title, message, link_id, priority, is_read, created_at, is_demo)
                        VALUES (?, ?, ?, ?, ?, ?, 0, ?, 0)
                    """, (
                        f"notif-{msg_id}",
                        "urgent_email",
                        f"Critical Email: {email_data['subject'][:40]}",
                        f"From {email_data['sender_name']}: {analysis['priority_reason']}",
                        msg_id,
                        "Critical",
                        now_str
                    ))

            triaged_emails.append(email_data)

        return triaged_emails

    def send_reply(
        self,
        to_email: str,
        subject: str,
        reply_body: str,
        thread_id: Optional[str] = None,
        in_reply_to: Optional[str] = None
    ) -> Dict[str, Any]:
        """Sends an email reply via Gmail API after explicit user confirmation."""
        service = self._get_gmail_client()
        
        # Prepare MIME message
        mime_msg = MIMEText(reply_body)
        mime_msg["to"] = to_email
        mime_msg["subject"] = subject if subject.startswith("Re:") else f"Re: {subject}"
        
        if in_reply_to:
            mime_msg["In-Reply-To"] = in_reply_to
            mime_msg["References"] = in_reply_to

        raw_bytes = base64.urlsafe_b64encode(mime_msg.as_bytes()).decode("utf-8")
        body_payload: Dict[str, Any] = {"raw": raw_bytes}
        if thread_id:
            body_payload["threadId"] = thread_id

        sent_message = service.users().messages().send(userId="me", body=body_payload).execute()
        return {
            "success": True,
            "message_id": sent_message.get("id"),
            "sent_at": datetime.now(timezone.utc).isoformat()
        }

    def mark_as_read(self, message_id: str) -> bool:
        """Removes UNREAD label in Gmail."""
        try:
            service = self._get_gmail_client()
            service.users().messages().modify(
                userId="me",
                id=message_id,
                body={"removeLabelIds": ["UNREAD"]}
            ).execute()
            return True
        except Exception as e:
            print(f"[GmailService] Error marking as read in Gmail: {e}")
            return False

    def _extract_body(self, payload: Dict[str, Any]) -> str:
        """Extracts plain text or HTML content from Gmail payload hierarchy."""
        if "parts" in payload:
            for part in payload["parts"]:
                mime_type = part.get("mimeType", "")
                if mime_type == "text/plain" and "data" in part.get("body", {}):
                    return self._decode_b64(part["body"]["data"])
                elif "parts" in part:
                    res = self._extract_body(part)
                    if res:
                        return res
            # If no plain text found, check text/html
            for part in payload["parts"]:
                if part.get("mimeType") == "text/html" and "data" in part.get("body", {}):
                    return self._decode_b64(part["body"]["data"])

        if "data" in payload.get("body", {}):
            return self._decode_b64(payload["body"]["data"])

        return ""

    def _decode_b64(self, encoded_data: str) -> str:
        try:
            return base64.urlsafe_b64decode(encoded_data.encode("utf-8")).decode("utf-8", errors="replace")
        except Exception:
            return ""

    def _parse_sender(self, sender_header: str) -> tuple[str, str]:
        if not sender_header:
            return "Unknown Sender", "unknown@domain.com"
        if "<" in sender_header and ">" in sender_header:
            name_part = sender_header.split("<")[0].strip().replace('"', '')
            email_part = sender_header.split("<")[1].split(">")[0].strip()
            return name_part or email_part, email_part
        return sender_header.strip(), sender_header.strip()

gmail_service = GmailService()
