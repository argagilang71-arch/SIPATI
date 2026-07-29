import React, { useState, useEffect } from 'react';
import { getStoredNotifications } from '../utils/activityNotificationStore';
import { getPersistentCustomPhoto } from '../utils/userUtils';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onDownloadReport: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenHelpModal: () => void;
  onOpenNotifications?: () => void;
  onOpenActivityHistory?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  onDownloadReport,
  searchQuery,
  onSearchChange,
  onOpenHelpModal,
  onOpenNotifications,
  onOpenActivityHistory,
}) => {
  const defaultAdminAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuD0R1bby-MAB_3UmPNiN166iM6w8GN8Br7vcCFJTLw_T7QHb0dGgloCH4DrPbR58NA7vg0xGra_ObnphmVVsiXMjjoulq3Cy2Soh0B66LjFvIvUEXKE-jHiqHum5BMMWgIL5NRE-HcQ9dKAJaW3LBrDIAicr0EWyCh2VE7U9ayXTt9EycbZTG3pA-yiBDGCLa34RqH9noeFA24p9s0aphy44bWmlmdJaXy02lMqu38IlS_LnTmD2DHhEOr_D37BoPRkK3Yg9_BY-SQ";

  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('sipati_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [unreadCount, setUnreadCount] = useState<number>(() => {
    return getStoredNotifications().filter((n) => !n.read).length;
  });

  useEffect(() => {
    const handleUserUpdated = () => {
      try {
        const saved = localStorage.getItem('sipati_current_user');
        if (saved) setCurrentUser(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    };

    const handleNotifUpdated = () => {
      setUnreadCount(getStoredNotifications().filter((n) => !n.read).length);
    };

    window.addEventListener('sipati_user_updated', handleUserUpdated);
    window.addEventListener('sipati_notifications_updated', handleNotifUpdated);
    return () => {
      window.removeEventListener('sipati_user_updated', handleUserUpdated);
      window.removeEventListener('sipati_notifications_updated', handleNotifUpdated);
    };
  }, []);

  const persistentPhoto = getPersistentCustomPhoto([currentUser?.username, currentUser?.nip, currentUser?.id]);
  const userAvatar = persistentPhoto || currentUser?.foto || currentUser?.avatar || currentUser?.photo || defaultAdminAvatar;

  return (
    <header className="h-16 fixed top-0 right-0 md:left-[250px] left-0 z-20 bg-black/40 backdrop-blur-md border-b border-white/15 text-white flex justify-between items-center px-4 sm:px-[34px] w-full md:w-[calc(100%-250px)]">
      {/* Left: Mobile Toggle & Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden text-white p-1.5 hover:bg-white/10 rounded-full focus:outline-none cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* Global Search Bar */}
        <div className="hidden sm:flex items-center bg-white/10 border border-white/20 rounded-full px-4 py-1.5 focus-within:ring-2 focus-within:ring-[#00a3e0] focus-within:border-transparent transition-all w-52 md:w-64 lg:w-72">
          <span className="material-symbols-outlined text-gray-300 text-sm mr-2 select-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari arsip atau pekerjaan..."
            className="bg-transparent border-none focus:outline-none text-[13.5px] text-white placeholder-gray-400 w-full p-0 h-6"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="text-xs text-gray-300 hover:text-white ml-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="hidden lg:flex items-center gap-4 text-[14px] font-['Inter',sans-serif] font-medium text-gray-200">
          <button
            onClick={onOpenHelpModal}
            className="hover:text-cyan-300 transition-colors cursor-pointer"
          >
            Bantuan
          </button>
          <button
            onClick={onOpenHelpModal}
            className="hover:text-cyan-300 transition-colors cursor-pointer"
          >
            Panduan
          </button>
        </div>

        <button
          onClick={onDownloadReport}
          className="flex items-center gap-2 text-white hover:text-cyan-200 transition-colors font-['Inter',sans-serif] font-semibold text-[11.5px] tracking-wider uppercase bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl border border-white/20 shadow-md cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-sm">download</span>
          <span className="hidden sm:inline">Unduh Laporan</span>
        </button>

        <div className="flex items-center gap-1 sm:gap-2 border-l border-white/15 pl-3 sm:pl-5">
          <button
            onClick={onOpenNotifications}
            className="text-gray-200 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer relative"
            title="Pusat Notifikasi"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white font-bold text-[9px] rounded-full flex items-center justify-center border border-black/40 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={onOpenActivityHistory}
            className="text-gray-200 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            title="Riwayat Aktivitas"
          >
            <span className="material-symbols-outlined text-[22px]">history</span>
          </button>

          {/* Current User Info & Profile thumbnail */}
          <div className="flex items-center gap-2.5 ml-1">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-[12px] font-bold text-white truncate max-w-[150px]">
                {currentUser?.nama || 'Gilang Ariesta Arga, S.IP'}
              </span>
              <span className="text-[10px] text-cyan-300 font-medium">
                {currentUser?.role || currentUser?.jabatan || 'Kepala Bagian Tata Pemerintahan'}
              </span>
            </div>
            <div
              className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden border border-white/30 cursor-pointer shrink-0 shadow-sm"
              title={currentUser?.nama || 'Pengguna SIPATI'}
            >
              <img
                src={userAvatar}
                alt="User Profile Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
