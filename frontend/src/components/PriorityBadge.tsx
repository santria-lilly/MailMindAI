import React from 'react';
import { Priority } from '../types';
import { AlertCircle, AlertTriangle, Clock, Info } from 'lucide-react';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = 'md',
  showIcon = true
}) => {
  const config = {
    Critical: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-600',
      icon: AlertCircle,
      label: 'Critical'
    },
    High: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-600',
      icon: AlertTriangle,
      label: 'High'
    },
    Medium: {
      bg: 'bg-sky-50 text-sky-800 border-sky-200',
      dot: 'bg-sky-600',
      icon: Clock,
      label: 'Medium'
    },
    Low: {
      bg: 'bg-slate-50 text-slate-600 border-slate-200',
      dot: 'bg-slate-400',
      icon: Info,
      label: 'Low'
    }
  }[priority] || {
    bg: 'bg-stone-50 text-stone-700 border-stone-200',
    dot: 'bg-stone-400',
    icon: Info,
    label: priority
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold'
  }[size];

  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses} tracking-tight transition-all`}
    >
      {showIcon && <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{config.label}</span>
    </span>
  );
};
