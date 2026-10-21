import React, { useState } from 'react';
import {
  Search,
  Filter,
  Mail,
  CheckCircle2,
  Calendar,
  Sparkles,
  RefreshCw,
  Clock,
  Reply,
  CheckSquare
} from 'lucide-react';
import { Email, Priority } from '../types';
import { PriorityBadge } from '../components/PriorityBadge';

interface InboxViewProps {
  emails: Email[];
  loading: boolean;
  priorityFilter: string;
  onSetPriorityFilter: (priority: string) => void;
  unreadFilter: boolean | null;
  onSetUnreadFilter: (unread: boolean | null) => void;
  searchQuery: string;
  onSetSearchQuery: (query: string) => void;
  onSelectEmail: (email: Email) => void;
  onOpenReply: (email: Email) => void;
  onOpenCreateTask: (emailContext: { id: string; subject: string; prefilledTitle?: string }) => void;
  onToggleRead: (email: Email) => void;
  onRefresh: () => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  emails,
  loading,
  priorityFilter,
  onSetPriorityFilter,
  unreadFilter,
  onSetUnreadFilter,
  searchQuery,
  onSetSearchQuery,
  onSelectEmail,
  onOpenReply,
  onOpenCreateTask,
  onToggleRead,
  onRefresh
}) => {
  const priorityTabs = [
    { id: 'All', label: 'All Emails' },
    { id: 'Critical', label: 'Critical' },
    { id: 'High', label: 'High' },
    { id: 'Medium', label: 'Medium' },
    { id: 'Low', label: 'Low' }
  ];

  // Count items per priority tab
  const getTabCount = (tabId: string) => {
    if (tabId === 'All') return emails.length;
    return emails.filter((e) => e.priority === tabId).length;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      if (isToday) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal-900 tracking-tight">
            Smart Inbox
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
            Prioritized by AI urgency heuristics, actionable milestones, and sender context.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2 rounded-xl border border-cream-300 text-charcoal-700 hover:bg-cream-100 text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sage-600' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="rounded-2xl bg-white border border-cream-200 p-4 shadow-subtle space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Priority Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {priorityTabs.map((tab) => {
              const count = getTabCount(tab.id);
              const isActive = priorityFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSetPriorityFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-sage-700 text-white shadow-subtle'
                      : 'text-charcoal-600 hover:bg-cream-100 hover:text-charcoal-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-cream-200 text-charcoal-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Unread Only Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSetUnreadFilter(unreadFilter ? null : true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                unreadFilter
                  ? 'bg-sage-100 border-sage-300 text-sage-900 font-semibold'
                  : 'border-cream-300 text-charcoal-600 hover:bg-cream-100'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              Unread Only
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSetSearchQuery(e.target.value)}
            placeholder="Search emails by sender, subject, keywords, or snippet..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-xs sm:text-sm text-charcoal-900 placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSetSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-charcoal-400 hover:text-charcoal-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Email List */}
      <div className="rounded-2xl bg-white border border-cream-200 shadow-subtle overflow-hidden">
        {loading ? (
          <div className="divide-y divide-cream-100 p-6 space-y-4 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="py-4 space-y-2">
                <div className="h-4 bg-cream-200 rounded w-1/4" />
                <div className="h-4 bg-cream-200 rounded w-3/4" />
                <div className="h-3 bg-cream-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : emails.length === 0 ? (
          <div className="py-16 text-center text-charcoal-400 space-y-2">
            <Mail className="w-10 h-10 mx-auto text-charcoal-300 stroke-1" />
            <p className="text-sm font-medium text-charcoal-700">No emails match the selected filters</p>
            <p className="text-xs text-charcoal-400">Try adjusting your priority tab or search term.</p>
          </div>
        ) : (
          <div className="divide-y divide-cream-100">
            {emails.map((email) => (
              <div
                key={email.id}
                onClick={() => onSelectEmail(email)}
                className={`p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 cursor-pointer transition-all ${
                  email.is_read
                    ? 'hover:bg-cream-50/80 bg-white'
                    : 'bg-[#FAF8F4] hover:bg-cream-100/70 border-l-4 border-l-sage-600'
                }`}
              >
                {/* Left: Priority, Sender, Subject, Summary */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="mt-0.5 flex-shrink-0">
                    <PriorityBadge priority={email.priority} size="sm" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs truncate ${
                          email.is_read ? 'text-charcoal-700' : 'text-charcoal-900 font-bold'
                        }`}
                      >
                        {email.sender_name}
                      </span>
                      {email.is_demo && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase bg-cream-200 text-charcoal-500">
                          Demo
                        </span>
                      )}
                      {email.requires_reply && (
                        <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          Reply Needed
                        </span>
                      )}
                    </div>

                    <h4
                      className={`text-xs sm:text-sm leading-snug truncate ${
                        email.is_read ? 'text-charcoal-800' : 'text-charcoal-900 font-bold'
                      }`}
                    >
                      {email.subject}
                    </h4>

                    {/* Summary / Snippet */}
                    <p className="text-xs text-charcoal-500 line-clamp-1 leading-relaxed">
                      {email.summary || email.snippet}
                    </p>

                    {/* Deadlines Tag if detected */}
                    {email.deadlines && email.deadlines.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1">
                        <Calendar className="w-3 h-3 text-amber-600 flex-shrink-0" />
                        <span className="text-[11px] font-medium text-amber-800">
                          Due: {email.deadlines[0].date}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Date & Quick Action Buttons */}
                <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-cream-100">
                  <span className="text-[11px] text-charcoal-400 font-mono">
                    {formatDate(email.received_at)}
                  </span>

                  <div
                    className="flex items-center gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onOpenCreateTask({ id: email.id, subject: email.subject })}
                      className="p-1.5 rounded-lg text-charcoal-400 hover:text-sage-700 hover:bg-cream-200 transition-colors"
                      title="Convert to Task"
                    >
                      <CheckSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenReply(email)}
                      className="p-1.5 rounded-lg text-charcoal-400 hover:text-sage-700 hover:bg-cream-200 transition-colors"
                      title="Reply with AI"
                    >
                      <Reply className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onToggleRead(email)}
                      className="p-1.5 rounded-lg text-charcoal-400 hover:text-sage-700 hover:bg-cream-200 transition-colors"
                      title={email.is_read ? 'Mark as Unread' : 'Mark as Read'}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${email.is_read ? 'text-sage-600' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
