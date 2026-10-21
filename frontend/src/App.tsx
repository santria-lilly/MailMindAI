import React, { useState, useEffect, useCallback } from 'react';
import { Navigation, NavTab } from './components/Navigation';
import { DashboardView } from './views/DashboardView';
import { InboxView } from './views/InboxView';
import { TasksView } from './views/TasksView';
import { AnalyticsView } from './views/AnalyticsView';
import { SettingsView } from './views/SettingsView';
import { EmailDetailModal } from './components/EmailDetailModal';
import { ReplyModal } from './components/ReplyModal';
import { TaskModal } from './components/TaskModal';
import { Email, Task, AnalyticsData, AuthStatus, Notification } from './types';
import { api } from './services/api';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [emails, setEmails] = useState<Email[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);

  // Filters for Inbox
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [unreadFilter, setUnreadFilter] = useState<boolean | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [replyEmail, setReplyEmail] = useState<Email | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [emailContextForTask, setEmailContextForTask] = useState<{
    id: string;
    subject: string;
    prefilledTitle?: string;
    prefilledDueDate?: string;
  } | null>(null);

  // Global Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [emailData, taskData, analyticsData, authData] = await Promise.all([
        api.getEmails({
          priority: priorityFilter !== 'All' ? priorityFilter : undefined,
          is_read: unreadFilter !== null ? !unreadFilter : undefined,
          search: searchQuery.trim() || undefined
        }),
        api.getTasks(),
        api.getAnalytics(),
        api.getAuthStatus()
      ]);

      setEmails(emailData.emails);
      setTasks(taskData);
      setAnalytics(analyticsData);
      setAuthStatus(authData);
    } catch (err: any) {
      console.error('Failed to load application data:', err);
      showToast('Could not reach backend API. Ensure FastAPI server is running.', 'error');
    } finally {
      setLoading(false);
    }
  }, [priorityFilter, unreadFilter, searchQuery]);

  useEffect(() => {
    loadData();

    // Check URL parameters for OAuth redirect notifications
    const params = new URLSearchParams(window.location.search);
    if (params.get('connected') === 'true') {
      showToast(`Google account ${params.get('email') || ''} connected successfully!`, 'success');
      setCurrentTab('settings');
      // Clean query params
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (params.get('error')) {
      showToast(`OAuth Error: ${params.get('error')}`, 'error');
      setCurrentTab('settings');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [loadData]);

  // Sync Inbox
  const handleSyncInbox = async () => {
    try {
      setSyncing(true);
      const res = await api.syncGmail();
      showToast(res.message, 'success');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Sync failed. In Demo Mode, use sample data.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // Task Handlers
  const handleToggleTaskStatus = async (task: Task) => {
    try {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      const updated = await api.updateTask(task.id, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      // Refresh analytics
      api.getAnalytics().then(setAnalytics).catch(() => {});
      showToast(`Task marked as ${newStatus}.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update task', 'error');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      api.getAnalytics().then(setAnalytics).catch(() => {});
      showToast('Task removed.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete task', 'error');
    }
  };

  const handleTaskSaved = (savedTask: Task) => {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === savedTask.id);
      if (exists) {
        return prev.map((t) => (t.id === savedTask.id ? savedTask : t));
      }
      return [savedTask, ...prev];
    });
    api.getAnalytics().then(setAnalytics).catch(() => {});
    showToast(editingTask ? 'Task updated successfully.' : 'New task created successfully.', 'success');
    setEditingTask(null);
    setEmailContextForTask(null);
  };

  // Email Handlers
  const handleToggleRead = async (email: Email) => {
    try {
      const newRead = !email.is_read;
      await api.markEmailRead(email.id, newRead);
      setEmails((prev) =>
        prev.map((e) => (e.id === email.id ? { ...e, is_read: newRead } : e))
      );
      if (selectedEmail && selectedEmail.id === email.id) {
        setSelectedEmail({ ...selectedEmail, is_read: newRead });
      }
      api.getAnalytics().then(setAnalytics).catch(() => {});
    } catch (err: any) {
      showToast(err.message || 'Failed to update read status', 'error');
    }
  };

  const handleEmailUpdated = (updatedEmail: Email) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === updatedEmail.id ? updatedEmail : e))
    );
    setSelectedEmail(updatedEmail);
    api.getAnalytics().then(setAnalytics).catch(() => {});
  };

  const handleSelectNotification = async (notif: Notification) => {
    if (notif.link_id) {
      if (notif.type === 'urgent_email' || notif.type === 'unanswered' || notif.type === 'deadline') {
        try {
          const em = await api.getEmailDetail(notif.link_id);
          setSelectedEmail(em);
        } catch {
          setCurrentTab('inbox');
        }
      } else if (notif.type === 'overdue_task') {
        setCurrentTab('tasks');
      }
    }
  };

  const handleSelectEmailId = async (emailId: string) => {
    try {
      const em = await api.getEmailDetail(emailId);
      setSelectedEmail(em);
    } catch (err) {
      console.error('Could not open email:', err);
    }
  };

  const unreadCount = analytics?.email_stats.unread || 0;
  const criticalCount = analytics?.email_stats.critical || 0;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;

  return (
    <div className="min-h-screen bg-[#FDFCF7] text-charcoal-800 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        unreadEmailCount={unreadCount}
        criticalEmailCount={criticalCount}
        pendingTaskCount={pendingCount}
        authStatus={authStatus}
        onSyncInbox={handleSyncInbox}
        syncing={syncing}
        onSelectNotification={handleSelectNotification}
        onResetDemo={() => {
          loadData();
          showToast('Demo dataset reset successfully!', 'success');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            analytics={analytics}
            loading={loading}
            onNavigateToInbox={(priority) => {
              if (priority) setPriorityFilter(priority);
              setCurrentTab('inbox');
            }}
            onNavigateToTasks={() => setCurrentTab('tasks')}
            onSelectEmailId={handleSelectEmailId}
            onToggleTaskStatus={handleToggleTaskStatus}
            onOpenCreateTask={() => {
              setEditingTask(null);
              setEmailContextForTask(null);
              setTaskModalOpen(true);
            }}
          />
        )}

        {currentTab === 'inbox' && (
          <InboxView
            emails={emails}
            loading={loading}
            priorityFilter={priorityFilter}
            onSetPriorityFilter={setPriorityFilter}
            unreadFilter={unreadFilter}
            onSetUnreadFilter={setUnreadFilter}
            searchQuery={searchQuery}
            onSetSearchQuery={setSearchQuery}
            onSelectEmail={(em) => setSelectedEmail(em)}
            onOpenReply={(em) => setReplyEmail(em)}
            onOpenCreateTask={(ctx) => {
              setEditingTask(null);
              setEmailContextForTask(ctx);
              setTaskModalOpen(true);
            }}
            onToggleRead={handleToggleRead}
            onRefresh={loadData}
          />
        )}

        {currentTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            loading={loading}
            onOpenCreateTask={() => {
              setEditingTask(null);
              setEmailContextForTask(null);
              setTaskModalOpen(true);
            }}
            onOpenEditTask={(task) => {
              setEditingTask(task);
              setEmailContextForTask(null);
              setTaskModalOpen(true);
            }}
            onToggleStatus={handleToggleTaskStatus}
            onDeleteTask={handleDeleteTask}
            onSelectEmailId={handleSelectEmailId}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView analytics={analytics} loading={loading} />
        )}

        {currentTab === 'settings' && (
          <SettingsView
            authStatus={authStatus}
            onRefreshAuthStatus={loadData}
            onResetDemo={() => {
              loadData();
              showToast('Demo data successfully refreshed', 'success');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-cream-200 bg-cream-50/60 py-6 text-xs text-charcoal-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-semibold text-charcoal-700">MailMind AI</span> — Advanced Programming Practices Capstone Project
          </div>
          <div className="flex items-center gap-4 text-charcoal-500">
            <span>FastAPI + SQLite Backend</span>
            <span>•</span>
            <span>React + Vite Frontend</span>
            <span>•</span>
            <span>Gmail API & Google OAuth 2.0</span>
          </div>
        </div>
      </footer>

      {/* Email Detail Modal */}
      <EmailDetailModal
        email={selectedEmail}
        isOpen={Boolean(selectedEmail)}
        onClose={() => setSelectedEmail(null)}
        onOpenReply={(em) => {
          setSelectedEmail(null);
          setReplyEmail(em);
        }}
        onOpenCreateTask={(ctx) => {
          setEditingTask(null);
          setEmailContextForTask(ctx);
          setTaskModalOpen(true);
        }}
        onEmailUpdated={handleEmailUpdated}
      />

      {/* Reply Modal */}
      <ReplyModal
        email={replyEmail}
        isOpen={Boolean(replyEmail)}
        onClose={() => setReplyEmail(null)}
        onSentSuccess={(msg) => showToast(msg, 'success')}
      />

      {/* Task Modal */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
          setEmailContextForTask(null);
        }}
        onSaved={handleTaskSaved}
        initialTask={editingTask}
        initialEmailContext={emailContextForTask}
      />

      {/* Global Toast Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-elevated border flex items-center gap-3 text-xs sm:text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-charcoal-900 text-cream-50 border-charcoal-700'
                : 'bg-rose-900 text-rose-50 border-rose-800'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            )}
            <span>{toast.text}</span>
            <button
              onClick={() => setToast(null)}
              className="p-1 rounded text-charcoal-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
