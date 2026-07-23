import React from 'react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#20201D]/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-[620px] bg-[#FFFDF8] rounded-xl shadow-2xl overflow-hidden border border-[#E4DCC8] my-8 max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="bg-[#57000f] text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-white">help</span>
            <h3 className="font-['Lora',serif] text-[18px] font-bold text-white">
              Bantuan & Panduan Penggunaan SIPATI
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm font-['Inter',sans-serif] text-[#20201D]">
          <div className="space-y-2">
            <h4 className="font-['Lora',serif] font-bold text-base text-[#57000f] flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">assignment</span>
              1. Pengelolaan Daftar Pekerjaan
            </h4>
            <p className="text-[#574141] leading-relaxed text-[13px]">
              Menu **Daftar Pekerjaan** mengelompokkan penugasan tim berdasarkan bidang (Legalisasi Operasional, Tata Kelola Rapat, Manajemen Korespondensi). Klik pada nama pekerjaan untuk membuka **Detail Pekerjaan**, memperbarui status (BELUM, PROSES, SELESAI), menambahkan catatan, serta mengunggah bukti dokumen dan foto tanda terima.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-['Lora',serif] font-bold text-base text-[#57000f] flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">archive</span>
              2. Pencarian & Validasi Arsip Digital
            </h4>
            <p className="text-[#574141] leading-relaxed text-[13px]">
              Dokumen final yang terbukti sah secara hukum disimpan di **Arsip Digital Administrasi**. Setiap dokumen dilengkapi dengan **Stempel Validasi Digital** (TERVERIFIKASI, FINAL, atau DIUSANGKAN). Anda dapat menggunakan filter bidang dan periode untuk pencarian presisi.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-['Lora',serif] font-bold text-base text-[#57000f] flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">description</span>
              3. Generator Template Naskah Dinas
            </h4>
            <p className="text-[#574141] leading-relaxed text-[13px]">
              Gunakan **Template Surat** untuk membuat draf Surat Keputusan (SK), Surat Edaran, Undangan Rapat, Berita Acara, dan Nota Dinas secara otomatis sesuai standar tata naskah dinas kementerian.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-['Lora',serif] font-bold text-base text-[#57000f] flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">dashboard</span>
              4. Laporan Digital Otomatis Eksekutif
            </h4>
            <p className="text-[#574141] leading-relaxed text-[13px]">
              Menu **Ringkasan** menyajikan statistik real-time tingkat verifikasi, partisipasi rapat, dan capaian per bidang. Anda dapat langsung menekan **Unduh Buku (PDF)** atau **Kirim ke Email Pimpinan**.
            </p>
          </div>

          <div className="p-4 bg-[#f1eee5] rounded-lg border border-[#E4DCC8] text-xs font-['JetBrains_Mono',monospace] text-[#574141]">
            Pusat Bantuan Layanan Teknis: helpdesk.sipati@kemensetneg.go.id | Ext. 8104
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FFFDF8] border-t border-[#E4DCC8] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#b62230] text-white hover:bg-[#57000f] rounded-md font-['Inter',sans-serif] text-[12px] font-semibold transition-colors cursor-pointer"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
