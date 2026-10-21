import React, { useState, useEffect } from 'react';
import { X, Calendar, Flag, CheckSquare, Mail, AlertCircle } from 'lucide-react';
import { Task, Priority, TaskCreatePayload } from '../types';
import { api } from '../services/api';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (task: Task) => void;
  initialTask?: Task | null;
  initialEmailContext?: { id: string; subject: string; prefilledTitle?: string; prefilledDueDate?: string } | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  initialTask,
  initialEmailContext
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setPriority(initialTask.priority);
      setDueDate(initialTask.due_date || '');
    } else if (initialEmailContext) {
      setTitle(initialEmailContext.prefilledTitle || `Action: ${initialEmailContext.subject}`);
      setDescription(`Created from email: "${initialEmailContext.subject}"`);
      setPriority('High');
      setDueDate(initialEmailContext.prefilledDueDate || new Date().toISOString().split('T')[0]);
    } else {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setDueDate(new Date().toISOString().split('T')[0]);
    }
    setError(null);
  }, [initialTask, initialEmailContext, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (initialTask) {
        const updated = await api.updateTask(initialTask.id, {
          title: title.trim(),
          description: description.trim(),
          priority,
          due_date: dueDate || undefined
        });
        onSaved(updated);
      } else {
        const payload: TaskCreatePayload = {
          title: title.trim(),
          description: description.trim(),
          priority,
          due_date: dueDate || undefined,
          email_id: initialEmailContext?.id,
          is_demo: true
        };
        const created = await api.createTask(payload);
        onSaved(created);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-cream-300 shadow-elevated overflow-hidden">
        <div className="px-6 py-4 border-b border-cream-200 flex items-center justify-between bg-cream-50">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-sage-700" />
            <h3 className="font-semibold text-charcoal-900">
              {initialTask ? 'Edit Task' : 'Create New Task'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {initialEmailContext && (
            <div className="p-3 rounded-lg bg-cream-100 border border-cream-200 flex items-center gap-2 text-xs text-charcoal-700">
              <Mail className="w-4 h-4 text-sage-600 flex-shrink-0" />
              <span className="truncate">
                Linked to email: <strong className="font-semibold">{initialEmailContext.subject}</strong>
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Roll back release v2.4.1 to stable build"
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500 focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1.5">
                Priority
              </label>
              <div className="relative">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500 focus:bg-white transition-all appearance-none pr-8"
                >
                  <option value="Critical">Critical (Immediate)</option>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
                <Flag className="w-4 h-4 text-charcoal-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1.5">
                Due Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-charcoal-600 mb-1.5">
              Description & Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Action items, context notes, or delivery links..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-charcoal-900 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500 focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="pt-3 border-t border-cream-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-cream-300 text-charcoal-700 hover:bg-cream-100 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-sage-700 hover:bg-sage-800 text-white text-sm font-medium transition-all shadow-subtle disabled:opacity-50"
            >
              {submitting ? 'Saving...' : initialTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
