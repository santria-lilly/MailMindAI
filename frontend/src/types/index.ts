export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface DeadlineItem {
  title: string;
  date: string;
  is_urgent: boolean;
}

export interface Email {
  id: string;
  thread_id?: string;
  sender_name: string;
  sender_email: string;
  recipient_email?: string;
  subject: string;
  snippet: string;
  body: string;
  received_at: string;
  is_read: boolean;
  priority: Priority;
  priority_reason?: string;
  action_items: string[];
  deadlines: DeadlineItem[];
  summary?: string;
  requires_reply: boolean;
  is_demo: boolean;
  labels: string[];
}

export interface EmailListResponse {
  emails: Email[];
  total: number;
  unread_count: number;
  critical_count: number;
  is_demo: boolean;
}

export interface Task {
  id: string;
  email_id?: string;
  title: string;
  description: string;
  priority: Priority;
  status: 'pending' | 'completed';
  due_date?: string;
  created_at: string;
  updated_at: string;
  is_demo: boolean;
  email_subject?: string;
}

export interface TaskCreatePayload {
  title: string;
  description?: string;
  priority: Priority;
  due_date?: string;
  email_id?: string;
  is_demo?: boolean;
}

export interface Notification {
  id: string;
  type: 'urgent_email' | 'deadline' | 'overdue_task' | 'unanswered';
  title: string;
  message: string;
  link_id?: string;
  priority: Priority;
  is_read: boolean;
  created_at: string;
  is_demo: boolean;
}

export interface AnalyticsData {
  email_stats: {
    total: number;
    unread: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    is_demo_dataset: boolean;
  };
  task_stats: {
    total: number;
    pending: number;
    completed: number;
    due_today: number;
    overdue: number;
    completion_rate: number;
  };
  top_priorities_today: Task[];
  recent_important_emails: Array<{
    id: string;
    sender_name: string;
    subject: string;
    priority: Priority;
    received_at: string;
    is_read: boolean;
    summary?: string;
  }>;
  upcoming_deadlines: Array<{
    email_id: string;
    email_subject: string;
    title: string;
    date: string;
    is_urgent: boolean;
  }>;
}

export interface AuthStatus {
  has_credentials_configured: boolean;
  is_authenticated: boolean;
  connected_email?: string;
  client_id_configured: boolean;
  client_secret_configured: boolean;
  redirect_uri: string;
  ai_configured: boolean;
  ai_provider: string;
}

export type ReplyTone = 'Professional' | 'Friendly' | 'Formal' | 'Concise';

export interface ReplyResponse {
  reply_text: string;
  subject: string;
  recipient_email: string;
  tone: ReplyTone;
  engine_used: string;
}
