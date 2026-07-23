import React, { useState } from 'react';

interface SendEmailModalProps {
  onClose: () => void;
  onSuccess: (email: string) => void;
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [recipientEmail, setRecipientEmail] = useState('pimpinan.sekretariat@kemensetneg.go.id');
  const [catatanExecutive, setCatatanExecutive] = useState(
    'Bersama ini kami sampaikan Kompilasi Laporan Digital Otomatis Persiapan HUT RI Ke-81 untuk periode Agustus 2026.'
  );
  const [sending, setSending] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim()) return;

    setSending(true);
    setTimeout(() => {
      setSending(false);
      onSuccess(recipientEmail);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#20201D]/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-[500px] bg-[#FFFDF8] rounded-xl shadow-2xl overflow-hidden border border-[#E4DCC8] my-8">
        {/* Header Bar */}
        <div className="bg-[#57000f] text-white px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-white">send</span>
            <h3 className="font-['Lora',serif] text-[18px] font-bold text-white">
              Kirim Laporan ke Email Pimpinan
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSend} className="p-6 space-y-4">
          <div>
            <label className="block font-['Inter',sans-serif] font-semibold text-[11px] uppercase text-[#6E6A61] mb-1">
              Alamat Email Tujuan (Pimpinan / Sekretariat)
            </label>
            <input
              type="email"
              required
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#E4DCC8] rounded-md font-['Inter',sans-serif] text-[13.5px] text-[#20201D] focus:outline-none focus:border-[#b62230]"
            />
          </div>

          <div>
            <label className="block font-['Inter',sans-serif] font-semibold text-[11px] uppercase text-[#6E6A61] mb-1">
              Catatan Pengantar Eksekutif
            </label>
            <textarea
              rows={4}
              value={catatanExecutive}
              onChange={(e) => setCatatanExecutive(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#E4DCC8] rounded-md font-['Inter',sans-serif] text-[13.5px] text-[#20201D] focus:outline-none focus:border-[#b62230]"
            />
          </div>

          <div className="p-3 bg-[#f1eee5] rounded-md border border-[#E4DCC8] flex items-center gap-2 text-xs font-['Inter',sans-serif] text-[#574141]">
            <span className="material-symbols-outlined text-[#2F6B44]">
              picture_as_pdf
            </span>
            <span>File lampiran otomatis: Laporan_Digital_SIPATI_Agustus_2026.pdf</span>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-[#E4DCC8] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="px-5 py-2.5 bg-[#FFFDF8] border border-[#E4DCC8] hover:bg-[#f1eee5] text-[#20201D] rounded-md font-['Inter',sans-serif] text-[12px] font-semibold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={sending}
              className="px-6 py-2.5 bg-[#b62230] hover:bg-[#57000f] text-white rounded-md font-['Inter',sans-serif] text-[12px] font-semibold transition-colors flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {sending ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">
                    sync
                  </span>
                  Mengirim...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">send</span>
                  Kirim Email Seketika
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
