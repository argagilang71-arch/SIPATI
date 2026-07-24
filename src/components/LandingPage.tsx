import React, { useState } from 'react';
import sipatiHeroMokaImg from '../assets/images/sipati_moka_hero_1784883832801.jpg';
import garudaEmblemImg from '../assets/images/garuda_pancasila_emblem_1784830236371.jpg';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onOpenLogin,
}) => {
  const mokaHeroImage = sipatiHeroMokaImg;
  const [activeTab, setActiveTab] = useState<'arsip' | 'drive' | 'cetak' | 'keamanan'>('arsip');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      title: 'Administrasi Lebih Cepat, Tata Pemerintahan Makin Lancar',
      subtitle: 'Memperkenalkan SIPATI v2026. Perangkat lunak pengelolaan naskah dinas paling mutakhir untuk kenyamanan dan kemudahan operasional Pemkab Kubu Raya.',
    },
    {
      title: 'Otentikasi Cloud & Google Drive API Realtime',
      subtitle: 'Simpan, verifikasi, dan sinkronkan dokumen resmi langsung ke cloud Google Drive instansi Anda secara otomatis.',
    },
    {
      title: 'Naskah Dinas Word & PDF Utuh Tanpa Corrupt',
      subtitle: 'Format resmi berstandar Microsoft Office dengan KOP Surat, stempel digital, dan keamanan hak akses terproteksi.',
    },
  ];

  const sampleDocs = [
    { no: '012/SIPATI/VIII/2026', title: 'SK Kepanitiaan HUT RI Ke-81 Kab. Kubu Raya', cat: 'Surat Keputusan', drive: true },
    { no: '045/TAPEM/VII/2026', title: 'Naskah Dinas Laporan Evaluasi Tata Pemerintahan', cat: 'Laporan Dinas', drive: true },
    { no: '088/SIPATI/2026', title: 'Draf Nota Kesepahaman Penataan Batas Wilayah', cat: 'Nota Dinas', drive: true },
  ];

  const filteredDocs = sampleDocs.filter(
    (d) =>
      d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#111111] text-[#1c1c16] font-['Inter',sans-serif] selection:bg-[#00a3e0] selection:text-white">
      {/* Top Header Navigation (Moka Style Header) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0f1419]/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3 transition-all">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={onEnterApp}>
            <div className="w-9 h-9 rounded-full bg-white p-1 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <img
                src={garudaEmblemImg}
                alt="Garuda Emblem"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-['Lora',serif] text-[24px] font-extrabold text-white tracking-tight">
                SIPATI
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#00a3e0] text-white hidden md:inline-block tracking-wider">
                KUBU RAYA
              </span>
            </div>
          </div>

          {/* Navigation Items (Moka Style) */}
          <nav className="hidden lg:flex items-center gap-6 text-[13.5px] font-medium text-gray-200">
            <a href="#modul" className="hover:text-[#00a3e0] transition-colors flex items-center gap-1">
              <span>Layanan</span>
              <span className="material-symbols-outlined text-sm opacity-70">expand_more</span>
            </a>
            <a href="#modul" className="hover:text-[#00a3e0] transition-colors">Modul</a>
            <a href="#fitur" className="hover:text-[#00a3e0] transition-colors">Keunggulan</a>
            <a href="#demo" className="hover:text-[#00a3e0] transition-colors">Pencarian</a>
            <a href="#panduan" className="hover:text-[#00a3e0] transition-colors">Panduan</a>
            <a href="#fitur" className="hover:text-[#00a3e0] transition-colors flex items-center gap-1">
              <span>Solusi Bisnis</span>
              <span className="material-symbols-outlined text-sm opacity-70">expand_more</span>
            </a>
          </nav>

          {/* Header Action Buttons (Moka Style Right Bar) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenLogin}
              className="text-white hover:text-[#00a3e0] font-medium text-[13.5px] transition-colors px-2 py-1 cursor-pointer"
            >
              Log in
            </button>

            <button
              type="button"
              onClick={onEnterApp}
              className="bg-[#00a3e0] hover:bg-[#008bc2] text-white font-bold text-[13px] px-5 py-2 rounded-full transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Coba Gratis
            </button>

            <span className="text-xs font-semibold text-gray-300 border border-white/20 px-2 py-1 rounded bg-white/5 hidden sm:inline-block">
              ID
            </span>
          </div>
        </div>
      </header>

      {/* Main Hero Banner Container (Matching Moka POS Photo Banner) */}
      <section className="relative pt-20 sm:pt-24 pb-16 min-h-[580px] sm:min-h-[640px] flex items-center overflow-hidden">
        {/* Full Bleed Background Image with Dark Gradient Mask for Crisp White Typography */}
        <div className="absolute inset-0 z-0">
          <img
            src={mokaHeroImage}
            alt="SIPATI Modern Desk Workspace Banner"
            className="w-full h-full object-cover object-center scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-black/40"></div>
        </div>

        {/* Previous Slider Button */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1))}
          className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-black shadow-lg flex items-center justify-center transition cursor-pointer hover:scale-110 active:scale-95"
          title="Slide Sebelumnya"
        >
          <span className="material-symbols-outlined text-2xl">west</span>
        </button>

        {/* Next Slider Button */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1))}
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-black shadow-lg flex items-center justify-center transition cursor-pointer hover:scale-110 active:scale-95"
          title="Slide Selanjutnya"
        >
          <span className="material-symbols-outlined text-2xl">east</span>
        </button>

        {/* Hero Content Container */}
        <div className="max-w-[1280px] mx-auto px-6 sm:px-12 w-full relative z-10 my-auto">
          <div className="max-w-2xl space-y-6 text-white">
            <h1 className="font-['Lora',serif] text-[36px] sm:text-[50px] leading-[44px] sm:leading-[58px] font-extrabold tracking-tight text-white drop-shadow-md">
              {heroSlides[currentSlide].title}
            </h1>

            <p className="font-['Inter',sans-serif] text-[15px] sm:text-[17px] text-gray-200 leading-relaxed max-w-xl font-normal drop-shadow-sm">
              {heroSlides[currentSlide].subtitle}
            </p>

            {/* Moka Style Action Pill Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <button
                type="button"
                onClick={onEnterApp}
                className="bg-[#00a3e0] hover:bg-[#008bc2] text-white font-bold text-[14px] px-8 py-3.5 rounded-full transition-all shadow-lg hover:shadow-cyan-500/25 cursor-pointer active:scale-95 flex items-center gap-2"
              >
                <span>Jadwalkan Demo</span>
              </button>

              <button
                type="button"
                onClick={onOpenLogin}
                className="bg-white/10 hover:bg-white/20 border border-white/40 text-white font-bold text-[14px] px-8 py-3.5 rounded-full backdrop-blur-md transition-all cursor-pointer active:scale-95 flex items-center gap-2"
              >
                <span>Login Officer Sekarang!</span>
              </button>
            </div>
          </div>
        </div>

        {/* Slide Indicator Dots (Moka Style Pagination) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {heroSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                currentSlide === idx ? 'w-8 bg-[#00a3e0]' : 'w-2.5 bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Moka Style Partner / Unit Kerja Logos Bar */}
      <section className="bg-white border-y border-gray-200 py-6 px-4 sm:px-8">
        <div className="max-w-[1280px] mx-auto flex flex-wrap items-center justify-between gap-6 opacity-80 grayscale hover:grayscale-0 transition-all">
          <div className="flex items-center gap-2 text-gray-800 font-extrabold text-sm tracking-wider uppercase font-['Lora',serif]">
            <span className="material-symbols-outlined text-lg text-[#00a3e0]">verified</span>
            PEMKAB KUBU RAYA
          </div>

          <div className="flex items-center gap-2 text-gray-800 font-extrabold text-sm tracking-wider uppercase font-['Lora',serif]">
            <span className="material-symbols-outlined text-lg text-[#57000f]">account_balance</span>
            SEKRETARIAT DAERAH
          </div>

          <div className="flex items-center gap-2 text-gray-800 font-extrabold text-sm tracking-wider uppercase font-['Lora',serif]">
            <span className="material-symbols-outlined text-lg text-[#b62230]">folder_special</span>
            BAGIAN TATA PEMERINTAHAN
          </div>

          <div className="flex items-center gap-2 text-gray-800 font-extrabold text-sm tracking-wider uppercase font-['Lora',serif]">
            <span className="material-symbols-outlined text-lg text-emerald-600">cloud_done</span>
            GOOGLE DRIVE API
          </div>

          <div className="flex items-center gap-2 text-gray-800 font-extrabold text-sm tracking-wider uppercase font-['Lora',serif]">
            <span className="material-symbols-outlined text-lg text-blue-600">shield</span>
            KOMINFO KUBU RAYA
          </div>
        </div>
      </section>

      {/* Additional Interactive Showcase Sections (Light Background for Contrast) */}
      <div className="bg-[#fcf8ee] text-[#1c1c16]">
        {/* Live Interactive Search Simulation Section */}
        <section className="py-16 px-4 sm:px-[34px] border-b border-[#E4DCC8]" id="demo">
          <div className="max-w-[1200px] mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <span className="px-3 py-1 bg-[#57000f]/10 text-[#57000f] border border-[#57000f]/20 font-bold text-xs rounded-full">
                  Simulasi Pencarian Instan
                </span>
                <h2 className="font-['Lora',serif] text-[24px] sm:text-[28px] font-bold text-[#57000f] mt-2">
                  Coba Pencarian Naskah Dinas Terverifikasi
                </h2>
                <p className="font-['Inter',sans-serif] text-[13.5px] text-[#6E6A61]">
                  Ketik nomor surat atau kata kunci untuk menyaring draf dokumen dan status Google Drive secara langsung.
                </p>
              </div>

              <div className="relative w-full md:w-80">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6A61] text-lg">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Cari kata kunci (cth: SK, HUT RI, Evaluasi)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#E4DCC8] rounded-lg text-xs font-['Inter',sans-serif] text-[#1c1c16] focus:outline-none focus:border-[#57000f] transition shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredDocs.length > 0 ? (
                filteredDocs.map((doc, idx) => (
                  <div
                    key={idx}
                    onClick={onEnterApp}
                    className="bg-white border border-[#E4DCC8] hover:border-[#b62230] p-4 rounded-xl shadow-2xs hover:shadow-xs transition cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold text-[#57000f] bg-[#fdf9f0] px-2 py-0.5 rounded border border-[#E4DCC8]">
                          {doc.no}
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          GDrive Synced
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-[#1c1c16] group-hover:text-[#57000f] transition line-clamp-2">
                        {doc.title}
                      </h4>
                    </div>

                    <div className="pt-3 mt-3 border-t border-[#E4DCC8]/80 flex items-center justify-between text-[11px] text-[#6E6A61]">
                      <span>{doc.cat}</span>
                      <span className="font-bold text-[#b62230] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Buka Draf</span>
                        <span className="material-symbols-outlined text-sm">open_in_new</span>
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 bg-white border border-[#E4DCC8] p-6 text-center rounded-xl text-xs text-[#6E6A61]">
                  Dokumen dengan kata kunci "{searchTerm}" tidak ditemukan di simulasi. Coba kata kunci lain atau masuk ke Dashboard lengkap.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Interactive Module Showcase Section */}
        <section className="py-16 px-4 sm:px-[34px] border-b border-[#E4DCC8]" id="modul">
          <div className="max-w-[1200px] mx-auto space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="font-['Lora',serif] text-[26px] sm:text-[30px] font-bold text-[#57000f]">
                Kemudahan Pengelolaan Naskah Dinas
              </h2>
              <p className="font-['Inter',sans-serif] text-[14px] text-[#6E6A61]">
                Telusuri fitur dan keunggulan utama sistem informasi SIPATI yang dirancang khusus untuk memenuhi standar administrasi pemerintahan daerah.
              </p>
            </div>

            {/* Module Selector Tabs */}
            <div className="flex flex-wrap justify-center gap-2 border-b border-[#E4DCC8] pb-4">
              <button
                onClick={() => setActiveTab('arsip')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'arsip'
                    ? 'bg-[#57000f] text-white shadow-xs'
                    : 'bg-[#FFFDF8] border border-[#E4DCC8] text-[#6E6A61] hover:text-[#57000f]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">folder_managed</span>
                <span>Arsip Digital Terpadu</span>
              </button>

              <button
                onClick={() => setActiveTab('drive')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'drive'
                    ? 'bg-[#57000f] text-white shadow-xs'
                    : 'bg-[#FFFDF8] border border-[#E4DCC8] text-[#6E6A61] hover:text-[#57000f]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">cloud_sync</span>
                <span>Google Drive API Sync</span>
              </button>

              <button
                onClick={() => setActiveTab('cetak')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'cetak'
                    ? 'bg-[#57000f] text-white shadow-xs'
                    : 'bg-[#FFFDF8] border border-[#E4DCC8] text-[#6E6A61] hover:text-[#57000f]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">description</span>
                <span>Cetak Word &amp; PDF Tanpa Corrupt</span>
              </button>

              <button
                onClick={() => setActiveTab('keamanan')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                  activeTab === 'keamanan'
                    ? 'bg-[#57000f] text-white shadow-xs'
                    : 'bg-[#FFFDF8] border border-[#E4DCC8] text-[#6E6A61] hover:text-[#57000f]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">security</span>
                <span>Hak Akses Peran Officer</span>
              </button>
            </div>

            {/* Tab Display Content */}
            <div className="bg-[#FFFDF8] border border-[#E4DCC8] rounded-xl p-6 sm:p-8 shadow-xs">
              {activeTab === 'arsip' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-4">
                    <span className="px-3 py-1 bg-rose-50 text-[#57000f] font-bold text-xs rounded-full border border-rose-200">
                      Modul 01 • Penataan Dokumen
                    </span>
                    <h3 className="font-['Lora',serif] text-xl font-bold text-[#1c1c16]">
                      Manajemen &amp; Pencarian Arsip Naskah Dinas Terverifikasi
                    </h3>
                    <p className="text-xs text-[#6E6A61] leading-relaxed">
                      Arsip digital tersusun secara rapi berdasarkan kategori kegiatan, nomor registrasi surat, dan status verifikasi. Fitur pencarian instan memudahkan staf menemukan dokumen dalam hitungan detik.
                    </p>
                    <ul className="space-y-2 text-xs text-[#1c1c16]">
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                        <span>Klasifikasi bidang kerja dan nomor registrasi otomatis</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                        <span>Stempel digital otomatis untuk berkas terverifikasi</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-[#fcf8ee] border border-[#E4DCC8] p-5 rounded-lg space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between border-b border-[#E4DCC8] pb-2">
                      <span className="font-bold text-[#57000f]">012/SIPATI/VIII/2026</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-sans font-bold">Terverifikasi</span>
                    </div>
                    <p className="text-[11px] text-[#6E6A61]">SK Kepanitiaan &amp; Naskah Dinas HUT RI-81 Kabupaten Kubu Raya</p>
                    <div className="text-[10px] text-[#57000f] font-semibold pt-2 border-t border-[#E4DCC8]">
                      Tersimpan di IndexedDB Local &amp; Google Drive Cloud
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'drive' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-4">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-full border border-emerald-300">
                      Modul 02 • Google Drive Integration
                    </span>
                    <h3 className="font-['Lora',serif] text-xl font-bold text-[#1c1c16]">
                      Otentikasi OAuth &amp; Sinkronisasi Otomatis Google Drive API
                    </h3>
                    <p className="text-xs text-[#6E6A61] leading-relaxed">
                      Setiap dokumen yang diunggah ke SIPATI langsung disinkronkan secara aman ke Google Drive target akun Anda. Sesi OAuth Google dapat dihubungkan dengan sekali klik di menu Pengaturan / Arsip.
                    </p>
                    <ul className="space-y-2 text-xs text-[#1c1c16]">
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                        <span>Sign in Google Popup langsung dari aplikasi SIPATI</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                        <span>Target Folder ID dapat dikustomisasi sesuai unit kerja</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-emerald-50/50 border border-emerald-200 p-5 rounded-lg space-y-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-emerald-700 text-2xl">cloud_done</span>
                      <div>
                        <div className="font-bold text-emerald-950">Status Google Drive API</div>
                        <div className="text-[11px] text-emerald-700">Token OAuth Aktif &amp; Siap Mengunggah</div>
                      </div>
                    </div>
                    <div className="p-2.5 bg-white rounded border border-emerald-200 font-mono text-[10.5px] text-[#57000f]">
                      Folder ID Target: 1A2b3C4d5E6f7G8h9I0j-SIPATI_KubuRaya
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'cetak' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-800 font-bold text-xs rounded-full border border-blue-200">
                      Modul 03 • Format Dokumen Utuh
                    </span>
                    <h3 className="font-['Lora',serif] text-xl font-bold text-[#1c1c16]">
                      Unduh &amp; Ekspor Dokumen Word (.docx) &amp; PDF Tanpa Peringatan Corrupt
                    </h3>
                    <p className="text-xs text-[#6E6A61] leading-relaxed">
                      Generator naskah dinas SIPATI menggunakan struktur HTML Word berstandar Microsoft Office lengkap dengan Byte Order Mark (BOM UTF-8), menjamin dokumen dibuka dengan sempurna di MS Word, WPS Office, maupun Google Docs.
                    </p>
                    <ul className="space-y-2 text-xs text-[#1c1c16]">
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                        <span>KOP Surat Resmi Pemkab Kubu Raya tersusun rapi</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                        <span>Dukungan cetak PDF dengan stempel verifikasi digital</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-[#FFFDF8] border border-[#E4DCC8] p-5 rounded-lg space-y-3 text-xs shadow-xs">
                    <div className="flex items-center justify-between border-b border-[#E4DCC8] pb-2">
                      <span className="font-bold text-[#57000f]">Draf_SK_Kepanitiaan.docx</span>
                      <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">UTF-8 Valid</span>
                    </div>
                    <p className="text-[11px] text-[#6E6A61]">Format asli Microsoft Word dengan tabel meta, nomor registrasi, dan ringkasan catatan dinas.</p>
                  </div>
                </div>
              )}

              {activeTab === 'keamanan' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="space-y-4">
                    <span className="px-3 py-1 bg-amber-50 text-amber-900 font-bold text-xs rounded-full border border-amber-300">
                      Modul 04 • Keamanan Hak Akses
                    </span>
                    <h3 className="font-['Lora',serif] text-xl font-bold text-[#1c1c16]">
                      Proteksi Pengaturan Kredensial &amp; Autentikasi Pengguna
                    </h3>
                    <p className="text-xs text-[#6E6A61] leading-relaxed">
                      Username &amp; Password pengguna divalidasi secara presisi. Fitur pengaturan akun dan manajemen kredensial staf hanya dapat diakses oleh Officer / Administrator untuk menjaga keamanan data organisasi.
                    </p>
                    <ul className="space-y-2 text-xs text-[#1c1c16]">
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                        <span>Validasi Username/NIP &amp; Password yang ketat</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
                        <span>Akses menu Pengaturan dibatasi sesuai peran login</span>
                      </li>
                    </ul>
                  </div>
                  <div className="bg-amber-50/60 border border-amber-200 p-5 rounded-lg space-y-2 text-xs">
                    <div className="font-bold text-amber-950 flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-amber-700">lock</span>
                      Hak Akses Terpisah
                    </div>
                    <div className="text-[11.5px] text-[#574141] leading-relaxed">
                      • <strong>Officer / Administrator:</strong> Penuh akses Pengaturan, Ubah Kredensial, Manajemen Anggota.<br />
                      • <strong>Pengguna Staf / Analis:</strong> Akses Ringkasan, Pekerjaan, Arsip Digital, dan Template.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Main Features Grid */}
        <section className="py-16 px-4 sm:px-[34px] bg-[#fdf9f0] border-t border-[#E4DCC8]" id="fitur">
          <div className="max-w-[1200px] mx-auto space-y-10">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="font-['Lora',serif] text-[24px] sm:text-[28px] font-bold text-[#57000f] mb-2">
                Fitur Layanan Utama SIPATI
              </h2>
              <p className="font-['Inter',sans-serif] text-[14px] text-[#6E6A61]">
                Digitalisasi naskah dinas tanpa menghilangkan esensi keabsahan dan tata naskah pemerintahan.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature Card 1 */}
              <div className="bg-[#FFFDF8] border border-[#E4DCC8] rounded-xl p-7 shadow-2xs hover:bg-[#f7f3ea] transition-all group relative overflow-hidden flex flex-col justify-between">
                <div>
                  <span
                    className="material-symbols-outlined text-[#b62230] text-4xl mb-5 block"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    folder_managed
                  </span>
                  <h3 className="font-['Lora',serif] text-[18px] font-bold text-[#1c1c16] mb-2 border-b border-[#E4DCC8] pb-3">
                    Arsip Digital Terpusat
                  </h3>
                  <p className="font-['Inter',sans-serif] text-[13.5px] text-[#6E6A61] leading-relaxed">
                    Penyimpanan dokumen resmi dan surat keputusan dengan sistem klasifikasi yang aman, berjenjang, dan mudah ditelusuri.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onEnterApp}
                  className="mt-6 text-xs font-bold text-[#57000f] group-hover:text-[#b62230] flex items-center gap-1 transition"
                >
                  <span>Buka Arsip Digital</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              {/* Feature Card 2 */}
              <div className="bg-[#FFFDF8] border border-[#E4DCC8] rounded-xl p-7 shadow-2xs hover:bg-[#f7f3ea] transition-all group relative overflow-hidden flex flex-col justify-between">
                <div>
                  <span
                    className="material-symbols-outlined text-[#b62230] text-4xl mb-5 block"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    cloud_upload
                  </span>
                  <h3 className="font-['Lora',serif] text-[18px] font-bold text-[#1c1c16] mb-2 border-b border-[#E4DCC8] pb-3">
                    Google Drive Auto-Sync
                  </h3>
                  <p className="font-['Inter',sans-serif] text-[13.5px] text-[#6E6A61] leading-relaxed">
                    Unggah berkas naskah dinas dan simpan secara otomatis ke folder Google Drive pribadi atau instansi Anda secara langsung.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onEnterApp}
                  className="mt-6 text-xs font-bold text-[#57000f] group-hover:text-[#b62230] flex items-center gap-1 transition"
                >
                  <span>Atur Google Drive</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              {/* Feature Card 3 */}
              <div className="bg-[#FFFDF8] border border-[#E4DCC8] rounded-xl p-7 shadow-2xs hover:bg-[#f7f3ea] transition-all group relative overflow-hidden flex flex-col justify-between">
                <div>
                  <span
                    className="material-symbols-outlined text-[#b62230] text-4xl mb-5 block"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    monitoring
                  </span>
                  <h3 className="font-['Lora',serif] text-[18px] font-bold text-[#1c1c16] mb-2 border-b border-[#E4DCC8] pb-3">
                    Pemantauan &amp; Laporan
                  </h3>
                  <p className="font-['Inter',sans-serif] text-[13.5px] text-[#6E6A61] leading-relaxed">
                    Lacak status penugasan kegiatan, progress pengerjaan surat, dan serapan anggaran secara realtime di seluruh bidang kerja.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onEnterApp}
                  className="mt-6 text-xs font-bold text-[#57000f] group-hover:text-[#b62230] flex items-center gap-1 transition"
                >
                  <span>Lihat Dashboard</span>
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Panduan Usage Guide Section */}
        <section className="py-16 px-4 sm:px-[34px] bg-[#fcf8ee] border-t border-[#E4DCC8]" id="panduan">
          <div className="max-w-[1200px] mx-auto space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="font-['Lora',serif] text-[26px] sm:text-[30px] font-bold text-[#57000f]">
                Panduan Singkat Penggunaan SIPATI
              </h2>
              <p className="font-['Inter',sans-serif] text-[14px] text-[#6E6A61]">
                Langkah mudah mengoperasikan aplikasi untuk pegawai dan officer Bagian Tata Pemerintahan.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#FFFDF8] border border-[#E4DCC8] p-5 rounded-xl space-y-3 relative">
                <div className="w-8 h-8 rounded-full bg-[#57000f] text-white font-bold text-xs flex items-center justify-center font-mono">
                  01
                </div>
                <h4 className="font-bold text-sm text-[#1c1c16]">Login &amp; Sesi Akses</h4>
                <p className="text-xs text-[#6E6A61] leading-relaxed">
                  Masuk menggunakan Username / NIP dan Password resmi yang terdaftar oleh Officer.
                </p>
              </div>

              <div className="bg-[#FFFDF8] border border-[#E4DCC8] p-5 rounded-xl space-y-3 relative">
                <div className="w-8 h-8 rounded-full bg-[#57000f] text-white font-bold text-xs flex items-center justify-center font-mono">
                  02
                </div>
                <h4 className="font-bold text-sm text-[#1c1c16]">Pilih Modul Pekerjaan</h4>
                <p className="text-xs text-[#6E6A61] leading-relaxed">
                  Buka menu Daftar Pekerjaan untuk mengunggah draf surat, bukti dokumen, atau catatan dinas.
                </p>
              </div>

              <div className="bg-[#FFFDF8] border border-[#E4DCC8] p-5 rounded-xl space-y-3 relative">
                <div className="w-8 h-8 rounded-full bg-[#57000f] text-white font-bold text-xs flex items-center justify-center font-mono">
                  03
                </div>
                <h4 className="font-bold text-sm text-[#1c1c16]">Koneksi Google Drive</h4>
                <p className="text-xs text-[#6E6A61] leading-relaxed">
                  Hubungkan akun Google di menu Arsip / Pengaturan untuk menyinkronkan dokumen ke cloud secara otomatis.
                </p>
              </div>

              <div className="bg-[#FFFDF8] border border-[#E4DCC8] p-5 rounded-xl space-y-3 relative">
                <div className="w-8 h-8 rounded-full bg-[#57000f] text-white font-bold text-xs flex items-center justify-center font-mono">
                  04
                </div>
                <h4 className="font-bold text-sm text-[#1c1c16]">Unduh / Cetak Dokumen</h4>
                <p className="text-xs text-[#6E6A61] leading-relaxed">
                  Unduh berkas hasil dalam format Word (.docx) atau PDF yang terverifikasi dan siap digunakan.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="py-8 bg-[#f1eee5] border-t border-[#E4DCC8] text-center text-[#6E6A61] text-xs font-['JetBrains_Mono',monospace]">
        SISTEM INFORMASI PENGELOLAAN ADMINISTRASI BAGIAN TATA PEMERINTAHAN KUBU RAYA (SIPATI) — VER 2.0.4 © 2026
      </footer>
    </div>
  );
};
