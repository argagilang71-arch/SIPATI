import React, { useState } from 'react';
import { ProposalItem } from '../types';

interface ProposalModalProps {
  onClose: () => void;
  onSubmitProposal: (proposal: ProposalItem) => void;
}

export const ProposalModal: React.FC<ProposalModalProps> = ({
  onClose,
  onSubmitProposal,
}) => {
  const [judul, setJudul] = useState('');
  const [bidang, setBidang] = useState('Legalisasi Operasional');
  const [latarBelakang, setLatarBelakang] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim()) return;

    const newProp: ProposalItem = {
      id: `prop-${Date.now()}`,
      judul: judul.trim(),
      bidang,
      anggaran: 0,
      latarBelakang,
      status: 'Diajukan',
      dateSubmitted: new Date().toISOString().split('T')[0],
    };

    onSubmitProposal(newProp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#20201D]/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-[540px] bg-[#FFFDF8] rounded-xl shadow-2xl overflow-hidden border border-[#E4DCC8] my-8">
        {/* Header Bar */}
        <div className="bg-[#57000f] text-white px-6 py-4 flex justify-between items-center">
          <h3 className="font-['Lora',serif] text-[18px] font-bold text-white">
            Buat Pekerjaan Administrasi Baru
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block font-['Inter',sans-serif] font-semibold text-[11px] uppercase text-[#6E6A61] mb-1">
              Judul Pekerjaan Kegiatan / Pengadaan
            </label>
            <input
              type="text"
              required
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Pengadaan Perlengkapan Panggung Upacara"
              className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#E4DCC8] rounded-md font-['Inter',sans-serif] text-[13.5px] text-[#20201D] focus:outline-none focus:border-[#b62230]"
            />
          </div>

          <div>
            <label className="block font-['Inter',sans-serif] font-semibold text-[11px] uppercase text-[#6E6A61] mb-1">
              Bidang Operasional
            </label>
            <select
              value={bidang}
              onChange={(e) => setBidang(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#E4DCC8] rounded-md font-['Inter',sans-serif] text-[13.5px] text-[#20201D] focus:outline-none focus:border-[#b62230]"
            >
              <option value="Legalisasi Operasional">Legalisasi Operasional</option>
              <option value="Tata Kelola Rapat">Tata Kelola Rapat</option>
              <option value="Manajemen Korespondensi">Manajemen Korespondensi</option>
              <option value="Logistik & Perlengkapan">Logistik & Perlengkapan</option>
              <option value="Keuangan & Audit">Keuangan & Audit</option>
            </select>
          </div>

          <div>
            <label className="block font-['Inter',sans-serif] font-semibold text-[11px] uppercase text-[#6E6A61] mb-1">
              Latar Belakang & Deskripsi Singkat
            </label>
            <textarea
              rows={3}
              value={latarBelakang}
              onChange={(e) => setLatarBelakang(e.target.value)}
              placeholder="Uraikan urgensi dan relevansi pekerjaan terhadap perayaan HUT RI Ke-81..."
              className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#E4DCC8] rounded-md font-['Inter',sans-serif] text-[13.5px] text-[#20201D] focus:outline-none focus:border-[#b62230]"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#E4DCC8] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-[#FFFDF8] border border-[#E4DCC8] hover:bg-[#f1eee5] text-[#20201D] rounded-md font-['Inter',sans-serif] text-[12px] font-semibold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#ff595e] hover:bg-[#b62230] text-[#60000e] hover:text-white rounded-md font-['Inter',sans-serif] text-[12px] font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer active:scale-95"
            >
              Kirim Pekerjaan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
