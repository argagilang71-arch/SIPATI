import React from 'react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-[620px] bg-[#002845] rounded-2xl shadow-2xl overflow-hidden border border-cyan-500/40 my-8 max-h-[90vh] flex flex-col text-white font-['Inter',sans-serif]">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#003b5c] via-[#005f8e] to-[#003b5c] text-white px-6 py-4 flex justify-between items-center border-b border-white/15">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-300">help</span>
            <h3 className="font-['Lora',serif] text-[18px] font-bold text-white">
              Bantuan &amp; Panduan Penggunaan SIPATI
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
        <div className="p-6 overflow-y-auto space-y-6 text-sm font-['Inter',sans-serif] text-gray-200 bg-black/30">
          <div className="space-y-2">
            <h4 className="font-['Lora',serif] font-bold text-base text-cyan-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">assignment</span>
              1. Pengelolaan Daftar Pekerjaan
            </h4>
            <p className="text-gray-300 leading-relaxed text-[13px]">
              Menu <strong>Daftar Pekerjaan</strong> mengelompokkan penugasan tim berdasarkan bidang (Legalisasi Operasional, Tata Kelola Rapat, Manajemen Korespondensi). Klik pada nama pekerjaan untuk membuka <strong>Detail Pekerjaan</strong>, memperbarui status (BELUM, PROSES, SELESAI), menambahkan catatan, serta mengunggah bukti dokumen dan foto tanda terima.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-['Lora',serif] font-bold text-base text-cyan-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">archive</span>
              2. Pencarian &amp; Validasi Arsip Digital
            </h4>
            <p className="text-gray-300 leading-relaxed text-[13px]">
              Dokumen final yang terbukti sah secara hukum disimpan di <strong>Arsip Digital Administrasi</strong>. Setiap dokumen dilengkapi dengan <strong>Stempel Validasi Digital</strong> (TERVERIFIKASI, FINAL, atau DIUSANGKAN). Anda dapat menggunakan filter bidang dan periode untuk pencarian presisi.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-['Lora',serif] font-bold text-base text-cyan-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">description</span>
              3. Generator Template Naskah Dinas
            </h4>
            <p className="text-gray-300 leading-relaxed text-[13px]">
              Gunakan <strong>Template Surat</strong> untuk membuat draf Surat Keputusan (SK), Surat Edaran, Undangan Rapat, Berita Acara, dan Nota Dinas secara otomatis sesuai standar tata naskah dinas kementerian.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-['Lora',serif] font-bold text-base text-cyan-300 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">dashboard</span>
              4. Laporan Digital Otomatis Eksekutif
            </h4>
            <p className="text-gray-300 leading-relaxed text-[13px]">
              Menu <strong>Ringkasan</strong> menyajikan statistik real-time tingkat verifikasi, partisipasi rapat, dan capaian per bidang. Anda dapat langsung menekan <strong>Unduh Buku (PDF)</strong> atau <strong>Kirim ke Email Pimpinan</strong>.
            </p>
          </div>

          <div className="p-4 bg-white/10 rounded-xl border border-white/15 text-xs font-['JetBrains_Mono',monospace] text-cyan-200">
            Pusat Bantuan Layanan Teknis: helpdesk.sipati@kemensetneg.go.id | Ext. 8104
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#001e36] border-t border-white/15 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#00a3e0] text-white hover:bg-[#008bc2] rounded-xl font-['Inter',sans-serif] text-[12px] font-semibold transition-colors cursor-pointer shadow-lg hover:shadow-cyan-500/25"
          >
            Mengerti &amp; Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
