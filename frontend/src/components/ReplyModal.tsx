import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Copy,
  Check,
  Send,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { Email, ReplyTone } from '../types';
import { api } from '../services/api';

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: Email | null;
  onSentSuccess?: (message: string) => void;
}

export const ReplyModal: React.FC<ReplyModalProps> = ({
  isOpen,
  onClose,
  email,
  onSentSuccess
}) => {
  const [tone, setTone] = useState<ReplyTone>('Professional');
  const [additionalContext, setAdditionalContext] = useState('');
  const [replyText, setReplyText] = useState('');
  const [subject, setSubject] = useState('');
  const [recipient, setRecipient] = useState('');
  const [engineUsed, setEngineUsed] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Explicit review & confirmation step state
  const [showConfirmStep, setShowConfirmStep] = useState(false);

  useEffect(() => {
    if (email && isOpen) {
      setRecipient(email.sender_email);
      setSubject(email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`);
      setAdditionalContext('');
      setReplyText('');
      setEngineUsed('');
      setShowConfirmStep(false);
      setError(null);
      // Auto trigger initial generation
      handleGenerate(email.id, 'Professional', '');
    }
  }, [email, isOpen]);

  if (!isOpen || !email) return null;

  const handleGenerate = async (emailId: string, selectedTone: ReplyTone, context: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.generateReply(emailId, selectedTone, context);
      setReplyText(res.reply_text);
      setEngineUsed(res.engine_used);
      setSubject(res.subject);
    } catch (err: any) {
      setError(err.message || 'Failed to generate reply draft');
    } finally {
      setLoading(false);
    }
  };

  const handleToneChange = (newTone: ReplyTone) => {
    setTone(newTone);
    if (email) {
      handleGenerate(email.id, newTone, additionalContext);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(replyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendConfirm = async () => {
    try {
      setSending(true);
      setError(null);
      const res = await api.sendReply({
        email_id: email.id,
        subject,
        recipient_email: recipient,
        reply_body: replyText,
        is_demo: email.is_demo
      });

      if (onSentSuccess) {
        onSentSuccess(res.message);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
      setShowConfirmStep(false);
    } finally {
      setSending(false);
    }
  };

  const tones: Array<{ id: ReplyTone; label: string; desc: string }> = [
    { id: 'Professional', label: 'Professional', desc: 'Balanced & polished' },
    { id: 'Friendly', label: 'Friendly', desc: 'Warm & collaborative' },
    { id: 'Formal', label: 'Formal', desc: 'Strict protocol' },
    { id: 'Concise', label: 'Concise', desc: 'Direct & brief' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl bg-white border border-cream-300 shadow-elevated overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between bg-cream-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sage-700 text-white">
              <Sparkles className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-semibold text-charcoal-900 text-sm">
                AI Reply Generator
              </h3>
              <p className="text-xs text-charcoal-500">
                Contextual draft with full human oversight
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email Recipient Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-cream-50 border border-cream-200">
              <span className="text-charcoal-400 block mb-0.5">Recipient</span>
              <span className="font-semibold text-charcoal-800 truncate block">{recipient}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-cream-50 border border-cream-200">
              <span className="text-charcoal-400 block mb-0.5">Subject</span>
              <span className="font-semibold text-charcoal-800 truncate block">{subject}</span>
            </div>
          </div>

          {/* Tone Selector Pills */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-2">
              Response Tone
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {tones.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleToneChange(t.id)}
                  disabled={loading}
                  className={`px-3 py-2 rounded-xl text-left border transition-all ${
                    tone === t.id
                      ? 'bg-sage-50 border-sage-500 text-sage-900 ring-1 ring-sage-500'
                      : 'bg-white border-cream-200 text-charcoal-700 hover:bg-cream-50'
                  }`}
                >
                  <span className="block text-xs font-semibold">{t.label}</span>
                  <span className="block text-[10px] text-charcoal-400">{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Guidance / Prompt Notes */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-charcoal-600">
                Custom Instructions (Optional)
              </label>
              {additionalContext && (
                <button
                  onClick={() => {
                    setAdditionalContext('');
                    handleGenerate(email.id, tone, '');
                  }}
                  className="text-[11px] text-charcoal-400 hover:text-charcoal-700 underline"
                >
                  Clear notes
                </button>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="e.g., Mention I will send the revised report tomorrow by 11 AM..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-cream-300 bg-cream-50/50 text-xs text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:bg-white transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleGenerate(email.id, tone, additionalContext);
                  }
                }}
              />
              <button
                type="button"
                onClick={() => handleGenerate(email.id, tone, additionalContext)}
                disabled={loading}
                className="px-3.5 py-2 rounded-xl bg-cream-200 hover:bg-cream-300 text-charcoal-800 text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Regenerate
              </button>
            </div>
          </div>

          {/* Draft Body Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-charcoal-600">
                  Editable Message Draft
                </label>
                {engineUsed && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-cream-200 text-charcoal-600">
                    Engine: {engineUsed}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!replyText}
                className="text-xs font-medium text-sage-700 hover:text-sage-900 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Text'}
              </button>
            </div>

            {loading ? (
              <div className="h-52 rounded-xl border border-cream-200 bg-cream-50 p-6 flex flex-col items-center justify-center gap-2 text-charcoal-500 text-xs">
                <RefreshCw className="w-6 h-6 animate-spin text-sage-600" />
                <span>Composing contextual response with {tone} tone...</span>
              </div>
            ) : (
              <textarea
                rows={9}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="AI draft will appear here. You can freely edit before sending."
                className="w-full p-3.5 rounded-xl border border-cream-300 bg-white text-charcoal-900 text-xs leading-relaxed font-sans focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-sage-500 transition-all resize-none"
              />
            )}
          </div>

          {/* Review & Confirmation Safety Banner */}
          {showConfirmStep && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                <span>Explicit Review & Confirmation Required</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                You are about to transmit this message to <strong>{recipient}</strong>.
                {email.is_demo ? (
                  <span className="block mt-1 text-[11px] text-amber-700 italic">
                    (In Demo Mode, this will record a simulated dispatch without touching live servers.)
                  </span>
                ) : (
                  <span className="block mt-1 text-[11px] text-amber-700 italic">
                    (This will dispatch directly through your authenticated Gmail account via official API.)
                  </span>
                )}
              </p>
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmStep(false)}
                  className="px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs font-medium text-amber-800 hover:bg-amber-100 transition-colors"
                >
                  Edit Again
                </button>
                <button
                  type="button"
                  onClick={handleSendConfirm}
                  disabled={sending}
                  className="px-4 py-1.5 rounded-lg bg-sage-800 hover:bg-sage-900 text-xs font-medium text-white flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {sending ? 'Sending...' : 'Confirm & Send Now'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 border-t border-cream-200 flex items-center justify-between bg-cream-50">
          <span className="text-[11px] text-charcoal-400">
            Never sends automatically • Human in the loop guaranteed
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-cream-300 text-charcoal-700 hover:bg-cream-100 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            {!showConfirmStep ? (
              <button
                type="button"
                onClick={() => setShowConfirmStep(true)}
                disabled={!replyText.trim() || loading}
                className="px-5 py-2 rounded-xl bg-sage-700 hover:bg-sage-800 text-white text-xs font-medium flex items-center gap-2 transition-all shadow-subtle disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                Review & Confirm Send
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
