import React from 'react';
import {
  LayoutDashboard,
  Inbox,
  CheckSquare,
  BarChart3,
  Settings,
  Sparkles,
  RefreshCw,
  MailCheck,
  RotateCcw
} from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { AuthStatus, Notification } from '../types';

export type NavTab = 'dashboard' | 'inbox' | 'tasks' | 'analytics' | 'settings';

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  unreadEmailCount: number;
  criticalEmailCount: number;
  pendingTaskCount: number;
  authStatus: AuthStatus | null;
  onSyncInbox: () => void;
  syncing: boolean;
  onSelectNotification?: (notif: Notification) => void;
  onResetDemo: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  unreadEmailCount,
  criticalEmailCount,
  pendingTaskCount,
  authStatus,
  onSyncInbox,
  syncing,
  onSelectNotification,
  onResetDemo
}) => {
  const navItems: Array<{ id: NavTab; label: string; icon: React.ElementType; badge?: number; badgeColor?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'inbox',
      label: 'Smart Inbox',
      icon: Inbox,
      badge: criticalEmailCount > 0 ? criticalEmailCount : unreadEmailCount,
      badgeColor: criticalEmailCount > 0 ? 'bg-rose-500 text-white' : 'bg-sage-100 text-sage-800'
    },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      badge: pendingTaskCount > 0 ? pendingTaskCount : undefined,
      badgeColor: 'bg-cream-300 text-charcoal-700'
    },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings & Setup', icon: Settings }
  ];

  const isLiveConnected = authStatus?.is_authenticated;

  return (
    <header className="sticky top-0 z-40 bg-[#FDFCF7]/95 backdrop-blur-md border-b border-cream-300 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <div
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-sage-700 text-cream-50 flex items-center justify-center shadow-card group-hover:bg-sage-800 transition-colors">
                <Sparkles className="w-5 h-5 text-emerald-200" />
              </div>
              <div>
                <span className="font-serif font-bold text-lg text-charcoal-900 tracking-tight block leading-tight">
                  MailMind <span className="text-sage-700 font-sans font-medium text-xs ml-0.5">AI</span>
                </span>
                <span className="text-[10px] text-charcoal-500 font-medium uppercase tracking-wider block">
                  Smart Prioritization & Triage
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 ml-4">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
                      isActive
                        ? 'bg-cream-200 text-charcoal-900 font-semibold shadow-subtle'
                        : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-sage-700' : 'text-charcoal-400'}`} />
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Header Status Bar & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Environment / Demo Mode Status Badge */}
            {isLiveConnected ? (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <MailCheck className="w-3.5 h-3.5" />
                <span className="truncate max-w-[140px]">{authStatus.connected_email || 'Gmail Live'}</span>
              </div>
            ) : (
              <div
                onClick={() => onSelectTab('settings')}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream-200/80 border border-cream-300 text-charcoal-700 text-xs font-medium cursor-pointer hover:bg-cream-300 transition-colors"
                title="Running in Demo Mode. Click to configure Gmail credentials."
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Demo Mode</span>
              </div>
            )}

            {/* Reset Demo Data Button */}
            <button
              onClick={onResetDemo}
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-charcoal-500 hover:text-charcoal-800 hover:bg-cream-200 border border-cream-300 transition-colors"
              title="Reset sample demonstration data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo</span>
            </button>

            {/* Sync Inbox Button */}
            <button
              onClick={onSyncInbox}
              disabled={syncing}
              className="p-2 rounded-lg text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-200 transition-colors disabled:opacity-50"
              title="Sync & Triage Inbox"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin text-sage-600' : ''}`} />
            </button>

            {/* Notification Center */}
            <NotificationCenter onSelectNotification={onSelectNotification} />
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-cream-200 overflow-x-auto">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  isActive ? 'bg-cream-200 text-charcoal-900 font-semibold' : 'text-charcoal-600'
                }`}
              >
                <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-sage-700' : ''}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-1 py-0.2 rounded-full text-[9px] font-bold ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
