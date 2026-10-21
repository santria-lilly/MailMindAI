import React, { useState } from 'react';
import {
  X,
  Reply,
  CheckSquare,
  Clock,
  Sparkles,
  Mail,
  Calendar,
  AlertCircle,
  Check,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Email, DeadlineItem } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { api } from '../services/api';

interface EmailDetailModalProps {
  email: Email | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenReply: (email: Email) => void;
  onOpenCreateTask: (emailContext: { id: string; subject: string; prefilledTitle?: string; prefilledDueDate?: string }) => void;
  onEmailUpdated: (updatedEmail: Email) => void;
}

export const EmailDetailModal: React.FC<EmailDetailModalProps> = ({
  email,
  isOpen,
  onClose,
  onOpenReply,
  onOpenCreateTask,
  onEmailUpdated
}) => {
  const [reAnalyzing, setReAnalyzing] = useState(false);
  const [readState, setReadState] = useState(email?.is_read ?? false);

  if (!isOpen || !email) return null;

  const handleToggleRead = async () => {
    try {
      const newState = !readState;
      setReadState(newState);
      await api.markEmailRead(email.id, newState);
      onEmailUpdated({ ...email, is_read: newState });
    } catch (err) {
      console.error('Failed to toggle read state:', err);
    }
  };

  const handleReAnalyze = async () => {
    try {
      setReAnalyzing(true);
      const updated = await api.prioritizeEmail(email.id);
      onEmailUpdated(updated);
    } catch (err) {
      console.error('Failed to re-analyze email:', err);
    } finally {
      setReAnalyzing(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-3xl rounded-2xl bg-white border border-cream-300 shadow-elevated overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between bg-cream-50">
          <div className="flex items-center gap-3">
            <PriorityBadge priority={email.priority} size="md" />
            {email.is_demo && (
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-cream-200 text-charcoal-600 border border-cream-300">
                Demo
              </span>
            )}
            <button
              onClick={handleToggleRead}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 ${
                readState
                  ? 'border-cream-300 text-charcoal-500 hover:bg-cream-100'
                  : 'border-sage-300 bg-sage-50 text-sage-800 font-medium'
              }`}
            >
              {readState ? <Check className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
              {readState ? 'Mark Unread' : 'Mark as Read'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReAnalyze}
              disabled={reAnalyzing}
              className="text-xs text-charcoal-600 hover:text-charcoal-900 px-2.5 py-1 rounded-lg hover:bg-cream-200 border border-cream-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Run AI prioritization again"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${reAnalyzing ? 'animate-spin text-sage-600' : ''}`} />
              Re-Analyze
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Header & Sender Meta */}
          <div>
            <h2 className="text-xl font-bold text-charcoal-900 font-serif leading-snug mb-3">
              {email.subject}
            </h2>
            <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-xl bg-cream-50 border border-cream-200 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-sage-700 text-white font-bold flex items-center justify-center text-xs shadow-subtle">
                  {email.sender_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-semibold text-charcoal-900 block">
                    {email.sender_name}
                  </span>
                  <span className="text-charcoal-500">{email.sender_email}</span>
                </div>
              </div>
              <div className="text-charcoal-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDate(email.received_at)}</span>
              </div>
            </div>
          </div>

          {/* AI Intelligence Card */}
          <div className="rounded-xl border border-sage-200 bg-sage-50/60 p-4 space-y-3.5 shadow-subtle">
            <div className="flex items-center gap-2 text-sage-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-sage-700" />
              <span>MailMind Intelligence Analysis</span>
            </div>

            {/* Why this email is important */}
            {email.priority_reason && (
              <div className="text-xs">
                <span className="font-semibold text-charcoal-700 block mb-0.5">
                  Priority Rationale:
                </span>
                <p className="text-charcoal-800 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-sage-100">
                  {email.priority_reason}
                </p>
              </div>
            )}

            {/* Summary */}
            {email.summary && (
              <div className="text-xs">
                <span className="font-semibold text-charcoal-700 block mb-0.5">
                  Executive Summary:
                </span>
                <p className="text-charcoal-800 leading-relaxed bg-white/70 p-2.5 rounded-lg border border-sage-100">
                  {email.summary}
                </p>
              </div>
            )}

            {/* Detected Action Items with 1-click Task Conversion */}
            {email.action_items && email.action_items.length > 0 && (
              <div className="text-xs">
                <span className="font-semibold text-charcoal-700 block mb-1.5">
                  Detected Action Items:
                </span>
                <div className="space-y-1.5">
                  {email.action_items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-white border border-cream-200 text-charcoal-800"
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-sage-600 mt-1.5 flex-shrink-0" />
                        <span className="leading-snug">{item}</span>
                      </div>
                      <button
                        onClick={() =>
                          onOpenCreateTask({
                            id: email.id,
                            subject: email.subject,
                            prefilledTitle: item
                          })
                        }
                        className="flex-shrink-0 px-2 py-1 rounded-md text-[11px] font-medium bg-sage-100 text-sage-800 hover:bg-sage-200 transition-colors flex items-center gap-1"
                        title="Create task from this action item"
                      >
                        <CheckSquare className="w-3 h-3" />
                        Convert to Task
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detected Deadlines */}
            {email.deadlines && email.deadlines.length > 0 && (
              <div className="text-xs">
                <span className="font-semibold text-charcoal-700 block mb-1.5">
                  Detected Deadlines:
                </span>
                <div className="flex flex-wrap gap-2">
                  {email.deadlines.map((dl, idx) => (
                    <div
                      key={idx}
                      className={`px-3 py-1.5 rounded-lg border text-xs flex items-center gap-2 ${
                        dl.is_urgent
                          ? 'bg-rose-50 border-rose-200 text-rose-800'
                          : 'bg-amber-50 border-amber-200 text-amber-800'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        <strong>{dl.title}</strong>: {dl.date}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Full Message Body */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-500 block mb-2">
              Message Content
            </span>
            <div className="p-4 rounded-xl border border-cream-200 bg-white text-xs sm:text-sm text-charcoal-800 font-sans leading-relaxed whitespace-pre-line shadow-subtle selection:bg-sage-100">
              {email.body}
            </div>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="px-6 py-3.5 border-t border-cream-200 bg-cream-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-charcoal-500">
            {email.requires_reply ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                <AlertCircle className="w-3 h-3" />
                Response Expected
              </span>
            ) : (
              <span>Informational message</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                onOpenCreateTask({
                  id: email.id,
                  subject: email.subject
                })
              }
              className="px-4 py-2 rounded-xl border border-cream-300 text-charcoal-800 hover:bg-cream-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <CheckSquare className="w-3.5 h-3.5 text-sage-700" />
              Create Task
            </button>
            <button
              onClick={() => onOpenReply(email)}
              className="px-5 py-2 rounded-xl bg-sage-700 hover:bg-sage-800 text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-subtle"
            >
              <Reply className="w-3.5 h-3.5" />
              Reply with AI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
