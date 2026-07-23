import React from 'react';
import kubuRayaDeskImg from '../assets/images/sipati_kubu_raya_desk_1784829853426.jpg';
import garudaEmblemImg from '../assets/images/garuda_pancasila_emblem_1784830236371.jpg';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onOpenLogin,
}) => {
  const deskHeroImage = kubuRayaDeskImg;

  return (
    <div className="dot-grid-bg min-h-screen text-[#1c1c16] font-['Inter',sans-serif]">
      {/* Top Header Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#fdf9f0]/90 backdrop-blur-md border-b border-[#E4DCC8] px-4 sm:px-[34px] py-4">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={garudaEmblemImg}
              alt="Lambang Garuda Pancasila"
              className="w-10 h-10 object-contain rounded-full border border-[#E4DCC8] p-0.5 bg-white shadow-2xs"
            />
            <div>
              <span className="font-['Lora',serif] text-[24px] sm:text-[28px] font-bold text-[#57000f] tracking-tight block leading-none">
                SIPATI
              </span>
              <span className="text-[10px] text-[#6E6A61] font-semibold hidden sm:inline-block">
                Bagian Tata Pemerintahan Kubu Raya
              </span>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <a
              href="#fitur"
              className="font-['Inter',sans-serif] text-[14px] text-[#6E6A61] hover:text-[#57000f] transition-colors font-medium"
            >
              Fitur
            </a>
            <a
              href="#panduan"
              className="font-['Inter',sans-serif] text-[14px] text-[#6E6A61] hover:text-[#57000f] transition-colors font-medium"
            >
              Panduan
            </a>
            <button
              onClick={onOpenLogin}
              className="bg-[#b62230] text-white hover:bg-[#57000f] transition-colors px-5 py-2 rounded font-['Inter',sans-serif] font-semibold text-[11.5px] tracking-wider uppercase shadow-xs cursor-pointer active:scale-95 ml-2"
            >
              Login Officer
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-32 pb-24 px-4 sm:px-[34px]">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16 relative">
          {/* Text Content */}
          <div className="flex-1 z-10">
            <div className="inline-flex items-center gap-2 mb-6 border border-[#E4DCC8] bg-[#FFFDF8] px-3.5 py-1.5 rounded-full shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#b62230] animate-pulse"></span>
              <span className="font-['JetBrains_Mono',monospace] text-[11px] font-medium tracking-[0.14em] text-[#20201D] uppercase">
                Portal Resmi HUT RI 81
              </span>
            </div>
            <h1 className="font-['Lora',serif] text-[36px] sm:text-[42px] leading-[44px] sm:leading-[48px] font-bold text-[#57000f] mb-6">
              Sistem Informasi <br /> Tim Administrasi
            </h1>
            <p className="font-['Inter',sans-serif] text-[15px] sm:text-[16px] text-[#6E6A61] leading-relaxed max-w-xl mb-10 border-l-2 border-[#E4DCC8] pl-4">
              Platform digital terpadu untuk mengelola, mengarsipkan, dan memantau seluruh proses administrasi perayaan Hari Ulang Tahun Republik Indonesia Ke-81 dengan presisi, keamanan, dan integritas tinggi.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onEnterApp}
                className="bg-[#b62230] text-white hover:bg-[#57000f] transition-all px-8 py-3.5 rounded font-['Inter',sans-serif] font-semibold text-[12px] tracking-wider uppercase inline-flex items-center gap-3 group shadow-md cursor-pointer active:scale-95"
              >
                Masuk ke Aplikasi
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </button>
              <button
                onClick={onOpenLogin}
                className="bg-[#FFFDF8] border border-[#E4DCC8] text-[#20201D] hover:bg-[#f1eee5] transition-colors px-6 py-3.5 rounded font-['Inter',sans-serif] font-semibold text-[12px] tracking-wider uppercase inline-flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">lock</span>
                Login Petugas
              </button>
            </div>
          </div>

          {/* Image Content with Stamp */}
          <div className="flex-1 relative w-full aspect-[4/3] rounded-lg border border-[#E4DCC8] bg-[#FFFDF8] shadow-lg p-2">
            {/* Rotated Stempel Stamp */}
            <div className="absolute -top-6 -right-6 z-20 w-32 h-32 border-[3px] border-dashed border-[#b62230] rounded-full flex flex-col items-center justify-center rotate-[15deg] stempel-effect opacity-80 bg-[#fdf9f0]/70 backdrop-blur-xs pointer-events-none">
              <span className="font-['JetBrains_Mono',monospace] text-[10.5px] font-bold text-[#b62230] uppercase tracking-widest text-center leading-tight">
                TERVALIDASI
              </span>
              <span className="font-['JetBrains_Mono',monospace] text-[9px] text-[#b62230] mt-1 font-semibold">
                HUT RI - 81
              </span>
            </div>

            <img
              src={deskHeroImage}
              alt="Meja Kerja Administrasi Bagian Tata Pemerintahan Kubu Raya"
              className="w-full h-full object-cover rounded shadow-xs"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-[34px] bg-[#fdf9f0] border-t border-[#E4DCC8]" id="fitur">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-['Lora',serif] text-[24px] sm:text-[28px] font-bold text-[#57000f] mb-3">
              Layanan Utama Administrasi
            </h2>
            <p className="font-['Inter',sans-serif] text-[14px] text-[#6E6A61] max-w-2xl mx-auto">
              Digitalisasi proses tanpa menghilangkan esensi keabsahan dan tata naskah dinas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature Card 1 */}
            <div className="bg-[#FFFDF8] border border-[#E4DCC8] rounded-lg p-8 shadow-2xs hover:bg-[#f7f3ea] transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#e6e2d9] rounded-bl-full -z-0 group-hover:scale-110 transition-transform"></div>
              <span
                className="material-symbols-outlined text-[#b62230] text-4xl mb-6 relative z-10"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                folder_managed
              </span>
              <h3 className="font-['Lora',serif] text-[17px] font-bold text-[#1c1c16] mb-3 border-b border-[#E4DCC8] pb-3 relative z-10">
                Arsip Digital Terpusat
              </h3>
              <p className="font-['Inter',sans-serif] text-[13.5px] text-[#6E6A61] leading-relaxed relative z-10">
                Penyimpanan dokumen resmi dan surat keputusan dengan sistem klasifikasi yang aman, berjenjang, dan mudah ditelusuri.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-[#FFFDF8] border border-[#E4DCC8] rounded-lg p-8 shadow-2xs hover:bg-[#f7f3ea] transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#e6e2d9] rounded-bl-full -z-0 group-hover:scale-110 transition-transform"></div>
              <span
                className="material-symbols-outlined text-[#b62230] text-4xl mb-6 relative z-10"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                summarize
              </span>
              <h3 className="font-['Lora',serif] text-[17px] font-bold text-[#1c1c16] mb-3 border-b border-[#E4DCC8] pb-3 relative z-10">
                Pelaporan Otomatis
              </h3>
              <p className="font-['Inter',sans-serif] text-[13.5px] text-[#6E6A61] leading-relaxed relative z-10">
                Kompilasi data harian dan pembuatan draf laporan dengan format standar kementerian secara instan, siap dicetak.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-[#FFFDF8] border border-[#E4DCC8] rounded-lg p-8 shadow-2xs hover:bg-[#f7f3ea] transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#e6e2d9] rounded-bl-full -z-0 group-hover:scale-110 transition-transform"></div>
              <span
                className="material-symbols-outlined text-[#b62230] text-4xl mb-6 relative z-10"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                monitoring
              </span>
              <h3 className="font-['Lora',serif] text-[17px] font-bold text-[#1c1c16] mb-3 border-b border-[#E4DCC8] pb-3 relative z-10">
                Pemantauan Real-time
              </h3>
              <p className="font-['Inter',sans-serif] text-[13.5px] text-[#6E6A61] leading-relaxed relative z-10">
                Lacak status penugasan kepanitiaan dan serapan anggaran secara langsung di seluruh satuan kerja operasional.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[#f1eee5] border-t border-[#E4DCC8] text-center text-[#6E6A61] text-xs font-['JetBrains_Mono',monospace]">
        SISTEM INFORMASI PENGELOLAAN ADMINISTRASI BAGIAN TATA PEMERINTAHAN KUBU RAYA (SIPATI) — VER 2.0.4 © 2026
      </footer>
    </div>
  );
};
