import React, { useState } from 'react';
import { TaskItem, TaskStatus } from '../types';

interface TaskDetailModalProps {
  task: TaskItem;
  onClose: () => void;
  onSave: (updatedTask: TaskItem) => void;
  onDelete?: (taskId: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  onClose,
  onSave,
  onDelete,
}) => {
  const [title, setTitle] = useState(task.title);
  const [bidang, setBidang] = useState(task.bidang);
  const [pj, setPj] = useState(task.pj === '—' ? '' : task.pj);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [catatan, setCatatan] = useState(task.catatan);

  const [draftPekerjaan, setDraftPekerjaan] = useState<string[]>(
    task.draftPekerjaan || []
  );
  const [buktiDokumen, setBuktiDokumen] = useState<string[]>(
    task.buktiDokumen || []
  );
  const [buktiSuratDiterima, setBuktiSuratDiterima] = useState<string[]>(
    task.buktiSuratDiterima || []
  );

  // File preview modal state
  const [activePreview, setActivePreview] = useState<{
    fileName: string;
    category: string;
  } | null>(null);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'draft' | 'dokumen' | 'tandaTerima'
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((f: File) => f.name);
      if (type === 'draft') {
        setDraftPekerjaan((prev) => [...prev, ...newFiles]);
      } else if (type === 'dokumen') {
        setBuktiDokumen((prev) => [...prev, ...newFiles]);
      } else {
        setBuktiSuratDiterima((prev) => [...prev, ...newFiles]);
      }
    }
  };

  const handleRemoveFile = (
    fileName: string,
    type: 'draft' | 'dokumen' | 'tandaTerima'
  ) => {
    if (type === 'draft') {
      setDraftPekerjaan((prev) => prev.filter((f) => f !== fileName));
    } else if (type === 'dokumen') {
      setBuktiDokumen((prev) => prev.filter((f) => f !== fileName));
    } else {
      setBuktiSuratDiterima((prev) => prev.filter((f) => f !== fileName));
    }
  };

  const handleDownloadFile = (fileName: string) => {
    const fileContent = `PANITIA PELAKSANA PERINGATAN HUT RI KE-81 TAHUN 2026\n` +
      `SISTEM INFORMASI PENGELOLAAN ADMINISTRASI TERPADU INDONESIA (SIPATI)\n` +
      `============================================================\n\n` +
      `NAMA BERKAS    : ${fileName}\n` +
      `PEKERJAAN      : ${title}\n` +
      `BIDANG         : ${bidang}\n` +
      `NOMOR SURAT    : ${task.noSurat || '—'}\n` +
      `PENANGGUNG JAWAB: ${pj || '—'}\n` +
      `STATUS         : ${status}\n` +
      `TANGGAL BUAT   : ${task.dateCreated || '2026-08-01'}\n\n` +
      `CATATAN / KETERANGAN:\n${catatan || 'Tidak ada catatan khusus.'}\n\n` +
      `------------------------------------------------------------\n` +
      `Dikeluarkan secara sah oleh Panitia Nasional HUT RI Ke-81.`;

    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName.includes('.') ? fileName : `${fileName}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...task,
      title,
      bidang,
      pj: pj.trim() ? pj.trim() : '—',
      status,
      catatan,
      draftPekerjaan,
      buktiDokumen,
      buktiSuratDiterima,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#20201D]/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-[620px] bg-[#FFFDF8] rounded-xl shadow-2xl overflow-hidden border border-[#E4DCC8] my-8 max-h-[90vh] flex flex-col font-['Inter',sans-serif]">
        {/* Header Bar */}
        <div className="bg-[#7a1220] text-white px-6 py-4 flex justify-between items-center flex-shrink-0">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-amber-200 uppercase block">
              DETAIL DOKUMEN &amp; PEKERJAAN
            </span>
            <h3 className="font-['Lora',serif] text-[18px] font-bold tracking-tight text-white">
              {title || 'Detail Pekerjaan'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            aria-label="Tutup Detail"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* NAMA PEKERJAAN / SURAT */}
          <div>
            <label className="block font-semibold text-[11px] tracking-[0.08em] uppercase text-[#6E6A61] mb-1.5">
              NAMA PEKERJAAN / SURAT
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#E4DCC8] rounded-md text-[13.5px] text-[#20201D] focus:outline-none focus:border-[#b62230] focus:ring-1 focus:ring-[#b62230]"
              placeholder="Judul pekerjaan atau nama surat..."
              required
            />
          </div>

          {/* BIDANG & PENANGGUNG JAWAB */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[11px] tracking-[0.08em] uppercase text-[#6E6A61] mb-1.5">
                BIDANG
              </label>
              <select
                value={bidang}
                onChange={(e) => setBidang(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#E4DCC8] rounded-md text-[13.5px] text-[#20201D] focus:outline-none focus:border-[#b62230] focus:ring-1 focus:ring-[#b62230]"
              >
                <option value="Legalisasi Operasional">Legalisasi Operasional</option>
                <option value="Tata Kelola Rapat">Tata Kelola Rapat</option>
                <option value="Manajemen Korespondensi">Manajemen Korespondensi</option>
                <option value="Logistik & Perlengkapan">Logistik & Perlengkapan</option>
                <option value="Keuangan & Audit">Keuangan & Audit</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[11px] tracking-[0.08em] uppercase text-[#6E6A61] mb-1.5">
                PENANGGUNG JAWAB (PJ)
              </label>
              <input
                type="text"
                value={pj}
                onChange={(e) => setPj(e.target.value)}
                placeholder="Nama PJ (e.g. Drs. Ahmad Yani)"
                className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#E4DCC8] rounded-md text-[13.5px] text-[#20201D] focus:outline-none focus:border-[#b62230] focus:ring-1 focus:ring-[#b62230]"
              />
            </div>
          </div>

          {/* STATUS PEKERJAAN Toggle Buttons */}
          <div>
            <label className="block font-semibold text-[11px] tracking-[0.08em] uppercase text-[#6E6A61] mb-1.5">
              STATUS PEKERJAAN
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('BELUM')}
                className={`py-2.5 px-3 rounded-md font-mono text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
                  status === 'BELUM'
                    ? 'bg-[#ece8df] border-2 border-[#8b7170] text-[#1c1c16] shadow-2xs'
                    : 'bg-[#FFFDF8] border border-[#E4DCC8] text-[#6E6A61] hover:bg-[#f7f3ea]'
                }`}
              >
                BELUM
              </button>
              <button
                type="button"
                onClick={() => setStatus('PROSES')}
                className={`py-2.5 px-3 rounded-md font-mono text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
                  status === 'PROSES'
                    ? 'bg-[#ffddb3] border-2 border-[#563700] text-[#392300] shadow-2xs'
                    : 'bg-[#FFFDF8] border border-[#E4DCC8] text-[#6E6A61] hover:bg-[#f7f3ea]'
                }`}
              >
                PROSES
              </button>
              <button
                type="button"
                onClick={() => setStatus('SELESAI')}
                className={`py-2.5 px-3 rounded-md font-mono text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
                  status === 'SELESAI'
                    ? 'bg-[#2F6B44]/15 border-2 border-[#2F6B44] text-[#2F6B44] shadow-2xs'
                    : 'bg-[#FFFDF8] border border-[#E4DCC8] text-[#6E6A61] hover:bg-[#f7f3ea]'
                }`}
              >
                SELESAI
              </button>
            </div>
          </div>

          {/* CATATAN */}
          <div>
            <label className="block font-semibold text-[11px] tracking-[0.08em] uppercase text-[#6E6A61] mb-1.5">
              CATATAN PEKERJAAN
            </label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan tambahan..."
              className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#E4DCC8] rounded-md text-[13.5px] text-[#20201D] focus:outline-none focus:border-[#b62230] focus:ring-1 focus:ring-[#b62230]"
            />
          </div>

          <div className="border-t border-[#E4DCC8] pt-4 space-y-5">
            {/* 1. DRAFT PEKERJAAN */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-[11px] tracking-[0.08em] uppercase text-[#57000f] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">edit_note</span>
                  DRAFT PEKERJAAN (KONSEP DOKUMEN)
                </label>
                <span className="text-[10px] font-mono text-[#8e8d8a]">
                  {draftPekerjaan.length} Berkas
                </span>
              </div>

              {draftPekerjaan.length > 0 ? (
                <div className="space-y-2 mb-2.5">
                  {draftPekerjaan.map((fileName, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-[#FFFDF8] rounded-lg border border-[#E4DCC8] shadow-2xs text-xs"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="material-symbols-outlined text-base text-[#b62230]">
                          description
                        </span>
                        <span className="font-semibold text-[#1c1c16] truncate">
                          {fileName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setActivePreview({
                              fileName,
                              category: 'Draft Pekerjaan (Konsep)',
                            })
                          }
                          className="px-2.5 py-1 bg-[#57000f] text-white hover:bg-[#8e1925] rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            visibility
                          </span>
                          <span>Lihat</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(fileName)}
                          className="px-2.5 py-1 bg-emerald-700 text-white hover:bg-emerald-800 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            download
                          </span>
                          <span>Unduh</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(fileName, 'draft')}
                          className="p-1 text-rose-700 hover:text-rose-900 font-bold text-xs cursor-pointer ml-1"
                          title="Hapus draft"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#8e8d8a] italic mb-2">
                  Belum ada draft pekerjaan yang diunggah.
                </p>
              )}

              <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-[#E4DCC8] rounded-lg bg-[#fdfaf2] hover:bg-[#f8f2e4] transition-colors cursor-pointer text-center group">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#b62230] text-lg">
                    note_add
                  </span>
                  <span className="text-[12px] font-bold text-[#574141] group-hover:text-[#57000f]">
                    + Unggah Draft Pekerjaan Baru (.docx, .pdf, .pptx)
                  </span>
                </div>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e, 'draft')}
                  className="hidden"
                />
              </label>
            </div>

            {/* 2. BUKTI DOKUMEN SELESAI */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-[11px] tracking-[0.08em] uppercase text-[#2F6B44] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  BUKTI DOKUMEN SELESAI
                </label>
                <span className="text-[10px] font-mono text-[#8e8d8a]">
                  {buktiDokumen.length} Berkas
                </span>
              </div>

              {buktiDokumen.length > 0 ? (
                <div className="space-y-2 mb-2.5">
                  {buktiDokumen.map((fileName, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-[#FFFDF8] rounded-lg border border-[#E4DCC8] shadow-2xs text-xs"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="material-symbols-outlined text-base text-[#2F6B44]">
                          task_check
                        </span>
                        <span className="font-semibold text-[#1c1c16] truncate">
                          {fileName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setActivePreview({
                              fileName,
                              category: 'Bukti Dokumen Selesai',
                            })
                          }
                          className="px-2.5 py-1 bg-[#57000f] text-white hover:bg-[#8e1925] rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            visibility
                          </span>
                          <span>Lihat</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(fileName)}
                          className="px-2.5 py-1 bg-emerald-700 text-white hover:bg-emerald-800 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            download
                          </span>
                          <span>Unduh</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(fileName, 'dokumen')}
                          className="p-1 text-rose-700 hover:text-rose-900 font-bold text-xs cursor-pointer ml-1"
                          title="Hapus dokumen"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#8e8d8a] italic mb-2">
                  Belum ada bukti dokumen selesai.
                </p>
              )}

              <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-[#E4DCC8] rounded-lg bg-[#fdfaf2] hover:bg-[#f8f2e4] transition-colors cursor-pointer text-center group">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#2F6B44] text-lg">
                    attach_file
                  </span>
                  <span className="text-[12px] font-bold text-[#574141] group-hover:text-[#2F6B44]">
                    + Unggah Bukti Dokumen Selesai
                  </span>
                </div>
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e, 'dokumen')}
                  className="hidden"
                />
              </label>
            </div>

            {/* 3. BUKTI SURAT DITERIMA */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-semibold text-[11px] tracking-[0.08em] uppercase text-blue-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">mark_email_read</span>
                  BUKTI SURAT DITERIMA (TANDA TERIMA)
                </label>
                <span className="text-[10px] font-mono text-[#8e8d8a]">
                  {buktiSuratDiterima.length} Berkas
                </span>
              </div>

              {buktiSuratDiterima.length > 0 ? (
                <div className="space-y-2 mb-2.5">
                  {buktiSuratDiterima.map((fileName, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 bg-[#FFFDF8] rounded-lg border border-[#E4DCC8] shadow-2xs text-xs"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="material-symbols-outlined text-base text-blue-700">
                          photo_camera
                        </span>
                        <span className="font-semibold text-[#1c1c16] truncate">
                          {fileName}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            setActivePreview({
                              fileName,
                              category: 'Bukti Surat Diterima',
                            })
                          }
                          className="px-2.5 py-1 bg-[#57000f] text-white hover:bg-[#8e1925] rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            visibility
                          </span>
                          <span>Lihat</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(fileName)}
                          className="px-2.5 py-1 bg-emerald-700 text-white hover:bg-emerald-800 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            download
                          </span>
                          <span>Unduh</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveFile(fileName, 'tandaTerima')
                          }
                          className="p-1 text-rose-700 hover:text-rose-900 font-bold text-xs cursor-pointer ml-1"
                          title="Hapus bukti terima"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#8e8d8a] italic mb-2">
                  Belum ada bukti surat diterima.
                </p>
              )}

              <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-[#E4DCC8] rounded-lg bg-[#fdfaf2] hover:bg-[#f8f2e4] transition-colors cursor-pointer text-center group">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-700 text-lg">
                    photo_camera
                  </span>
                  <span className="text-[12px] font-bold text-[#574141] group-hover:text-blue-800">
                    + Unggah Foto Tanda Terima / Bukti Diterima
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'tandaTerima')}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-[#E4DCC8] flex items-center justify-between gap-3">
            {onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(task.id)}
                className="px-4 py-2.5 bg-[#ffdad6] hover:bg-[#ba1a1a] text-[#93000a] hover:text-white rounded-md text-[12px] font-semibold transition-colors cursor-pointer"
              >
                Hapus
              </button>
            ) : (
              <div />
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-[#FFFDF8] border border-[#E4DCC8] hover:bg-[#f1eee5] text-[#20201D] rounded-md text-[12px] font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#b62230] hover:bg-[#57000f] text-white rounded-md text-[12px] font-semibold transition-colors shadow-xs cursor-pointer active:scale-95"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* SUB-MODAL FOR FILE PREVIEW (LIHAT DOKUMEN) */}
      {activePreview && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn font-['Inter',sans-serif]">
          <div className="bg-[#FFFDF8] rounded-xl border border-[#E4DCC8] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#57000f] text-white px-5 py-3.5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-200">
                  visibility
                </span>
                <h4 className="font-['Lora',serif] font-bold text-base text-white">
                  Pratinjau {activePreview.category}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActivePreview(null)}
                className="text-white/80 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Preview Document Paper */}
            <div className="p-6 bg-[#fdf9f0] space-y-4 text-xs">
              <div className="border-b-2 border-[#1c1c16] pb-3 text-center space-y-0.5">
                <p className="font-['Lora',serif] font-bold text-sm text-[#57000f] uppercase">
                  PANITIA PELAKSANA PERINGATAN HUT RI KE-81
                </p>
                <p className="font-mono text-[10px] text-[#574141]">
                  SISTEM INFORMASI ADMINISTRASI PANITIA (SIPATI 2026)
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-[#E4DCC8] space-y-1.5 shadow-2xs">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#b62230]">
                    {activePreview.category}
                  </span>
                  <span className="px-2 py-0.5 border border-[#2F6B44] text-[#2F6B44] font-mono text-[10px] font-bold rounded">
                    TERVERIFIKASI
                  </span>
                </div>
                <h5 className="font-bold text-sm text-[#1c1c16]">
                  {activePreview.fileName}
                </h5>
                <p className="text-[11px] text-[#574141]">
                  Pekerjaan: <span className="font-semibold">{title}</span>
                </p>
                <p className="text-[11px] text-[#574141]">
                  Bidang: <span className="font-semibold">{bidang}</span>
                </p>
                {task.noSurat && (
                  <p className="text-[11px] text-[#574141]">
                    No Surat: <span className="font-mono font-semibold">{task.noSurat}</span>
                  </p>
                )}
              </div>

              {/* Simulated Content / Photo Box */}
              <div className="bg-white p-4 rounded-lg border border-dashed border-[#8e8d8a] text-[#574141] text-[11.5px] leading-relaxed space-y-2">
                <p className="font-semibold text-[#1c1c16]">
                  Ringkasan Isi Berkas:
                </p>
                <p>
                  {catatan ||
                    'Naskah berkas resmi panitia HUT RI Ke-81 telah tersimpan secara aman dan terenkripsi.'}
                </p>
                {activePreview.fileName.endsWith('.jpg') || activePreview.fileName.endsWith('.png') ? (
                  <div className="mt-3 p-6 bg-slate-100 border rounded flex flex-col items-center justify-center text-slate-500 gap-1">
                    <span className="material-symbols-outlined text-3xl">image</span>
                    <span className="text-[11px] font-semibold">
                      [Foto Pratinjau Tanda Terima / Bukti Surat]
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-[#FFFDF8] border-t border-[#E4DCC8] flex justify-between items-center shrink-0">
              <button
                type="button"
                onClick={() => setActivePreview(null)}
                className="px-4 py-2 border border-[#E4DCC8] bg-white text-[#20201D] rounded font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDownloadFile(activePreview.fileName);
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-sm">
                  download
                </span>
                <span>Unduh Berkas</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
