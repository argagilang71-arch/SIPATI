import React, { useState, useRef } from 'react';
import { ArchiveItem, ArchiveStatus } from '../types';
import { GoogleDriveManager } from './GoogleDriveManager';
import { registerUploadedFile } from '../utils/fileStorage';

interface ArsipDigitalProps {
  archives: ArchiveItem[];
  onViewArchive: (item: ArchiveItem) => void;
  onDownloadArchive: (item: ArchiveItem) => void;
  onAddArchive: (file?: File) => void;
}

export const ArsipDigital: React.FC<ArsipDigitalProps> = ({
  archives,
  onViewArchive,
  onDownloadArchive,
  onAddArchive,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBidang, setFilterBidang] = useState('Semua Kategori');
  const [filterPeriode, setFilterPeriode] = useState('Semua Periode');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseBidangOptions = [
    'Legalisasi Operasional',
    'Tata Kelola Rapat',
    'Manajemen Korespondensi',
  ];

  const archiveBidangOptions = Array.from(
    new Set([...baseBidangOptions, ...archives.map((a) => a.bidang).filter(Boolean)])
  );

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      (Array.from(files) as File[]).forEach((file) => {
        registerUploadedFile(file);
        onAddArchive(file);
      });
      e.target.value = '';
    }
  };

  const filteredArchives = archives.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.noSurat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesBidang =
      filterBidang === 'Semua Kategori' || item.bidang === filterBidang;

    const matchesPeriode =
      filterPeriode === 'Semua Periode' || item.date.includes(filterPeriode);

    return matchesSearch && matchesBidang && matchesPeriode;
  });

  return (
    <div className="space-y-6 text-white">
      {/* Page Header */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Lora',serif] text-[22px] sm:text-[26px] font-bold text-white mb-1">
            Arsip Digital Administrasi
          </h2>
          <p className="text-gray-300 font-['Inter',sans-serif] text-[13.5px] max-w-2xl">
            Pusat penyimpanan dokumen final yang telah diverifikasi dan siap untuk pelaporan akhir.
          </p>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={handleUploadClick}
          className="bg-[#00a3e0] hover:bg-[#008bc2] text-white font-['Inter',sans-serif] font-bold text-[11.5px] uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-lg hover:shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 flex-shrink-0"
        >
          <span className="material-symbols-outlined text-sm font-bold">upload_file</span>
          Unggah Arsip Baru
        </button>
      </div>

      {/* Compact Google Drive Status Bar */}
      <GoogleDriveManager compact />

      {/* Filters & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-[14px]">
        {/* Search */}
        <div className="md:col-span-5 bg-black/45 backdrop-blur-xl border border-white/20 rounded-xl p-2 flex items-center shadow-lg">
          <span className="material-symbols-outlined text-gray-300 ml-2 mr-3 text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama dokumen atau nomor surat..."
            className="bg-transparent border-none focus:outline-none text-[13.5px] text-white placeholder-gray-400 w-full p-1 font-['Inter',sans-serif]"
          />
        </div>

        {/* Filters */}
        <div className="md:col-span-7 flex flex-wrap sm:flex-nowrap gap-[14px]">
          {/* Filter Bidang */}
          <div className="flex-1 bg-black/45 backdrop-blur-xl border border-white/20 rounded-xl p-2 shadow-lg relative">
            <div className="px-2 py-1">
              <span className="block font-['JetBrains_Mono',monospace] text-[10.5px] font-medium tracking-[0.14em] text-cyan-300 mb-0.5 uppercase">
                Filter Bidang
              </span>
              <select
                value={filterBidang}
                onChange={(e) => setFilterBidang(e.target.value)}
                className="w-full bg-slate-900 border-none font-['Inter',sans-serif] text-[12px] font-semibold text-white p-1 rounded-md focus:outline-none cursor-pointer"
              >
                <option value="Semua Kategori">Semua Kategori</option>
                {archiveBidangOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Periode */}
          <div className="flex-1 bg-black/45 backdrop-blur-xl border border-white/20 rounded-xl p-2 shadow-lg relative">
            <div className="px-2 py-1">
              <span className="block font-['JetBrains_Mono',monospace] text-[10.5px] font-medium tracking-[0.14em] text-cyan-300 mb-0.5 uppercase">
                Filter Periode
              </span>
              <select
                value={filterPeriode}
                onChange={(e) => setFilterPeriode(e.target.value)}
                className="w-full bg-slate-900 border-none font-['Inter',sans-serif] text-[12px] font-semibold text-white p-1 rounded-md focus:outline-none cursor-pointer"
              >
                <option value="Semua Periode">Semua Periode</option>
                <option value="Agustus 2026">Agustus 2026</option>
                <option value="Juli 2026">Juli 2026</option>
                <option value="Juni 2026">Juni 2026</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Archive List inside Card Table */}
      <div className="bg-black/45 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl overflow-hidden">
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3.5 bg-white/10 border-b border-white/15 font-['JetBrains_Mono',monospace] text-[11px] font-medium tracking-[0.14em] text-gray-300 uppercase">
          <div className="col-span-5">Dokumen & Identitas</div>
          <div className="col-span-3">Kategori & Tanggal</div>
          <div className="col-span-2 text-center">Status Validasi</div>
          <div className="col-span-2 text-right">Tindakan</div>
        </div>

        {/* List Items */}
        <div className="divide-y divide-white/10">
          {filteredArchives.length === 0 ? (
            <div className="p-12 text-center text-gray-300 font-['Inter',sans-serif]">
              <span className="material-symbols-outlined text-4xl mb-2 text-gray-400">
                folder_off
              </span>
              <p className="text-sm">Tidak ada arsip yang sesuai dengan kriteria pencarian.</p>
            </div>
          ) : (
            filteredArchives.map((item) => {
              const isObsolete = item.status === 'DIUSANGKAN';

              return (
                <div
                  key={item.id}
                  className={`grid grid-cols-1 sm:grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-white/10 transition-colors ${
                    isObsolete ? 'opacity-60' : ''
                  }`}
                >
                  {/* Dokumen & Identitas */}
                  <div className="sm:col-span-5 flex items-start gap-3.5">
                    <button
                      type="button"
                      onClick={() => onViewArchive(item)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-transform cursor-pointer hover:scale-105 active:scale-95 ${
                        isObsolete
                          ? 'bg-white/10 text-gray-400 border-white/20'
                          : 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 hover:border-cyan-300'
                      }`}
                      title="Klik untuk Pratinjau Dokumen Asli"
                    >
                      <span className="material-symbols-outlined text-xl">
                        {item.fileType === 'pdf'
                          ? 'picture_as_pdf'
                          : item.fileType === 'zip'
                          ? 'folder_zip'
                          : 'description'}
                      </span>
                    </button>
                    <div className="min-w-0 flex-1">
                      <h4
                        onClick={() => onViewArchive(item)}
                        className={`font-['Inter',sans-serif] font-semibold text-[13.5px] text-white hover:text-cyan-300 cursor-pointer transition-colors mb-0.5 truncate ${
                          isObsolete ? 'line-through decoration-white/40' : ''
                        }`}
                        title={`Pratinjau Dokumen Asli: ${item.title}`}
                      >
                        {item.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-['JetBrains_Mono',monospace] text-[11px] text-cyan-300 font-medium">
                          {item.noSurat}
                        </span>
                        {item.fileName && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded-md truncate max-w-[220px]">
                            <span className="material-symbols-outlined text-[12px] text-emerald-400">attach_file</span>
                            <span>{item.fileName}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Kategori & Tanggal */}
                  <div className="sm:col-span-3 flex flex-col gap-1 mt-2 sm:mt-0">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-gray-200 font-['JetBrains_Mono',monospace] text-[10.5px] font-bold w-max">
                      {item.bidang}
                    </span>
                    <span className="text-[12px] text-gray-300 flex items-center gap-1 font-['Inter',sans-serif]">
                      <span className="material-symbols-outlined text-[14px] text-gray-400">
                        event
                      </span>
                      {item.date}
                    </span>
                  </div>

                  {/* Status Validasi */}
                  <div className="sm:col-span-2 flex sm:justify-center mt-2 sm:mt-0">
                    <div
                      className={`px-3 py-1 border-2 border-dashed rounded-md font-['JetBrains_Mono',monospace] text-[10.5px] font-bold tracking-widest stempel-effect ${
                        item.status === 'TERVERIFIKASI'
                          ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10 rotate-[-2deg]'
                          : item.status === 'FINAL'
                          ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10 rotate-[1deg]'
                          : 'border-gray-400 text-gray-300 bg-white/5 rotate-[-3deg]'
                      }`}
                    >
                      {item.status}
                    </div>
                  </div>

                  {/* Tindakan */}
                  <div className="sm:col-span-2 flex sm:justify-end items-center gap-1.5 mt-3 sm:mt-0">
                    <button
                      type="button"
                      onClick={() => onViewArchive(item)}
                      className="px-2.5 py-1.5 bg-[#003b5c] hover:bg-[#005f8e] text-cyan-200 hover:text-white border border-cyan-400/40 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
                      title="Pratinjau Dokumen Asli"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        visibility
                      </span>
                      <span className="hidden xl:inline">Pratinjau</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDownloadArchive(item)}
                      className="px-2.5 py-1.5 bg-emerald-700/80 hover:bg-emerald-600 text-emerald-100 hover:text-white border border-emerald-400/40 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
                      title="Unduh File Original"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        download
                      </span>
                      <span className="hidden xl:inline">Unduh</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
