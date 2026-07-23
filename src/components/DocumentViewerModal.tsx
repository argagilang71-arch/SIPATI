import React from 'react';
import { ArchiveItem } from '../types';
import { openInGoogleDrive } from '../utils/fileStorage';

interface DocumentViewerModalProps {
  item: ArchiveItem;
  onClose: () => void;
  onDownload: (item: ArchiveItem) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  item,
  onClose,
  onDownload,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#20201D]/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-[680px] bg-[#FFFDF8] rounded-xl shadow-2xl overflow-hidden border border-[#E4DCC8] my-8 max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="bg-[#57000f] text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-white">description</span>
            <h3 className="font-['Lora',serif] text-[18px] font-bold text-white">
              Pratinjau Dokumen Digital
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Paper Document Body */}
        <div className="p-8 overflow-y-auto space-y-6 bg-[#fdf9f0]">
          {/* Simulated Official Letterhead */}
          <div className="border-b-2 border-[#1c1c16] pb-4 text-center space-y-1">
            <h4 className="font-['Lora',serif] font-bold text-lg text-[#57000f] tracking-wide">
              PANITIA PELAKSANA PERINGATAN HUT RI KE-81
            </h4>
            <p className="font-['JetBrains_Mono',monospace] text-xs text-[#574141]">
              SISTEM INFORMASI PENGELOLAAN ADMINISTRASI BAGIAN TATA PEMERINTAHAN KUBU RAYA (SIPATI)
            </p>
            <p className="font-['Inter',sans-serif] text-[11px] text-[#6E6A61]">
              Jl. Medan Merdeka Utara No. 7, Jakarta Pusat 10110
            </p>
          </div>

          {/* Document Identity */}
          <div className="flex justify-between items-start bg-[#FFFDF8] p-4 rounded-lg border border-[#E4DCC8]">
            <div>
              <span className="block font-['JetBrains_Mono',monospace] text-[10.5px] uppercase text-[#6E6A61] mb-1">
                NOMOR REKAPITULASI DOKUMEN
              </span>
              <h5 className="font-['Lora',serif] text-base font-bold text-[#20201D]">
                {item.title}
              </h5>
              <p className="font-['JetBrains_Mono',monospace] text-xs text-[#57000f] mt-0.5">
                {item.noSurat}
              </p>
            </div>

            {/* Stamp Badge */}
            <div
              className={`px-3 py-1 border-2 border-dashed rounded font-['JetBrains_Mono',monospace] text-[11px] font-bold tracking-widest stempel-effect ${
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

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-['Inter',sans-serif]">
            <div className="bg-[#FFFDF8] p-3 rounded border border-[#E4DCC8]">
              <span className="text-[#6E6A61] block font-semibold mb-0.5">BIDANG</span>
              <span className="text-[#1c1c16] font-medium">{item.bidang}</span>
            </div>
            <div className="bg-[#FFFDF8] p-3 rounded border border-[#E4DCC8]">
              <span className="text-[#6E6A61] block font-semibold mb-0.5">TANGGAL</span>
              <span className="text-[#1c1c16] font-medium">{item.date}</span>
            </div>
            <div className="bg-[#FFFDF8] p-3 rounded border border-[#E4DCC8]">
              <span className="text-[#6E6A61] block font-semibold mb-0.5">UKURAN FILE</span>
              <span className="text-[#1c1c16] font-medium">{item.fileSize || '2.4 MB'}</span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-[#FFFDF8] p-4 rounded-lg border border-[#E4DCC8] space-y-2">
            <h6 className="font-['Inter',sans-serif] font-semibold text-xs text-[#6E6A61] uppercase tracking-wider">
              Ringkasan Substansi Dokumen
            </h6>
            <p className="font-['Inter',sans-serif] text-[13.5px] text-[#20201D] leading-relaxed">
              {item.description ||
                'Dokumen ini berisi ketetapan dan rincian keputusan resmi panitia pelaksana peringatan HUT RI Ke-81 yang telah diverifikasi sesuai dengan norma dan tata naskah dinas.'}
            </p>
          </div>

          {/* Verification Audit Log */}
          <div className="border-t border-dashed border-[#E4DCC8] pt-4 font-['JetBrains_Mono',monospace] text-[11px] text-[#6E6A61] space-y-1">
            <p className="flex items-center gap-1.5 text-[#2F6B44]">
              <span className="material-symbols-outlined text-sm">verified</span>
              Tanda Tangan Digital & Otentikasi Terenkripsi SHA-256 Valid.
            </p>
            <p>Diverifikasi oleh: Tim Sekretariat Utama Administrasi HUT RI 81</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#FFFDF8] border-t border-[#E4DCC8] flex flex-wrap justify-between items-center gap-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#FFFDF8] border border-[#E4DCC8] hover:bg-[#f1eee5] text-[#20201D] rounded-md font-['Inter',sans-serif] text-[12px] font-semibold transition-colors cursor-pointer"
          >
            Tutup Pratinjau
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openInGoogleDrive(`${item.title}.${item.fileType}`)}
              className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-md font-['Inter',sans-serif] text-[12px] font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">cloud</span>
              <span>Buka di Google Drive</span>
            </button>
            <button
              onClick={() => onDownload(item)}
              className="px-5 py-2.5 bg-[#b62230] hover:bg-[#57000f] text-white rounded-md font-['Inter',sans-serif] text-[12px] font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Unduh Salinan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
