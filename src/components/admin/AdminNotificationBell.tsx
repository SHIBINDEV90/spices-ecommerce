'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  MessageSquare, 
  CheckCheck, 
  ExternalLink, 
  Sparkles,
  X,
  ArrowRight,
  Inbox
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationItem {
  _id: string;
  recipientRole: string;
  type: string;
  title: string;
  message: string;
  link: string;
  read: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
}

export default function AdminNotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newAlert, setNewAlert] = useState<NotificationItem | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef<number>(0);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/admin/notifications', { cache: 'no-store' });
      if (!res.ok) return;
      const json = await res.json();
      if (json.success) {
        const latestNotifications: NotificationItem[] = json.data || [];
        const currentUnread = json.unreadCount || 0;

        // Detect if a new notification arrived
        if (prevCountRef.current !== 0 && currentUnread > prevCountRef.current && latestNotifications.length > 0) {
          const newest = latestNotifications[0];
          setNewAlert(newest);
          setTimeout(() => setNewAlert(null), 7000);
        }

        prevCountRef.current = currentUnread;
        setNotifications(latestNotifications);
        setUnreadCount(currentUnread);
      }
    } catch (err) {
      console.error('[NotificationBell] Polling error:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Poll every 25 seconds for new purchase enquiries
    const interval = setInterval(fetchNotifications, 25000);

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        prevCountRef.current = 0;
      }
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.read) {
      try {
        await fetch('/api/admin/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: notif._id }),
        });
        setNotifications(prev =>
          prev.map(n => (n._id === notif._id ? { ...n, read: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        prevCountRef.current = Math.max(0, prevCountRef.current - 1);
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    }
    setIsOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const formatRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/30"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        
        {unreadCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-1 text-[11px] font-bold text-black shadow-lg shadow-orange-500/30 ring-2 ring-black">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
            <span className="absolute -top-1 -right-1 flex h-5 min-w-5 animate-ping rounded-full bg-orange-400 opacity-60 pointer-events-none" />
          </>
        )}
      </button>

      {/* Floating Real-time Toast Alert */}
      <AnimatePresence>
        {newAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 max-w-sm w-full bg-neutral-900 border border-amber-500/40 rounded-2xl p-4 shadow-2xl shadow-amber-500/10 backdrop-blur-xl text-white"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    New Purchase Lead
                  </h4>
                  <button
                    onClick={() => setNewAlert(null)}
                    className="text-gray-400 hover:text-white p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm font-semibold text-white mt-0.5 truncate">
                  {newAlert.title}
                </p>
                <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                  {newAlert.message}
                </p>
                <button
                  onClick={() => handleNotificationClick(newAlert)}
                  className="mt-3 text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
                >
                  View Enquiry <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-neutral-900/95 border border-white/10 rounded-2xl shadow-2xl shadow-black/80 backdrop-blur-2xl z-50 overflow-hidden"
          >
            {/* Dropdown Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={loading}
                  className="text-xs text-gray-400 hover:text-amber-400 transition-colors flex items-center gap-1 font-medium disabled:opacity-50"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all as read
                </button>
              )}
            </div>

            {/* Notification Items List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-white/5">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Inbox className="w-10 h-10 mx-auto mb-2 opacity-30 text-gray-400" />
                  <p className="text-sm font-medium text-gray-400">All caught up!</p>
                  <p className="text-xs text-gray-500 mt-1">No enquiries or notifications recorded yet.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-4 hover:bg-white/5 transition-all cursor-pointer flex items-start gap-3 relative group ${
                      !notif.read ? 'bg-amber-500/[0.04]' : ''
                    }`}
                  >
                    {/* Unread indicator bar */}
                    {!notif.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-500 rounded-r" />
                    )}

                    <div
                      className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${
                        !notif.read
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-white/5 text-gray-400 border border-white/10'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`text-xs font-semibold truncate ${
                            !notif.read ? 'text-white' : 'text-gray-300'
                          }`}
                        >
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-gray-500 whitespace-nowrap">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>

                    <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-amber-400 transition-colors flex-shrink-0 self-center" />
                  </div>
                ))
              )}
            </div>

            {/* Dropdown Footer */}
            <div className="p-3 bg-black/40 border-t border-white/10 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  router.push('/admin/enquiries');
                }}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1.5"
              >
                Go to Export Enquiries Desk &rarr;
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
