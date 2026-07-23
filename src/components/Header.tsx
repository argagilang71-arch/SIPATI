import React from 'react';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onDownloadReport: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenHelpModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  onDownloadReport,
  searchQuery,
  onSearchChange,
  onOpenHelpModal,
}) => {
  const adminAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuD0R1bby-MAB_3UmPNiN166iM6w8GN8Br7vcCFJTLw_T7QHb0dGgloCH4DrPbR58NA7vg0xGra_ObnphmVVsiXMjjoulq3Cy2Soh0B66LjFvIvUEXKE-jHiqHum5BMMWgIL5NRE-HcQ9dKAJaW3LBrDIAicr0EWyCh2VE7U9ayXTt9EycbZTG3pA-yiBDGCLa34RqH9noeFA24p9s0aphy44bWmlmdJaXy02lMqu38IlS_LnTmD2DHhEOr_D37BoPRkK3Yg9_BY-SQ";

  return (
    <header className="h-16 fixed top-0 right-0 md:left-[250px] left-0 z-20 bg-[#fdf9f0] border-b border-[#E4DCC8] shadow-xs flex justify-between items-center px-4 sm:px-[34px] w-full md:w-[calc(100%-250px)]">
      {/* Left: Mobile Toggle & Brand or Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden text-[#57000f] p-1.5 hover:bg-[#ece8df] rounded-full focus:outline-none cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* Global Search Bar */}
        <div className="hidden sm:flex items-center bg-[#f1eee5] rounded-full px-4 py-1.5 focus-within:ring-2 focus-within:ring-[#ffdad9] border border-transparent focus-within:border-[#E4DCC8] transition-all w-52 md:w-64 lg:w-72">
          <span className="material-symbols-outlined text-[#574141] text-sm mr-2 select-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari arsip atau pekerjaan..."
            className="bg-transparent border-none focus:outline-none text-[13.5px] text-[#1c1c16] w-full p-0 h-6"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="text-xs text-[#6E6A61] hover:text-[#57000f] ml-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="hidden lg:flex items-center gap-4 text-[14px] font-['Inter',sans-serif] font-medium text-[#574141]">
          <button
            onClick={onOpenHelpModal}
            className="hover:text-[#b62230] transition-colors cursor-pointer"
          >
            Bantuan
          </button>
          <button
            onClick={onOpenHelpModal}
            className="hover:text-[#b62230] transition-colors cursor-pointer"
          >
            Panduan
          </button>
        </div>

        <button
          onClick={onDownloadReport}
          className="flex items-center gap-2 text-[#57000f] hover:text-[#b62230] transition-colors font-['Inter',sans-serif] font-semibold text-[11.5px] tracking-wider uppercase bg-[#f1eee5] hover:bg-[#ece8df] px-3.5 py-2 rounded-lg border border-[#E4DCC8] shadow-2xs cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-sm">download</span>
          <span className="hidden sm:inline">Unduh Laporan</span>
        </button>

        <div className="flex items-center gap-1 sm:gap-2 border-l border-[#E4DCC8] pl-3 sm:pl-5">
          <button
            onClick={() => alert('Tidak ada notifikasi baru.')}
            className="text-[#574141] hover:text-[#b62230] p-1.5 rounded-full hover:bg-[#f1eee5] transition-colors cursor-pointer relative"
            title="Notifikasi"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#b62230] rounded-full" />
          </button>
          <button
            onClick={() => alert('Riwayat aktivitas terakhir: 15 Agustus 2026 - Pengesahan SK Panitia HUT RI')}
            className="text-[#574141] hover:text-[#b62230] p-1.5 rounded-full hover:bg-[#f1eee5] transition-colors cursor-pointer"
            title="Riwayat Aktivitas"
          >
            <span className="material-symbols-outlined text-[22px]">history</span>
          </button>

          {/* Profile thumbnail */}
          <div
            className="ml-1 w-8 h-8 rounded-full bg-[#E4DCC8] overflow-hidden border border-[#e6e2d9] cursor-pointer"
            title="Administrator SIPATI"
          >
            <img
              src={adminAvatar}
              alt="Administrator Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
