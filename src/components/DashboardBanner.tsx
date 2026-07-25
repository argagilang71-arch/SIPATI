import React, { useState } from 'react';
import { BannerConfig } from '../types';

interface DashboardBannerProps {
  banner: BannerConfig;
  isAdmin?: boolean;
  onOpenEditModal?: () => void;
}

export const DashboardBanner: React.FC<DashboardBannerProps> = ({
  banner,
  isAdmin = false,
  onOpenEditModal,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (!banner || !banner.enabled) {
    // If banner is disabled, but user is Admin, show a subtle placeholder option for Admin
    if (isAdmin) {
      return (
        <div className="bg-black/30 border border-dashed border-white/20 rounded-2xl p-3 flex items-center justify-between text-xs text-gray-400 font-['Inter',sans-serif]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400 text-sm">campaign</span>
            <span>Banner Dashboard saat ini Non-Aktif. (Khusus Admin)</span>
          </div>
          {onOpenEditModal && (
            <button
              onClick={onOpenEditModal}
              className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 hover:bg-[#00a3e0] hover:text-white rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-xs">edit</span>
              <span>Aktifkan Banner</span>
            </button>
          )}
        </div>
      );
    }
    return null;
  }

  if (isDismissed) {
    return (
      <div className="flex justify-end font-['Inter',sans-serif]">
        <button
          onClick={() => setIsDismissed(false)}
          className="px-3 py-1 bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-cyan-300 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition shadow-md cursor-pointer hover:scale-105"
        >
          <span className="material-symbols-outlined text-sm text-cyan-400">campaign</span>
          <span>Tampilkan Pengumuman Banner</span>
        </button>
      </div>
    );
  }

  // Theme styling based on type
  const themeMap = {
    info: {
      border: 'border-cyan-400/40',
      bgGradient: 'from-cyan-950/70 via-slate-900/80 to-sky-950/70',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
      icon: 'campaign',
      iconColor: 'text-cyan-400',
      btnBg: 'bg-[#00a3e0] hover:bg-[#008bc2] text-white',
    },
    success: {
      border: 'border-emerald-400/40',
      bgGradient: 'from-emerald-950/70 via-slate-900/80 to-teal-950/70',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      icon: 'check_circle',
      iconColor: 'text-emerald-400',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    },
    warning: {
      border: 'border-amber-400/40',
      bgGradient: 'from-amber-950/70 via-slate-900/80 to-yellow-950/70',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      icon: 'warning',
      iconColor: 'text-amber-400',
      btnBg: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    urgent: {
      border: 'border-rose-400/40',
      bgGradient: 'from-rose-950/80 via-slate-900/85 to-red-950/80',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
      icon: 'error',
      iconColor: 'text-rose-400',
      btnBg: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
  };

  const currentTheme = themeMap[banner.type || 'info'];

  return (
    <div
      className={`relative bg-gradient-to-r ${currentTheme.bgGradient} backdrop-blur-xl border ${currentTheme.border} rounded-2xl p-5 shadow-2xl overflow-hidden font-['Inter',sans-serif] text-white animate-fadeIn`}
    >
      {/* Decorative Glow Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80"></div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3.5 flex-1">
          {/* Banner Image or Icon */}
          {banner.imageUrl ? (
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-slate-900/90 border border-white/20 overflow-hidden shrink-0 shadow-lg mt-0.5">
              <img
                src={banner.imageUrl}
                alt="Banner Graphic"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className={`w-11 h-11 rounded-xl ${currentTheme.badgeBg} border flex items-center justify-center shrink-0 shadow-md mt-0.5`}>
              <span className={`material-symbols-outlined text-2xl ${currentTheme.iconColor}`}>
                {currentTheme.icon}
              </span>
            </div>
          )}

          {/* Banner Text Content */}
          <div className="space-y-1 pr-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`font-mono text-[10px] font-bold tracking-[0.12em] uppercase px-2.5 py-0.5 rounded-md border ${currentTheme.badgeBg}`}>
                {banner.type === 'urgent' ? '⚠️ PENTING / URGENT' : '📢 PENGUMUMAN OFFICAL'}
              </span>
              {banner.updatedBy && (
                <span className="text-[10px] text-gray-400 font-mono">
                  • Oleh: {banner.updatedBy}
                </span>
              )}
            </div>

            <h3 className="font-['Lora',serif] text-base sm:text-lg font-bold text-white leading-snug">
              {banner.title}
            </h3>

            {banner.message && (
              <p className="text-xs sm:text-[13px] text-gray-200 leading-relaxed font-normal">
                {banner.message}
              </p>
            )}
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10 w-full sm:w-auto justify-end">
          {banner.linkUrl && (
            <a
              href={banner.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md active:scale-95 cursor-pointer ${currentTheme.btnBg}`}
            >
              <span>{banner.linkText || 'Buka Tautan'}</span>
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </a>
          )}

          {/* Admin Edit Quick Button */}
          {isAdmin && onOpenEditModal && (
            <button
              onClick={onOpenEditModal}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1 cursor-pointer shadow-md active:scale-95"
              title="Atur / Ubah Banner Pengumuman Ini (Khusus Admin)"
            >
              <span className="material-symbols-outlined text-sm text-cyan-300">edit</span>
              <span className="hidden md:inline">Setting Banner</span>
            </button>
          )}

          {/* Dismiss Button */}
          {banner.dismissible && (
            <button
              onClick={() => setIsDismissed(true)}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
              title="Tutup banner sementara"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
