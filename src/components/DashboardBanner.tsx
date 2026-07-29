import React, { useState, useEffect, useRef } from 'react';
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Extract up to 5 valid image URLs
  const rawImages = banner?.images && banner.images.length > 0
    ? banner.images
    : banner?.imageUrl
    ? [banner.imageUrl]
    : [];

  const slideImages = rawImages.filter(img => img && img.trim().length > 0).slice(0, 5);

  // Auto-slide effect every 4 seconds
  const slideTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (slideImages.length > 1 && !isHovered) {
      slideTimerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % slideImages.length);
      }, 4000);
    }
    return () => {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    };
  }, [slideImages.length, isHovered]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slideImages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slideImages.length);
  };

  if (!banner || !banner.enabled || isDismissed) {
    if (isAdmin && !isDismissed) {
      return (
        <div className="bg-[#051124] border border-dashed border-cyan-500/30 rounded-2xl p-3 flex items-center justify-between text-xs text-gray-400 font-['Inter',sans-serif]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-400 text-sm">campaign</span>
            <span>Banner Slide Foto saat ini Non-Aktif.</span>
          </div>
          {onOpenEditModal && (
            <button
              onClick={onOpenEditModal}
              className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 hover:bg-[#00a3e0] hover:text-white rounded-lg text-[11px] font-bold transition cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-xs">edit</span>
              <span>Aktifkan &amp; Upload Banner</span>
            </button>
          )}
        </div>
      );
    }
    if (isDismissed) {
      return (
        <div className="flex justify-end font-['Inter',sans-serif] mb-2">
          <button
            onClick={() => setIsDismissed(false)}
            className="px-3 py-1 bg-black/50 hover:bg-black/70 backdrop-blur-md border border-cyan-500/30 text-cyan-300 rounded-full text-[11px] font-semibold flex items-center gap-1.5 transition shadow-md cursor-pointer hover:scale-105"
          >
            <span className="material-symbols-outlined text-sm text-cyan-400">campaign</span>
            <span>Tampilkan Banner Slide Foto</span>
          </button>
        </div>
      );
    }
    return null;
  }

  // If no slide images are set at all, show a styled placeholder with upload prompt for admin
  if (slideImages.length === 0) {
    return (
      <div className="relative w-full h-44 sm:h-56 bg-gradient-to-r from-[#031326] via-[#081e3a] to-[#031326] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl flex flex-col items-center justify-center text-center font-['Inter',sans-serif] text-white overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-sky-400 to-cyan-500 opacity-80"></div>
        <span className="material-symbols-outlined text-4xl text-cyan-400 mb-2 animate-bounce">
          add_photo_alternate
        </span>
        <h3 className="font-['Lora',serif] text-base sm:text-lg font-bold text-white mb-1">
          Belum Ada Foto Banner Utama
        </h3>
        <p className="text-xs text-gray-300 max-w-md mb-4">
          Tambahkan hingga 5 foto banner resmi SIPATI untuk ditampilkan sebagai pergeseran slide otomatis di bagian atas dashboard.
        </p>
        {onOpenEditModal && (
          <button
            onClick={onOpenEditModal}
            className="px-4 py-2 bg-[#00a3e0] hover:bg-[#008bc2] text-white rounded-xl text-xs font-bold transition shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            <span>Atur Foto Banner (Maks. 5 Foto)</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-48 sm:h-64 md:h-72 lg:h-80 rounded-2xl border border-cyan-500/30 shadow-2xl overflow-hidden font-['Inter',sans-serif] bg-[#020b18] group transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Slides Container */}
      <div className="relative w-full h-full overflow-hidden">
        {slideImages.map((imgUrl, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={index}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10 scale-100' : 'opacity-0 z-0 scale-105 pointer-events-none'
              }`}
            >
              {/* Blurred Ambient Background */}
              <div
                className="absolute inset-0 bg-cover bg-center filter blur-xl opacity-40 transform scale-110"
                style={{ backgroundImage: `url(${imgUrl})` }}
              ></div>

              {/* Main Crisp Image */}
              <img
                src={imgUrl}
                alt={`Banner Slide ${index + 1}`}
                className="relative z-10 w-full h-full object-contain sm:object-cover drop-shadow-2xl"
              />
            </div>
          );
        })}
      </div>

      {/* Top Floating Action Bar: Edit & Dismiss Buttons */}
      <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
        {onOpenEditModal && (
          <button
            type="button"
            onClick={onOpenEditModal}
            className="px-3 py-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-cyan-400/40 text-cyan-300 hover:text-white rounded-xl text-xs font-bold transition shadow-lg flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Pengaturan Foto Banner"
          >
            <span className="material-symbols-outlined text-sm text-cyan-400">edit</span>
            <span>Setting Banner</span>
          </button>
        )}

        {banner.dismissible && (
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-gray-300 hover:text-rose-400 rounded-xl transition shadow cursor-pointer"
            title="Sembunyikan Banner"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        )}
      </div>

      {/* Left / Right Arrow Navigation (Visible on hover or mobile) */}
      {slideImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-white backdrop-blur-md transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer shadow-xl"
            title="Slide Sebelumnya"
          >
            <span className="material-symbols-outlined text-lg leading-none">chevron_left</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-white backdrop-blur-md transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-110 cursor-pointer shadow-xl"
            title="Slide Selanjutnya"
          >
            <span className="material-symbols-outlined text-lg leading-none">chevron_right</span>
          </button>
        </>
      )}

      {/* Bottom Navigation Dots & Slide Badge Counter */}
      {slideImages.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 z-30 flex items-center justify-between px-4 pointer-events-none">
          {/* Badge Slide Counter */}
          <div className="px-2.5 py-0.5 bg-black/60 backdrop-blur-md border border-white/20 text-cyan-300 rounded-full font-mono text-[10px] font-bold shadow">
            {currentIndex + 1} / {slideImages.length}
          </div>

          {/* Interactive Slide Dots */}
          <div className="flex items-center gap-1.5 pointer-events-auto bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow">
            {slideImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all rounded-full cursor-pointer ${
                  idx === currentIndex
                    ? 'w-6 h-2 bg-cyan-400 shadow-md shadow-cyan-400/50'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/80'
                }`}
                title={`Ke Slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Pause / Auto-slide Indicator */}
          <div className="hidden sm:flex items-center gap-1 text-[10px] text-gray-300 font-mono bg-black/40 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
            <span className={`w-1.5 h-1.5 rounded-full ${isHovered ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`}></span>
            <span>{isHovered ? 'PAUSED' : 'AUTO'}</span>
          </div>
        </div>
      )}
    </div>
  );
};
