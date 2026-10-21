import React from 'react';
import {
  BarChart3,
  PieChart,
  CheckCircle2,
  Clock,
  Mail,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { AnalyticsData } from '../types';

interface AnalyticsViewProps {
  analytics: AnalyticsData | null;
  loading: boolean;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics, loading }) => {
  if (loading && !analytics) {
    return (
      <div className="space-y-6 animate-pulse py-8">
        <div className="h-28 bg-cream-200 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

  const priorityBars = [
    {
      label: 'Critical Priority',
      count: emailStats.critical,
      color: 'bg-rose-500',
      badge: 'Immediate Action',
      percentage: emailStats.total > 0 ? Math.round((emailStats.critical / emailStats.total) * 100) : 0
    },
    {
      label: 'High Priority',
      count: emailStats.high,
      color: 'bg-amber-500',
      badge: 'Action Required',
      percentage: emailStats.total > 0 ? Math.round((emailStats.high / emailStats.total) * 100) : 0
    },
    {
      label: 'Medium Priority',
      count: emailStats.medium,
      color: 'bg-sky-500',
      badge: 'Standard Work',
      percentage: emailStats.total > 0 ? Math.round((emailStats.medium / emailStats.total) * 100) : 0
    },
    {
      label: 'Low Priority',
      count: emailStats.low,
      color: 'bg-slate-400',
      badge: 'Informational',
      percentage: emailStats.total > 0 ? Math.round((emailStats.low / emailStats.total) * 100) : 0
    }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal-900 tracking-tight">
            Intelligence & Workflow Analytics
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
            Data insights on priority allocation, triage throughput, and milestone completion.
          </p>
        </div>

        {emailStats.is_demo_dataset && (
          <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-cream-200 border border-cream-300 text-charcoal-700">
            Demonstration Dataset
          </span>
        )}
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-cream-200 shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
              Task Completion Rate
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif text-charcoal-900">
              {taskStats.completion_rate}%
            </span>
            <span className="text-xs text-charcoal-400">
              {taskStats.completed} of {taskStats.total} done
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-cream-200 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-sage-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${taskStats.completion_rate}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-cream-200 shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
              Triage Processing Rate
            </span>
            <div className="p-2 rounded-xl bg-sage-50 text-sage-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif text-charcoal-900">100%</span>
            <span className="text-xs text-emerald-600 font-medium">All indexed</span>
          </div>
          <p className="text-xs text-charcoal-400 mt-3">
            Every incoming email triaged with priority & action item parsing
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-cream-200 shadow-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500">
              Inbox Attention Load
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-serif text-rose-700">
              {emailStats.critical + emailStats.high}
            </span>
            <span className="text-xs text-charcoal-400">high urgency items</span>
          </div>
          <p className="text-xs text-charcoal-400 mt-3">
            {emailStats.critical} critical emergencies, {emailStats.high} high priority reviews
          </p>
        </div>
      </div>

      {/* Main Charts: Priority Distribution & Tasks Balance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Email Priority Distribution */}
        <div className="rounded-2xl bg-white border border-cream-200 p-6 shadow-subtle">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cream-100 text-charcoal-700">
                <BarChart3 className="w-4 h-4 text-sage-700" />
              </div>
              <h3 className="font-semibold text-charcoal-900 text-sm">
                Email Priority Distribution
              </h3>
            </div>
            <span className="text-xs text-charcoal-400">{emailStats.total} total emails</span>
          </div>

          <div className="space-y-4">
            {priorityBars.map((bar, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-charcoal-800">{bar.label}</span>
                    <span className="text-[10px] text-charcoal-400">({bar.badge})</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-charcoal-900">{bar.count}</span>
                    <span className="text-charcoal-400 text-[11px]">({bar.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-cream-100 h-3 rounded-full overflow-hidden">
                  <div
                    className={`${bar.color} h-full rounded-full transition-all duration-700`}
                    style={{ width: `${Math.max(bar.percentage, 3)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-cream-100 grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-100">
              <span className="block font-bold text-rose-700">{emailStats.critical}</span>
              <span className="text-[10px] text-rose-600">Critical</span>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
              <span className="block font-bold text-amber-700">{emailStats.high}</span>
              <span className="text-[10px] text-amber-600">High</span>
            </div>
            <div className="p-2 rounded-xl bg-sky-50 border border-sky-100">
              <span className="block font-bold text-sky-700">{emailStats.medium}</span>
              <span className="text-[10px] text-sky-600">Medium</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="block font-bold text-slate-700">{emailStats.low}</span>
              <span className="text-[10px] text-slate-600">Low</span>
            </div>
          </div>
        </div>

        {/* Task Velocity & Resolution Status */}
        <div className="rounded-2xl bg-white border border-cream-200 p-6 shadow-subtle flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cream-100 text-charcoal-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-charcoal-900 text-sm">
                  Task Resolution Breakdown
                </h3>
              </div>
              <span className="text-xs text-charcoal-400">{taskStats.total} total tasks</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-cream-50 border border-cream-200 text-center">
                <span className="block text-2xl font-bold font-serif text-charcoal-900">
                  {taskStats.pending}
                </span>
                <span className="text-xs text-charcoal-500 font-medium">Pending Tasks</span>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="block text-2xl font-bold font-serif text-emerald-800">
                  {taskStats.completed}
                </span>
                <span className="text-xs text-emerald-700 font-medium">Completed Tasks</span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-charcoal-600">
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>Tasks Due Today</span>
                </div>
                <span className="font-bold text-amber-800">{taskStats.due_today}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50/60 border border-rose-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <span>Tasks Overdue</span>
                </div>
                <span className="font-bold text-rose-800">{taskStats.overdue}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-cream-100 text-[11px] text-charcoal-400 text-center">
            Automatic metric recalculation synchronized with SQLite database
          </div>
        </div>
      </div>
    </div>
  );
};
