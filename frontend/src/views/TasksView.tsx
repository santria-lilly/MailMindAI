import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  Calendar,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  Mail,
  AlertCircle
} from 'lucide-react';
import { Task, Priority } from '../types';
import { PriorityBadge } from '../components/PriorityBadge';

interface TasksViewProps {
  tasks: Task[];
  loading: boolean;
  onOpenCreateTask: () => void;
  onOpenEditTask: (task: Task) => void;
  onToggleStatus: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onSelectEmailId?: (emailId: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  loading,
  onOpenCreateTask,
  onOpenEditTask,
  onToggleStatus,
  onDeleteTask,
  onSelectEmailId
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    return true;
  });

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  const isOverdue = (dueDateStr?: string) => {
    if (!dueDateStr) return false;
    try {
      const due = new Date(dueDateStr).setHours(0, 0, 0, 0);
      const today = new Date().setHours(0, 0, 0, 0);
      return due < today;
    } catch {
      return false;
    }
  };

  const isDueToday = (dueDateStr?: string) => {
    if (!dueDateStr) return false;
    try {
      const due = new Date(dueDateStr).setHours(0, 0, 0, 0);
      const today = new Date().setHours(0, 0, 0, 0);
      return due === today;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Add Task Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-charcoal-900 tracking-tight">
            Action Items & Tasks
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
            Persisted in SQLite. Track deliverables extracted automatically from triage workflows.
          </p>
        </div>

        <button
          onClick={onOpenCreateTask}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-sage-700 hover:bg-sage-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-subtle"
        >
          <Plus className="w-4 h-4" />
          Create Task
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="rounded-2xl bg-white border border-cream-200 p-4 shadow-subtle flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              statusFilter === 'pending'
                ? 'bg-sage-700 text-white shadow-subtle'
                : 'text-charcoal-600 hover:bg-cream-100 hover:text-charcoal-900'
            }`}
          >
            <span>Pending</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                statusFilter === 'pending' ? 'bg-white/20 text-white' : 'bg-cream-200 text-charcoal-600'
              }`}
            >
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              statusFilter === 'completed'
                ? 'bg-sage-700 text-white shadow-subtle'
                : 'text-charcoal-600 hover:bg-cream-100 hover:text-charcoal-900'
            }`}
          >
            <span>Completed</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                statusFilter === 'completed' ? 'bg-white/20 text-white' : 'bg-cream-200 text-charcoal-600'
              }`}
            >
              {completedCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
              statusFilter === 'all'
                ? 'bg-sage-700 text-white shadow-subtle'
                : 'text-charcoal-600 hover:bg-cream-100 hover:text-charcoal-900'
            }`}
          >
            <span>All Tasks</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                statusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-cream-200 text-charcoal-600'
              }`}
            >
              {tasks.length}
            </span>
          </button>
        </div>

        {/* Priority Filter Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-charcoal-400">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-cream-300 bg-cream-50 text-xs text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-sage-500"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="rounded-2xl bg-white border border-cream-200 shadow-subtle overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-cream-100 rounded-xl" />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="py-16 text-center text-charcoal-400 space-y-2">
            <CheckSquare className="w-10 h-10 mx-auto text-charcoal-300 stroke-1" />
            <p className="text-sm font-medium text-charcoal-700">No tasks in this view</p>
            <p className="text-xs text-charcoal-400">Click &quot;Create Task&quot; or convert an email action item.</p>
          </div>
        ) : (
          <div className="divide-y divide-cream-100">
            {filteredTasks.map((task) => {
              const isDone = task.status === 'completed';
              const overdue = !isDone && isOverdue(task.due_date);
              const dueToday = !isDone && isDueToday(task.due_date);

              return (
                <div
                  key={task.id}
                  className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                    isDone ? 'bg-cream-50/40 opacity-70' : 'hover:bg-cream-50/80 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <button
                      onClick={() => onToggleStatus(task)}
                      className={`mt-0.5 flex-shrink-0 transition-colors ${
                        isDone ? 'text-emerald-600' : 'text-charcoal-300 hover:text-sage-700'
                      }`}
                      title={isDone ? 'Mark as pending' : 'Mark as completed'}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 fill-emerald-100" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <PriorityBadge priority={task.priority} size="sm" />
                        {task.due_date && (
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 ${
                              overdue
                                ? 'bg-rose-100 text-rose-800'
                                : dueToday
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-cream-100 text-charcoal-600'
                            }`}
                          >
                            <Calendar className="w-3 h-3" />
                            {task.due_date} {overdue ? '(Overdue)' : dueToday ? '(Today)' : ''}
                          </span>
                        )}
                        {task.is_demo && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase bg-cream-200 text-charcoal-500">
                            Demo
                          </span>
                        )}
                      </div>

                      <h4
                        className={`text-sm font-semibold leading-snug ${
                          isDone ? 'line-through text-charcoal-400' : 'text-charcoal-900'
                        }`}
                      >
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className="text-xs text-charcoal-600 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {task.email_subject && (
                        <div
                          onClick={() => task.email_id && onSelectEmailId && onSelectEmailId(task.email_id)}
                          className="pt-1 flex items-center gap-1.5 text-[11px] text-sage-800 hover:text-sage-900 cursor-pointer font-medium"
                          title="Click to view related email"
                        >
                          <Mail className="w-3 h-3" />
                          <span className="truncate">Linked: {task.email_subject}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0 pt-0.5">
                    <button
                      onClick={() => onOpenEditTask(task)}
                      className="p-1.5 rounded-lg text-charcoal-400 hover:text-charcoal-700 hover:bg-cream-200 transition-colors"
                      title="Edit task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 rounded-lg text-charcoal-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
