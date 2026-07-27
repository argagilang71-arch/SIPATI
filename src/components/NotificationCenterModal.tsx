import React, { useState, useEffect } from 'react';
import { NotificationItem } from '../types';
import {
  getStoredNotifications,
  markAllNotificationsRead,
  clearAllNotifications,
} from '../utils/activityNotificationStore';

interface NotificationCenterModalProps {
  onClose: () => void;
  onNavigateToTask?: (taskId: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  onClose,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(getStoredNotifications());
  const [filter, setFilter] = useState<'all' | 'unread' | 'completed'>('all');

  useEffect(() => {
    const handleUpdate = () => {
      setNotifications(getStoredNotifications());
    };
    window.addEventListener('sipati_notifications_updated', handleUpdate);
    return () => window.removeEventListener('sipati_notifications_updated', handleUpdate);
  }, []);

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    setNotifications(getStoredNotifications());
  };

  const handleClearAll = () => {
    clearAllNotifications();
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'completed') return n.type === 'task_completed';
    return true;
  });

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      const diffMinutes = Math.floor((Date.now() - date.getTime()) / (1000 * 60));
      if (diffMinutes < 1) return 'Baru saja';
      if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours} jam yang lalu`;
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return timeStr;
    }
  };

  const getNotifIcon = (type?: string) => {
    switch (type) {
      case 'task_completed':
        return { icon: 'check_circle', color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30' };
      case 'template_added':
        return { icon: 'description', color: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30' };
      case 'banner':
        return { icon: 'campaign', color: 'text-amber-400 bg-amber-500/20 border-amber-500/30' };
      default:
        return { icon: 'notifications', color: 'text-sky-400 bg-sky-500/20 border-sky-500/30' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn font-['Inter',sans-serif]">
      <div className="bg-[#041226] border border-cyan-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-white">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/30 bg-gradient-to-r from-[#002b4a] to-[#00182b] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 relative">
              <span className="material-symbols-outlined text-xl">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-['Lora',serif] text-base sm:text-lg font-bold text-white">
                Pusat Notifikasi Sistem
              </h3>
              <p className="text-[11px] text-cyan-300 font-mono">
                Pemberitahuan pekerjaan selesai &amp; pembaruan tata naskah
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Filter Bar & Quick Actions */}
        <div className="p-3 bg-slate-950/80 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                filter === 'all'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              Semua ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                filter === 'unread'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              Belum Dibaca ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                filter === 'completed'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              Selesai
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-cyan-300 hover:text-cyan-200 underline cursor-pointer"
              >
                Tandai Dibaca
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer ml-1"
              >
                Hapus Semua
              </button>
            )}
          </div>
        </div>

        {/* Notification Items List */}
        <div className="p-3 space-y-2 overflow-y-auto flex-1 divide-y divide-white/5">
          {filteredNotifs.length > 0 ? (
            filteredNotifs.map((item) => {
              const { icon, color } = getNotifIcon(item.type);
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition flex items-start gap-3 ${
                    item.read
                      ? 'bg-white/5 border-white/10 opacity-80'
                      : 'bg-cyan-950/40 border-cyan-500/40 shadow-md'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 ${color}`}>
                    <span className="material-symbols-outlined text-base">{icon}</span>
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {!item.read && <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0" />}
                        <span>{item.title}</span>
                      </h4>
                      <span className="text-[10px] font-mono text-gray-400 shrink-0">
                        {formatTime(item.timestamp)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">{item.message}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center space-y-2 text-gray-400">
              <span className="material-symbols-outlined text-3xl text-gray-500">notifications_off</span>
              <p className="text-xs">Tidak ada notifikasi pada kategori ini.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-white/10 flex justify-between items-center text-xs shrink-0">
          <span className="text-gray-400 font-mono text-[11px]">SIPATI Auto-Notify Active</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
