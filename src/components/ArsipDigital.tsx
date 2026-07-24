import React, { useState } from 'react';
import { ArchiveItem, ArchiveStatus } from '../types';
import { GoogleDriveManager } from './GoogleDriveManager';

interface ArsipDigitalProps {
  archives: ArchiveItem[];
  onViewArchive: (item: ArchiveItem) => void;
  onDownloadArchive: (item: ArchiveItem) => void;
  onAddArchive: () => void;
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-['Lora',serif] text-[22px] sm:text-[26px] font-bold text-[#57000f] mb-1">
            Arsip Digital Administrasi
          </h2>
          <p className="text-[#574141] font-['Inter',sans-serif] text-[13.5px] max-w-2xl">
            Pusat penyimpanan dokumen final yang telah diverifikasi dan siap untuk pelaporan akhir.
          </p>
        </div>
        <button
          onClick={onAddArchive}
          className="bg-[#b62230] hover:bg-[#57000f] text-white font-['Inter',sans-serif] font-semibold text-[11.5px] uppercase tracking-wider px-4 py-2.5 rounded-lg shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 flex-shrink-0"
        >
          <span className="material-symbols-outlined text-sm">upload_file</span>
          Unggah Arsip Baru
        </button>
      </div>

      {/* Compact Google Drive Status Bar */}
      <GoogleDriveManager compact />

      {/* Filters & Search Bar (Bento-style matching Image 3) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-[14px]">
        {/* Search */}
        <div className="md:col-span-5 bg-[#FFFDF8] border border-[#E4DCC8] rounded-lg p-2 flex items-center shadow-2xs">
          <span className="material-symbols-outlined text-[#574141] ml-2 mr-3 text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama dokumen atau nomor surat..."
            className="bg-transparent border-none focus:outline-none text-[13.5px] text-[#1c1c16] w-full p-1 font-['Inter',sans-serif]"
          />
        </div>

        {/* Filters */}
        <div className="md:col-span-7 flex flex-wrap sm:flex-nowrap gap-[14px]">
          {/* Filter Bidang */}
          <div className="flex-1 bg-[#FFFDF8] border border-[#E4DCC8] rounded-lg p-2 shadow-2xs relative">
            <div className="px-2 py-1">
              <span className="block font-['JetBrains_Mono',monospace] text-[10.5px] font-medium tracking-[0.14em] text-[#574141] mb-0.5 uppercase">
                Filter Bidang
              </span>
              <select
                value={filterBidang}
                onChange={(e) => setFilterBidang(e.target.value)}
                className="w-full bg-transparent border-none font-['Inter',sans-serif] text-[12px] font-semibold text-[#1c1c16] p-0 focus:outline-none"
              >
                <option value="Semua Kategori">Semua Kategori</option>
                <option value="Legalisasi Operasional">Legalisasi Operasional</option>
                <option value="Tata Kelola Rapat">Tata Kelola Rapat</option>
                <option value="Manajemen Korespondensi">Manajemen Korespondensi</option>
                <option value="Logistik">Logistik</option>
                <option value="Keuangan & Audit">Keuangan & Audit</option>
              </select>
            </div>
          </div>

          {/* Filter Periode */}
          <div className="flex-1 bg-[#FFFDF8] border border-[#E4DCC8] rounded-lg p-2 shadow-2xs relative">
            <div className="px-2 py-1">
              <span className="block font-['JetBrains_Mono',monospace] text-[10.5px] font-medium tracking-[0.14em] text-[#574141] mb-0.5 uppercase">
                Filter Periode
              </span>
              <select
                value={filterPeriode}
                onChange={(e) => setFilterPeriode(e.target.value)}
                className="w-full bg-transparent border-none font-['Inter',sans-serif] text-[12px] font-semibold text-[#1c1c16] p-0 focus:outline-none"
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
      <div className="bg-[#FFFDF8] border border-[#E4DCC8] rounded-xl shadow-2xs overflow-hidden">
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3.5 bg-[#f7f3ea] border-b border-[#E4DCC8] font-['JetBrains_Mono',monospace] text-[11px] font-medium tracking-[0.14em] text-[#574141] uppercase">
          <div className="col-span-5">Dokumen & Identitas</div>
          <div className="col-span-3">Kategori & Tanggal</div>
          <div className="col-span-2 text-center">Status Validasi</div>
          <div className="col-span-2 text-right">Tindakan</div>
        </div>

        {/* List Items */}
        <div className="divide-y divide-[#E4DCC8]/60">
          {filteredArchives.length === 0 ? (
            <div className="p-12 text-center text-[#6E6A61] font-['Inter',sans-serif]">
              <span className="material-symbols-outlined text-4xl mb-2 text-[#8b7170]">
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
                  className={`grid grid-cols-1 sm:grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-[#f7f3ea]/50 transition-colors ${
                    isObsolete ? 'opacity-70' : ''
                  }`}
                >
                  {/* Dokumen & Identitas */}
                  <div className="sm:col-span-5 flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded flex items-center justify-center flex-shrink-0 border ${
                        isObsolete
                          ? 'bg-[#dddad1]/30 text-[#7A7568] border-[#E4DCC8]'
                          : 'bg-[#ffb3b3]/20 text-[#57000f] border-[#ffb3b3]/30'
                      }`}
                    >
                      <span className="material-symbols-outlined">
                        {item.fileType === 'pdf'
                          ? 'picture_as_pdf'
                          : item.fileType === 'zip'
                          ? 'folder_zip'
                          : 'description'}
                      </span>
                    </div>
                    <div>
                      <h4
                        className={`font-['Inter',sans-serif] font-semibold text-[13.5px] text-[#1c1c16] mb-0.5 ${
                          isObsolete ? 'line-through decoration-[#E4DCC8]' : ''
                        }`}
                      >
                        {item.title}
                      </h4>
                      <p className="font-['JetBrains_Mono',monospace] text-[11px] text-[#574141]">
                        {item.noSurat}
                      </p>
                    </div>
                  </div>

                  {/* Kategori & Tanggal */}
                  <div className="sm:col-span-3 flex flex-col gap-1 mt-2 sm:mt-0">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#dddad1] text-[#574141] font-['JetBrains_Mono',monospace] text-[10.5px] font-bold w-max">
                      {item.bidang}
                    </span>
                    <span className="text-[12px] text-[#6E6A61] flex items-center gap-1 font-['Inter',sans-serif]">
                      <span className="material-symbols-outlined text-[14px]">
                        event
                      </span>
                      {item.date}
                    </span>
                  </div>

                  {/* Status Validasi (Digital Stamp Effect matching Image 3) */}
                  <div className="sm:col-span-2 flex sm:justify-center mt-2 sm:mt-0">
                    <div
                      className={`px-3 py-1 border-2 border-dashed rounded-md font-['JetBrains_Mono',monospace] text-[10.5px] font-bold tracking-widest stempel-effect ${
                        item.status === 'TERVERIFIKASI'
                          ? 'border-[#2F6B44] text-[#2F6B44] bg-[#2F6B44]/5 rotate-[-2deg]'
                          : item.status === 'FINAL'
                          ? 'border-[#2F6B44] text-[#2F6B44] bg-[#2F6B44]/5 rotate-[1deg]'
                          : 'border-[#7A7568] text-[#7A7568] bg-[#7A7568]/5 rotate-[-3deg]'
                      }`}
                    >
                      {item.status}
                    </div>
                  </div>

                  {/* Tindakan */}
                  <div className="sm:col-span-2 flex sm:justify-end gap-1 mt-3 sm:mt-0">
                    <button
                      onClick={() => onViewArchive(item)}
                      className="p-2 text-[#574141] hover:text-[#57000f] hover:bg-[#ffb3b3]/20 rounded transition-colors cursor-pointer"
                      title="Lihat Dokumen"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        visibility
                      </span>
                    </button>
                    <button
                      onClick={() => onDownloadArchive(item)}
                      className="p-2 text-[#574141] hover:text-[#b62230] hover:bg-[#ffdad8]/30 rounded transition-colors cursor-pointer"
                      title="Unduh"
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        download
                      </span>
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
