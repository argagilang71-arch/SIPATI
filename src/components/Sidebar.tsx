import React from 'react';
import { ViewMode } from '../types';
import { SipatiLogo } from './SipatiLogo';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onOpenProposalModal: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onOpenProposalModal,
  isMobileOpen,
  onCloseMobile,
  onLogout,
}) => {
  // Determine if logged-in user is an Officer / Admin
  const checkIsAdmin = () => {
    try {
      const saved = localStorage.getItem('sipati_current_user');
      if (saved) {
        const u = JSON.parse(saved);
        const role = (u.role || '').toLowerCase();
        const username = (u.username || '').toLowerCase();
        return (
          role.includes('officer') ||
          role.includes('admin') ||
          role.includes('kepala bagian')
        );
      }
    } catch (e) {
      console.error(e);
    }
    return true; // Default fallback
  };

  const isAdmin = checkIsAdmin();

  const allNavItems: { view: ViewMode; label: string; icon: string; adminOnly?: boolean }[] = [
    { view: 'ringkasan', label: 'Ringkasan', icon: 'dashboard' },
    { view: 'pekerjaan', label: 'Daftar Pekerjaan', icon: 'assignment' },
    { view: 'template', label: 'Template Surat', icon: 'description' },
    { view: 'arsip', label: 'Arsip', icon: 'archive' },
    { view: 'appscript', label: 'Google Apps Script', icon: 'terminal', adminOnly: true },
  ];

  const navItems = allNavItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-[250px] bg-black/60 backdrop-blur-xl text-white border-r border-white/15 flex flex-col py-[28px] px-[14px] z-40 transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Logo & Title */}
        <div className="mb-6 px-3 flex items-center gap-3">
          <SipatiLogo size={42} className="drop-shadow-md" />
          <div>
            <h1 className="font-['Lora',serif] text-[26px] font-bold tracking-tight text-white leading-tight">
              SIPATI
            </h1>
            <p className="text-[10px] text-gray-300 leading-tight font-['Inter',sans-serif]">
              Tata Pemerintahan Kubu Raya
            </p>
          </div>
        </div>

        {/* Primary CTA: Buat Pekerjaan */}
        <div className="mb-6">
          <button
            onClick={() => {
              onOpenProposalModal();
              onCloseMobile();
            }}
            className="w-full bg-[#00a3e0] hover:bg-[#008bc2] text-white font-['Inter',sans-serif] font-bold text-[11.5px] tracking-wider uppercase py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25 cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-sm font-bold">add</span>
            Buat Pekerjaan
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1.5 flex-grow">
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => {
                  onNavigate(item.view);
                  onCloseMobile();
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 font-['Inter',sans-serif] text-[13.5px] cursor-pointer ${
                  isActive
                    ? 'bg-[#00a3e0] text-white font-bold shadow-md scale-[0.98]'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Links */}
        <div className="mt-auto pt-4 border-t border-white/15 flex flex-col gap-1">
          <button
            onClick={() => {
              onNavigate('pengaturan');
              onCloseMobile();
            }}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-colors font-['Inter',sans-serif] text-[13px] ${
              currentView === 'pengaturan'
                ? 'bg-white/20 text-white font-semibold'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="material-symbols-outlined text-sm">settings</span>
            <span>Pengaturan</span>
          </button>
          <button
            onClick={() => {
              if (onLogout) {
                onLogout();
              } else {
                onNavigate('landing');
              }
              onCloseMobile();
            }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-gray-300 hover:text-rose-300 hover:bg-rose-950/40 transition-colors font-['Inter',sans-serif] text-[13px] cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
};
