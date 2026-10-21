import React from 'react';
import {
  Mail,
  AlertCircle,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  ExternalLink,
  CheckSquare
} from 'lucide-react';
import { AnalyticsData, Task, Email } from '../types';
import { PriorityBadge } from '../components/PriorityBadge';
import { DailyBriefingCard } from '../components/DailyBriefingCard';

interface DashboardViewProps {
  analytics: AnalyticsData | null;
  loading: boolean;
  onNavigateToInbox: (priorityFilter?: string) => void;
  onNavigateToTasks: () => void;
  onSelectEmailId: (emailId: string) => void;
  onToggleTaskStatus: (task: Task) => void;
  onOpenCreateTask: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analytics,
  loading,
  onNavigateToInbox,
  onNavigateToTasks,
  onSelectEmailId,
  onToggleTaskStatus,
  onOpenCreateTask
}) => {
  if (loading && !analytics) {
    return (
      <div className="space-y-6 animate-pulse py-8">
        <div className="h-28 bg-cream-200 rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-cream-200 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-cream-200 rounded-2xl" />
          <div className="h-64 bg-cream-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const emailStats = analytics?.email_stats || {
    total: 0,
    unread: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    is_demo_dataset: true
  };

  const taskStats = analytics?.task_stats || {
    total: 0,
    pending: 0,
    completed: 0,
    due_today: 0,
    overdue: 0,
    completion_rate: 0
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner / Hero Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal-900 tracking-tight">
            Executive Command Center
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
            Real-time inbox intelligence, priority triage, and workflow management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCreateTask}
            className="px-4 py-2 rounded-xl bg-sage-700 hover:bg-sage-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-subtle"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            New Task
          </button>
          <button
            onClick={() => onNavigateToInbox()}
            className="px-4 py-2 rounded-xl border border-cream-300 text-charcoal-800 hover:bg-cream-100 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-sage-600" />
            View Inbox
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Unread Emails */}
        <div
          onClick={() => onNavigateToInbox()}
          className="p-5 rounded-2xl bg-white border border-cream-200 hover:border-cream-300 hover:shadow-card transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
              Unread Emails
            </span>
            <div className="p-2 rounded-xl bg-cream-100 text-charcoal-700 group-hover:bg-cream-200 transition-colors">
              <Mail className="w-4 h-4 text-sage-700" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-serif text-charcoal-900">
              {emailStats.unread}
            </span>
            <span className="text-xs text-charcoal-400">of {emailStats.total} total</span>
          </div>
        </div>

        {/* Critical Emails */}
        <div
          onClick={() => onNavigateToInbox('Critical')}
          className="p-5 rounded-2xl bg-white border border-cream-200 hover:border-rose-200 hover:shadow-card transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
              Critical Priority
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700 group-hover:bg-rose-100 transition-colors">
              <AlertCircle className="w-4 h-4 text-rose-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-serif text-rose-700">
              {emailStats.critical}
            </span>
            <span className="text-xs text-rose-600/80 font-medium">Immediate focus</span>
          </div>
        </div>

        {/* Tasks Due Today */}
        <div
          onClick={onNavigateToTasks}
          className="p-5 rounded-2xl bg-white border border-cream-200 hover:border-cream-300 hover:shadow-card transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
              Tasks Due Today
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-100 transition-colors">
              <Calendar className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-serif text-charcoal-900">
              {taskStats.due_today}
            </span>
            <span className="text-xs text-charcoal-400">{taskStats.pending} pending total</span>
          </div>
        </div>

        {/* Overdue Tasks */}
        <div
          onClick={onNavigateToTasks}
          className="p-5 rounded-2xl bg-white border border-cream-200 hover:border-orange-200 hover:shadow-card transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-orange-700 uppercase tracking-wider">
              Overdue Tasks
            </span>
            <div className="p-2 rounded-xl bg-orange-50 text-orange-700 group-hover:bg-orange-100 transition-colors">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-serif text-orange-700">
              {taskStats.overdue}
            </span>
            <span className="text-xs text-orange-600/80 font-medium">Requires action</span>
          </div>
        </div>
      </div>

      {/* Daily Briefing Card */}
      <DailyBriefingCard />

      {/* Main Grid: Top 3 Priorities & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Three Priorities Today */}
        <div className="rounded-2xl bg-white border border-cream-200 p-6 shadow-subtle flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cream-100 text-charcoal-700">
                <CheckSquare className="w-4 h-4 text-sage-700" />
              </div>
              <h3 className="font-semibold text-charcoal-900 text-sm">
                Top Priorities for Today
              </h3>
            </div>
            <button
              onClick={onNavigateToTasks}
              className="text-xs font-medium text-sage-700 hover:text-sage-900 flex items-center gap-1 transition-colors"
            >
              All tasks <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 flex-1">
            {analytics?.top_priorities_today && analytics.top_priorities_today.length > 0 ? (
              analytics.top_priorities_today.map((task) => (
                <div
                  key={task.id}
                  className="p-3.5 rounded-xl border border-cream-200 bg-cream-50/50 hover:bg-cream-100/70 transition-all flex items-start gap-3 group"
                >
                  <button
                    onClick={() => onToggleTaskStatus(task)}
                    className="mt-0.5 p-1 rounded-md text-charcoal-400 hover:text-sage-700 hover:bg-white transition-colors"
                    title="Mark task completed"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <PriorityBadge priority={task.priority} size="sm" />
                      {task.due_date && (
                        <span className="text-[11px] text-charcoal-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.due_date}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-charcoal-900 leading-snug line-clamp-2">
                      {task.title}
                    </p>
                    {task.email_subject && (
                      <p className="text-[11px] text-charcoal-500 mt-1 truncate">
                        From: {task.email_subject}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-charcoal-400">
                <CheckCircle2 className="w-8 h-8 text-sage-400 mx-auto mb-2 stroke-1" />
                All top priorities for today are resolved!
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="rounded-2xl bg-white border border-cream-200 p-6 shadow-subtle flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cream-100 text-charcoal-700">
                <Calendar className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-semibold text-charcoal-900 text-sm">
                Detected Deadlines & Milestones
              </h3>
            </div>
            <span className="text-xs text-charcoal-400">Auto-extracted</span>
          </div>

          <div className="space-y-3 flex-1">
            {analytics?.upcoming_deadlines && analytics.upcoming_deadlines.length > 0 ? (
              analytics.upcoming_deadlines.map((dl, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectEmailId(dl.email_id)}
                  className="p-3.5 rounded-xl border border-cream-200 bg-cream-50/50 hover:bg-cream-100/70 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${
                          dl.is_urgent
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {dl.date}
                      </span>
                      {dl.is_urgent && (
                        <span className="text-[10px] font-medium text-rose-600">Urgent</span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-charcoal-900 truncate">
                      {dl.title}
                    </p>
                    <p className="text-[11px] text-charcoal-500 truncate">
                      Subject: {dl.email_subject}
                    </p>
                  </div>

                  <ArrowRight className="w-4 h-4 text-charcoal-300 group-hover:text-charcoal-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-charcoal-400">
                No approaching deadlines detected in recent emails.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Important Emails Section */}
      <div className="rounded-2xl bg-white border border-cream-200 p-6 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cream-100 text-charcoal-700">
              <Sparkles className="w-4 h-4 text-sage-700" />
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-900 text-sm">
                Recent Critical & High-Priority Emails
              </h3>
              <p className="text-xs text-charcoal-400">
                Messages classified with highest urgency by MailMind AI
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToInbox()}
            className="text-xs font-medium text-sage-700 hover:text-sage-900 flex items-center gap-1 transition-colors"
          >
            Full Inbox <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-cream-100">
          {analytics?.recent_important_emails && analytics.recent_important_emails.length > 0 ? (
            analytics.recent_important_emails.map((email) => (
              <div
                key={email.id}
                onClick={() => onSelectEmailId(email.id)}
                className={`py-3.5 px-3 -mx-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer transition-colors ${
                  email.is_read ? 'hover:bg-cream-50' : 'bg-cream-50/60 hover:bg-cream-100 font-medium'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <PriorityBadge priority={email.priority} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-charcoal-900 truncate">
                        {email.sender_name}
                      </span>
                      {!email.is_read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-sage-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-charcoal-800 truncate">
                      {email.subject}
                    </p>
                    {email.summary && (
                      <p className="text-[11px] text-charcoal-500 line-clamp-1 mt-0.5">
                        {email.summary}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 text-[11px] text-charcoal-400 flex-shrink-0">
                  <span>{new Date(email.received_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-charcoal-300" />
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-charcoal-400">
              No recent critical emails. Inbox is well managed!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
