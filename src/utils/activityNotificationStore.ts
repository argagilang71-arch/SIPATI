import { NotificationItem, ActivityLogItem } from '../types';

const NOTIFS_STORAGE_KEY = 'sipati_notifications';
const LOGS_STORAGE_KEY = 'sipati_activity_logs';

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Pekerjaan Selesai',
    message: 'Dokumen "Surat Edaran Menyemarakkan HUT RI" telah selesai dan terverifikasi di Arsip Digital.',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 mins ago
    read: false,
    type: 'task_completed',
  },
  {
    id: 'notif-2',
    title: 'Template Baru Ditambahkan',
    message: 'Template "Naskah Undangan Rapat Lintas Sektor" ditambahkan oleh Gilang Arga.',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    read: false,
    type: 'template_added',
  },
  {
    id: 'notif-3',
    title: 'Pengumuman Banner Diperbarui',
    message: 'Banner Informasi Panitia HUT RI Ke-81 telah diterbitkan untuk dashboard executive.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    read: true,
    type: 'banner',
  },
];

export const INITIAL_ACTIVITY_LOGS: ActivityLogItem[] = [
  {
    id: 'log-1',
    user: 'Gilang arga',
    role: 'Officer / Administrator',
    action: 'Menyelesaikan Pekerjaan',
    target: 'Surat Edaran Menyemarakkan HUT RI',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    type: 'complete',
  },
  {
    id: 'log-2',
    user: 'Asep Suhendar, S.STP',
    role: 'Analis Kebijakan',
    action: 'Memperbarui Draf Naskah',
    target: 'SK Panitia Peringatan HUT RI Ke-81',
    timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    type: 'edit',
  },
  {
    id: 'log-3',
    user: 'Drs. H. Mulyadi, M.Si',
    role: 'Officer / Administrator',
    action: 'Menambahkan Template Surat',
    target: 'Naskah Undangan Rapat Lintas Sektor',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    type: 'create',
  },
  {
    id: 'log-4',
    user: 'Gilang arga',
    role: 'Officer / Administrator',
    action: 'Memperbarui Banner Slide',
    target: 'Banner Informasi Utama Dashboard',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    type: 'system',
  },
];

export function getStoredNotifications(): NotificationItem[] {
  try {
    const saved = localStorage.getItem(NOTIFS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  return INITIAL_NOTIFICATIONS;
}

export function saveNotifications(notifs: NotificationItem[]) {
  try {
    localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(notifs));
    window.dispatchEvent(new CustomEvent('sipati_notifications_updated', { detail: notifs }));
  } catch (e) {
    console.error(e);
  }
}

export function addNotification(title: string, message: string, type: NotificationItem['type'] = 'info', targetId?: string) {
  const notifs = getStoredNotifications();
  const newNotif: NotificationItem = {
    id: `notif-${Date.now()}`,
    title,
    message,
    timestamp: new Date().toISOString(),
    read: false,
    type,
    targetId,
  };
  const updated = [newNotif, ...notifs].slice(0, 50); // keep last 50
  saveNotifications(updated);
  return newNotif;
}

export function markAllNotificationsRead() {
  const notifs = getStoredNotifications();
  const updated = notifs.map(n => ({ ...n, read: true }));
  saveNotifications(updated);
}

export function clearAllNotifications() {
  saveNotifications([]);
}

export function getStoredActivityLogs(): ActivityLogItem[] {
  try {
    const saved = localStorage.getItem(LOGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  return INITIAL_ACTIVITY_LOGS;
}

export function saveActivityLogs(logs: ActivityLogItem[]) {
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
    window.dispatchEvent(new CustomEvent('sipati_activity_logs_updated', { detail: logs }));
  } catch (e) {
    console.error(e);
  }
}

export function addActivityLog(
  action: string,
  target: string,
  type: ActivityLogItem['type'] = 'edit',
  userNameOverride?: string,
  userRoleOverride?: string
) {
  let userName = userNameOverride || 'Pengguna SIPATI';
  let userRole = userRoleOverride || 'Analis Kebijakan';

  try {
    const uStr = localStorage.getItem('sipati_current_user');
    if (uStr) {
      const u = JSON.parse(uStr);
      if (u.nama) userName = u.nama;
      if (u.role) userRole = u.role;
    }
  } catch (e) {
    // fallback
  }

  const logs = getStoredActivityLogs();
  const newLog: ActivityLogItem = {
    id: `log-${Date.now()}`,
    user: userName,
    role: userRole,
    action,
    target,
    timestamp: new Date().toISOString(),
    type,
  };

  const updated = [newLog, ...logs].slice(0, 100); // keep last 100 logs
  saveActivityLogs(updated);
  return newLog;
}

export function clearAllActivityLogs() {
  saveActivityLogs([]);
}
