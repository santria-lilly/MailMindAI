import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Clock, AlertCircle, AlertTriangle, MailQuestion, X } from 'lucide-react';
import { Notification } from '../types';
import { api } from '../services/api';

interface NotificationCenterProps {
  onSelectNotification?: (notification: Notification) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onSelectNotification }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications();
      setNotifications(data);
      const counts = await api.getNotificationCounts();
      setUnreadCount(counts.unread_count);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleItemClick = async (notif: Notification) => {
    if (!notif.is_read) {
      try {
        await api.markNotificationRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark read:', err);
      }
    }
    if (onSelectNotification) {
      onSelectNotification(notif);
    }
    setIsOpen(false);
  };

  const getNotifIcon = (type: Notification['type']) => {
    switch (type) {
      case 'urgent_email':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      case 'deadline':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'overdue_task':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'unanswered':
        return <MailQuestion className="w-4 h-4 text-sky-600" />;
      default:
        return <Bell className="w-4 h-4 text-sage-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2 rounded-lg text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-200 transition-colors focus:outline-none focus:ring-2 focus:ring-sage-400"
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white border border-cream-300 shadow-elevated z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 py-3 border-b border-cream-200 flex items-center justify-between bg-cream-50">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-charcoal-900 text-sm">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-sage-100 text-sage-800">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-sage-700 hover:text-sage-900 font-medium flex items-center gap-1 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-cream-100">
            {loading && notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-charcoal-400">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-charcoal-500">
                <Bell className="w-6 h-6 mx-auto mb-2 text-charcoal-300 stroke-1" />
                No notifications right now.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3.5 flex gap-3 cursor-pointer transition-colors ${
                    notif.is_read ? 'bg-white hover:bg-cream-50' : 'bg-cream-50/70 hover:bg-cream-100'
                  }`}
                >
                  <div className="mt-0.5 flex-shrink-0 p-1.5 rounded-md bg-white border border-cream-200 shadow-subtle">
                    {getNotifIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={`text-xs font-semibold truncate ${notif.is_read ? 'text-charcoal-700' : 'text-charcoal-900'}`}>
                        {notif.title}
                      </p>
                      {!notif.is_read && (
                        <span className="w-2 h-2 rounded-full bg-sage-500 flex-shrink-0 ml-1" />
                      )}
                    </div>
                    <p className="text-xs text-charcoal-600 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2 border-t border-cream-200 bg-cream-50 text-[11px] text-charcoal-400 text-center">
            MailMind In-App Alert System
          </div>
        </div>
      )}
    </div>
  );
};
