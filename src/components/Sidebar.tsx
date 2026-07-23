import React from 'react';
import { ViewMode } from '../types';

import garudaEmblemImg from '../assets/images/garuda_pancasila_emblem_1784830236371.jpg';

interface SidebarProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  onOpenProposalModal: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onOpenProposalModal,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navItems: { view: ViewMode; label: string; icon: string }[] = [
    { view: 'ringkasan', label: 'Ringkasan', icon: 'dashboard' },
    { view: 'pekerjaan', label: 'Daftar Pekerjaan', icon: 'assignment' },
    { view: 'template', label: 'Template Surat', icon: 'description' },
    { view: 'arsip', label: 'Arsip', icon: 'archive' },
    { view: 'appscript', label: 'Google Apps Script', icon: 'terminal' },
  ];

  const garudaEmblem = "https://lh3.googleusercontent.com/aida-public/AB6AXuBdTKxvMfIbUgLDAUlIAtX4XNv4pCemgtqolj_rzsmneefEjyDJjkpBCmbyjZLVDyOy9_8rYN3fGJsRm64jAnIwtL5nZcMVBwLc9lITcY_BNRCUrXkz4ZbajUrexQtrTyI9wKZGR79t8Gueh5fAgv05nIJYZf_TLiJLXKeBfAmIF3otwuvopCOyoDtdZQFpei4nsmiCGLMyV-_J1EgNjGFRf_7xkSZeptL20DQa_ekk4MZPc3WtfaFXxDagIfZ8YvKUTFyHNAhkyHg";

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
        className={`fixed left-0 top-0 h-screen w-[250px] bg-[#57000f] text-white border-r border-[#E4DCC8] flex flex-col py-[28px] px-[14px] z-40 transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Logo & Title */}
        <div className="mb-6 px-3 flex items-center gap-3">
          <img
            src={garudaEmblemImg}
            alt="Lambang Garuda Pancasila"
            className="w-10 h-10 object-contain bg-[#FFFDF8] rounded-full p-1 border border-[#E4DCC8] shadow-xs"
          />
          <div>
            <h1 className="font-['Lora',serif] text-[26px] font-bold tracking-tight text-[#FFFDF8] leading-tight">
              SIPATI
            </h1>
            <p className="text-[10px] text-[#FFFDF8] opacity-75 leading-tight font-['Inter',sans-serif]">
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
            className="w-full bg-[#ff595e] hover:bg-[#ff595e]/90 text-[#60000e] font-['Inter',sans-serif] font-semibold text-[11.5px] tracking-wider uppercase py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 shadow-sm cursor-pointer active:scale-95"
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
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 font-['Inter',sans-serif] text-[13.5px] cursor-pointer ${
                  isActive
                    ? 'bg-[#ff595e] text-[#60000e] font-bold shadow-sm scale-[0.98]'
                    : 'text-white/80 hover:text-white hover:bg-[#7a1220]'
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
        <div className="mt-auto pt-4 border-t border-[#7a1220] flex flex-col gap-1">
          <button
            onClick={() => {
              onNavigate('pengaturan');
              onCloseMobile();
            }}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-colors font-['Inter',sans-serif] text-[13px] ${
              currentView === 'pengaturan'
                ? 'bg-[#7a1220] text-white font-semibold'
                : 'text-white/80 hover:text-white hover:bg-[#7a1220]'
            }`}
          >
            <span className="material-symbols-outlined text-sm">settings</span>
            <span>Pengaturan</span>
          </button>
          <button
            onClick={() => {
              onNavigate('landing');
              onCloseMobile();
            }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-left text-white/80 hover:text-white hover:bg-[#7a1220] transition-colors font-['Inter',sans-serif] text-[13px]"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
};
