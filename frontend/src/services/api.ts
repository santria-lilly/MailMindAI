import {
  Email,
  EmailListResponse,
  Task,
  TaskCreatePayload,
  Notification,
  AnalyticsData,
  AuthStatus,
  ReplyTone,
  ReplyResponse
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    ...options
  });

  if (!res.ok) {
    let errorDetail = `Request failed with status ${res.status}`;
    try {
      const err = await res.json();
      errorDetail = err.detail || err.message || errorDetail;
    } catch {
      // Ignore JSON parse error
    }
    throw new Error(errorDetail);
  }

  return res.json() as Promise<T>;
}

export const api = {
  // Emails
  async getEmails(params: {
    priority?: string;
    is_read?: boolean;
    search?: string;
    is_demo?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<EmailListResponse> {
    const query = new URLSearchParams();
    if (params.priority && params.priority !== 'All') query.set('priority', params.priority);
    if (params.is_read !== undefined) query.set('is_read', String(params.is_read));
    if (params.search) query.set('search', params.search);
    if (params.is_demo !== undefined) query.set('is_demo', String(params.is_demo));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.offset) query.set('offset', String(params.offset));

    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<EmailListResponse>(`/api/emails${qs}`);
  },

  async getEmailDetail(emailId: string): Promise<Email> {
    return fetchJson<Email>(`/api/emails/${emailId}`);
  },

  async markEmailRead(emailId: string, isRead: boolean): Promise<{ success: boolean; is_read: boolean }> {
    return fetchJson<{ success: boolean; is_read: boolean }>(`/api/emails/${emailId}/read`, {
      method: 'PATCH',
      body: JSON.stringify({ is_read: isRead })
    });
  },

  async prioritizeEmail(emailId: string): Promise<Email> {
    return fetchJson<Email>(`/api/emails/${emailId}/prioritize`, {
      method: 'POST'
    });
  },

  async syncGmail(): Promise<{ success: boolean; synced_count: number; message: string }> {
    return fetchJson<{ success: boolean; synced_count: number; message: string }>('/api/emails/sync', {
      method: 'POST'
    });
  },

  // Tasks
  async getTasks(params: { status?: string; priority?: string; is_demo?: boolean } = {}): Promise<Task[]> {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.priority && params.priority !== 'all') query.set('priority', params.priority);
    if (params.is_demo !== undefined) query.set('is_demo', String(params.is_demo));

    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJson<Task[]>(`/api/tasks${qs}`);
  },

  async createTask(payload: TaskCreatePayload): Promise<Task> {
    return fetchJson<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateTask(taskId: string, payload: Partial<Task>): Promise<Task> {
    return fetchJson<Task>(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },

  async deleteTask(taskId: string): Promise<{ success: boolean; message: string }> {
    return fetchJson<{ success: boolean; message: string }>(`/api/tasks/${taskId}`, {
      method: 'DELETE'
    });
  },

  // AI & Replies
  async generateReply(
    emailId: string,
    tone: ReplyTone = 'Professional',
    additionalContext?: string
  ): Promise<ReplyResponse> {
    return fetchJson<ReplyResponse>('/api/ai/generate-reply', {
      method: 'POST',
      body: JSON.stringify({
        email_id: emailId,
        tone,
        additional_context: additionalContext
      })
    });
  },

  async sendReply(payload: {
    email_id: string;
    subject: string;
    recipient_email: string;
    reply_body: string;
    is_demo?: boolean;
  }): Promise<{ success: boolean; message: string; message_id?: string; sent_at?: string }> {
    return fetchJson('/api/ai/send-reply', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getDailyBriefing(): Promise<{ briefing: string; generated_at: string; is_ai_powered: boolean }> {
    return fetchJson('/api/ai/daily-briefing');
  },

  // Notifications
  async getNotifications(isRead?: boolean): Promise<Notification[]> {
    const qs = isRead !== undefined ? `?is_read=${isRead}` : '';
    return fetchJson<Notification[]>(`/api/notifications${qs}`);
  },

  async getNotificationCounts(): Promise<{ unread_count: number; total_count: number }> {
    return fetchJson('/api/notifications/count');
  },

  async markNotificationRead(notifId: string): Promise<{ success: boolean }> {
    return fetchJson(`/api/notifications/${notifId}/read`, {
      method: 'PATCH'
    });
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return fetchJson('/api/notifications/mark-all-read', {
      method: 'POST'
    });
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    return fetchJson<AnalyticsData>('/api/analytics');
  },

  // Auth & Integrations
  async getAuthStatus(): Promise<AuthStatus> {
    return fetchJson<AuthStatus>('/api/auth/status');
  },

  async getGoogleAuthUrl(): Promise<{ authorization_url: string; state: string }> {
    return fetchJson('/api/auth/google/url');
  },

  async disconnectGoogle(): Promise<{ success: boolean; message: string }> {
    return fetchJson('/api/auth/disconnect', {
      method: 'POST'
    });
  },

  async resetDemoData(): Promise<{ success: boolean; message: string }> {
    return fetchJson('/api/auth/reset-demo', {
      method: 'POST'
    });
  }
};
