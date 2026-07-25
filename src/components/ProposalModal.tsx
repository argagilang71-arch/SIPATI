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
  const [selectedBidangOption, setSelectedBidangOption] = useState('Legalisasi Operasional');
  const [customBidang, setCustomBidang] = useState('');
  const [latarBelakang, setLatarBelakang] = useState('');

  const finalBidang =
    selectedBidangOption === '__TAMBAH_BARU__'
      ? customBidang.trim() || 'Bidang Umum'
      : selectedBidangOption;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim()) return;

    const newProp: ProposalItem = {
      id: `prop-${Date.now()}`,
      judul: judul.trim(),
      bidang: finalBidang,
      anggaran: 0,
      latarBelakang,
      status: 'Diajukan',
      dateSubmitted: new Date().toISOString().split('T')[0],
    };

    onSubmitProposal(newProp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-[540px] bg-[#002845] rounded-2xl shadow-2xl overflow-hidden border border-cyan-500/40 my-8 text-white font-['Inter',sans-serif]">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#003b5c] via-[#005f8e] to-[#003b5c] text-white px-6 py-4 flex justify-between items-center border-b border-white/15">
          <h3 className="font-['Lora',serif] text-[18px] font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-300">add_task</span>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-black/30">
          <div>
            <label className="block font-['Inter',sans-serif] font-semibold text-[11px] uppercase text-cyan-300 mb-1">
              Judul Pekerjaan Kegiatan / Pengadaan
            </label>
            <input
              type="text"
              required
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Pengadaan Perlengkapan Panggung Upacara"
              className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl font-['Inter',sans-serif] text-[13.5px] text-white focus:outline-none focus:border-[#00a3e0]"
            />
          </div>

          <div>
            <label className="block font-['Inter',sans-serif] font-semibold text-[11px] uppercase text-cyan-300 mb-1">
              Bidang Operasional Pekerjaan
            </label>
            <select
              value={selectedBidangOption}
              onChange={(e) => setSelectedBidangOption(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#002845] border border-white/20 rounded-xl font-['Inter',sans-serif] text-[13.5px] text-white focus:outline-none focus:border-[#00a3e0] cursor-pointer"
            >
              <option value="Legalisasi Operasional">Legalisasi Operasional</option>
              <option value="Tata Kelola Rapat">Tata Kelola Rapat</option>
              <option value="Manajemen Korespondensi">Manajemen Korespondensi</option>
              <option value="__TAMBAH_BARU__">+ Tambah Bidang Pekerjaan Baru...</option>
            </select>

            {selectedBidangOption === '__TAMBAH_BARU__' && (
              <div className="mt-2">
                <input
                  type="text"
                  required
                  value={customBidang}
                  onChange={(e) => setCustomBidang(e.target.value)}
                  placeholder="Ketik nama bidang pekerjaan baru..."
                  className="w-full px-3.5 py-2 bg-black/40 border border-cyan-400/50 rounded-xl font-['Inter',sans-serif] text-[13px] text-cyan-200 placeholder-gray-400 focus:outline-none focus:border-cyan-300 animate-fadeIn"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block font-['Inter',sans-serif] font-semibold text-[11px] uppercase text-cyan-300 mb-1">
              Latar Belakang &amp; Deskripsi Singkat
            </label>
            <textarea
              rows={3}
              value={latarBelakang}
              onChange={(e) => setLatarBelakang(e.target.value)}
              placeholder="Uraikan urgensi dan relevansi pekerjaan terhadap perayaan HUT RI Ke-81..."
              className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl font-['Inter',sans-serif] text-[13.5px] text-white focus:outline-none focus:border-[#00a3e0]"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/15 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-white/10 border border-white/20 hover:bg-white/20 text-white rounded-xl font-['Inter',sans-serif] text-[12px] font-semibold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#00a3e0] hover:bg-[#008bc2] text-white rounded-xl font-['Inter',sans-serif] text-[12px] font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-cyan-500/25 cursor-pointer active:scale-95"
            >
              Kirim Pekerjaan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
