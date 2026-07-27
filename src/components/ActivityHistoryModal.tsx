import React, { useState, useEffect } from 'react';
import { ActivityLogItem } from '../types';
import {
  getStoredActivityLogs,
  clearAllActivityLogs,
} from '../utils/activityNotificationStore';

interface ActivityHistoryModalProps {
  onClose: () => void;
}

export const ActivityHistoryModal: React.FC<ActivityHistoryModalProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<ActivityLogItem[]>(getStoredActivityLogs());
  const [filter, setFilter] = useState<'all' | 'complete' | 'create' | 'delete'>('all');

  useEffect(() => {
    const handleUpdate = () => {
      setLogs(getStoredActivityLogs());
    };
    window.addEventListener('sipati_activity_logs_updated', handleUpdate);
    return () => window.removeEventListener('sipati_activity_logs_updated', handleUpdate);
  }, []);

  const handleClear = () => {
    clearAllActivityLogs();
    setLogs([]);
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === 'complete') return log.type === 'complete';
    if (filter === 'create') return log.type === 'create' || log.type === 'edit';
    if (filter === 'delete') return log.type === 'delete';
    return true;
  });

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return timeStr;
    }
  };

  const getTypeStyle = (type?: string) => {
    switch (type) {
      case 'complete':
        return { label: 'SELESAI', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: 'check_circle' };
      case 'create':
        return { label: 'TAMBAH', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', icon: 'add_circle' };
      case 'edit':
        return { label: 'UBAH', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: 'edit' };
      case 'delete':
        return { label: 'HAPUS', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40', icon: 'delete' };
      default:
        return { label: 'SYSTEM', badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40', icon: 'info' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn font-['Inter',sans-serif]">
      <div className="bg-[#031326] border border-cyan-500/40 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-white">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/30 bg-gradient-to-r from-[#002845] via-[#003b5c] to-[#001f35] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shrink-0">
              <span className="material-symbols-outlined text-2xl">history</span>
            </div>
            <div>
              <h3 className="font-['Lora',serif] text-base sm:text-lg font-bold text-white">
                Riwayat Aktivitas Sistem
              </h3>
              <p className="text-[11px] text-cyan-300 font-mono">
                Jejak audit operasional panitia &amp; log pembaruan naskah
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

        {/* Filter Bar */}
        <div className="p-3 bg-slate-950/80 border-b border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                filter === 'all'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              Semua ({logs.length})
            </button>
            <button
              onClick={() => setFilter('complete')}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                filter === 'complete'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              Pekerjaan Selesai
            </button>
            <button
              onClick={() => setFilter('create')}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                filter === 'create'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              Tambah / Ubah
            </button>
            <button
              onClick={() => setFilter('delete')}
              className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                filter === 'delete'
                  ? 'bg-rose-500 text-slate-950 font-bold'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              Hapus
            </button>
          </div>

          {logs.length > 0 && (
            <button
              onClick={handleClear}
              className="text-[11px] text-rose-400 hover:text-rose-300 underline cursor-pointer"
            >
              Bersihkan Log
            </button>
          )}
        </div>

        {/* Logs List */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((item) => {
              const style = getTypeStyle(item.type);
              return (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-900/80 rounded-xl border border-white/10 hover:border-cyan-500/40 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold flex items-center gap-1 ${style.badge}`}>
                        <span className="material-symbols-outlined text-[12px]">{style.icon}</span>
                        {style.label}
                      </span>
                      <span className="font-bold text-white text-sm">{item.action}</span>
                    </div>

                    <p className="text-gray-300 text-xs">
                      Target: <span className="text-cyan-300 font-semibold">{item.target}</span>
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-gray-400 font-mono">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-cyan-400">person</span>
                        {item.user} ({item.role || 'Panitia'})
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-gray-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 shrink-0">
                    {formatTime(item.timestamp)}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-gray-400 space-y-2">
              <span className="material-symbols-outlined text-4xl text-gray-500">history_toggle_off</span>
              <p className="text-xs">Belum ada entri log aktivitas pada filter ini.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950 border-t border-white/10 flex justify-between items-center text-xs shrink-0">
          <span className="text-gray-400 font-mono text-[11px]">SIPATI Audit Trail Active</span>
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
