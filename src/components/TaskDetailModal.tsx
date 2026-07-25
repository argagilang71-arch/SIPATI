import React, { useState, useEffect } from 'react';
import { TaskItem, TaskStatus } from '../types';
import {
  registerUploadedFile,
  downloadStoredFile,
  getStoredFileInfo,
  getStoredFileBlob,
  openInGoogleDrive,
} from '../utils/fileStorage';
import { OfficialDocumentViewer } from './OfficialDocumentViewer';

interface TaskDetailModalProps {
  task: TaskItem;
  onClose: () => void;
  onSave: (updatedTask: TaskItem) => void;
  onDelete?: (taskId: string) => void;
}

// Sub-component for rendering uploaded receipt photo thumbnails directly in the UI
const ReceiptPhotoItem: React.FC<{
  fileName: string;
  onPreview: () => void;
  onDownload: () => void;
  onRemove: () => void;
}> = ({ fileName, onPreview, onDownload, onRemove }) => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [isImage, setIsImage] = useState(false);

  useEffect(() => {
    let active = true;
    let url: string | null = null;

    getStoredFileBlob(fileName).then((res) => {
      if (!active) return;
      if (res && res.blob) {
        if (res.mimeType.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(fileName)) {
          url = URL.createObjectURL(res.blob);
          setImgUrl(url);
          setIsImage(true);
        }
      } else if (/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(fileName)) {
        setIsImage(true);
      }
    });

    return () => {
      active = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [fileName]);

  return (
    <div className="p-2.5 bg-white/10 rounded-xl border border-white/15 shadow-md flex flex-col justify-between space-y-2 text-white">
      {imgUrl ? (
        <div
          onClick={onPreview}
          className="relative h-28 w-full bg-black/60 rounded-lg overflow-hidden group cursor-pointer border border-white/20"
          title="Klik untuk melihat foto bukti tanda terima ukuran penuh"
        >
          <img
            src={imgUrl}
            alt={fileName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-white text-xs font-bold">
            <span className="material-symbols-outlined text-base">visibility</span>
            <span>Pratinjau</span>
          </div>
        </div>
      ) : isImage ? (
        <div
          onClick={onPreview}
          className="h-24 w-full bg-black/30 rounded-lg border border-dashed border-white/30 flex flex-col items-center justify-center cursor-pointer text-cyan-200 hover:bg-white/10 transition"
        >
          <span className="material-symbols-outlined text-2xl text-cyan-400">photo_camera</span>
          <span className="text-[10.5px] font-semibold mt-1">Foto Tanda Terima</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 truncate pr-2 py-1">
          <span className="material-symbols-outlined text-base text-cyan-400">description</span>
          <span className="font-semibold text-white truncate text-xs">{fileName}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-1 pt-2 border-t border-white/10">
        <span className="text-[10.5px] font-semibold text-gray-200 truncate max-w-[130px]" title={fileName}>
          {fileName}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onPreview}
            className="px-2 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-0.5 cursor-pointer shadow-sm"
            title="Lihat langsung di aplikasi"
          >
            <span className="material-symbols-outlined text-[11px]">visibility</span>
            <span>Lihat</span>
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-0.5 cursor-pointer shadow-sm"
            title="Unduh berkas"
          >
            <span className="material-symbols-outlined text-[11px]">download</span>
            <span>Unduh</span>
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="p-1 text-rose-400 hover:text-rose-300 font-bold text-xs cursor-pointer ml-0.5"
            title="Hapus foto"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

// Sub-component for viewing files directly inside TaskDetailModal without force-downloading
const FilePreviewSubModal: React.FC<{
  fileName: string;
  category: string;
  title: string;
  bidang: string;
  noSurat?: string;
  catatan?: string;
  onClose: () => void;
  onDownload: (fileName: string) => void;
}> = ({ fileName, category, title, bidang, noSurat, catatan, onClose, onDownload }) => {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'pdf' | 'other'>('other');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    async function loadBlob() {
      setIsLoading(true);
      const res = await getStoredFileBlob(fileName);
      if (!active) return;

      if (res && res.blob) {
        createdUrl = URL.createObjectURL(res.blob);
        setFileUrl(createdUrl);

        if (res.mimeType.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(fileName)) {
          setFileType('image');
        } else if (res.mimeType === 'application/pdf' || /\.pdf$/i.test(fileName)) {
          setFileType('pdf');
        } else {
          setFileType('other');
        }
      } else {
        if (/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(fileName)) {
          setFileType('image');
        } else if (/\.pdf$/i.test(fileName)) {
          setFileType('pdf');
        } else {
          setFileType('other');
        }
      }
      setIsLoading(false);
    }

    loadBlob();

    return () => {
      active = false;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [fileName]);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 animate-fadeIn font-['Inter',sans-serif] text-white">
      <div className="bg-[#002845] rounded-2xl border border-cyan-500/40 shadow-2xl max-w-4xl w-full max-h-[94vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#003b5c] via-[#005f8e] to-[#003b5c] text-white px-5 py-3.5 flex justify-between items-center shrink-0 border-b border-white/15">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-300">
              {fileType === 'image' ? 'photo' : fileType === 'pdf' ? 'picture_as_pdf' : 'visibility'}
            </span>
            <h4 className="font-['Lora',serif] font-bold text-base text-white truncate max-w-[450px]">
              Pratinjau {category}: {fileName}
            </h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white text-lg font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 bg-black/30 space-y-4 overflow-y-auto flex-1 text-white">
          {isLoading ? (
            <div className="p-10 text-center text-gray-300 bg-white/5 rounded-xl border border-white/15">
              <span className="material-symbols-outlined text-3xl animate-spin text-cyan-400">sync</span>
              <p className="text-xs font-semibold mt-2">Memuat berkas untuk pratinjau...</p>
            </div>
          ) : (
            <OfficialDocumentViewer
              data={{
                title: title || fileName,
                fileName: fileName,
                noSurat: noSurat,
                bidang: bidang,
                catatan: catatan,
                fileUrl: fileUrl,
                fileType: fileType,
              }}
              onDownload={() => onDownload(fileName)}
              onClose={onClose}
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#001e36] border-t border-white/15 flex justify-between items-center gap-2 shrink-0 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold cursor-pointer border border-white/20"
          >
            Tutup Pratinjau
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openInGoogleDrive(fileName)}
              className="px-3.5 py-2 bg-[#00a3e0] hover:bg-[#008bc2] text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-sm">cloud</span>
              <span>Google Drive</span>
            </button>
            <button
              type="button"
              onClick={() => onDownload(fileName)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Unduh File</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [noSurat, setNoSurat] = useState(task.noSurat || '');
  const [selectedBidangOption, setSelectedBidangOption] = useState<string>(
    ['Legalisasi Operasional', 'Tata Kelola Rapat', 'Manajemen Korespondensi'].includes(task.bidang)
      ? task.bidang
      : '__TAMBAH_BARU__'
  );
  const [customBidang, setCustomBidang] = useState<string>(
    ['Legalisasi Operasional', 'Tata Kelola Rapat', 'Manajemen Korespondensi'].includes(task.bidang)
      ? ''
      : task.bidang
  );
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
      const filesArray = Array.from(e.target.files) as File[];
      filesArray.forEach((f: File) => registerUploadedFile(f));
      const newFileNames = filesArray.map((f: File) => f.name);

      if (type === 'draft') {
        setDraftPekerjaan((prev) => [...prev, ...newFileNames]);
      } else if (type === 'dokumen') {
        setBuktiDokumen((prev) => [...prev, ...newFileNames]);
      } else {
        setBuktiSuratDiterima((prev) => [...prev, ...newFileNames]);
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

  const finalBidang =
    selectedBidangOption === '__TAMBAH_BARU__'
      ? customBidang.trim() || 'Bidang Umum'
      : selectedBidangOption;

  const handleDownloadFile = (fileName: string) => {
    downloadStoredFile(fileName, {
      title,
      noSurat: noSurat || task.noSurat,
      bidang: finalBidang,
      catatan,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...task,
      title,
      noSurat: noSurat.trim() || task.noSurat || `012/SIPATI/2026`,
      bidang: finalBidang,
      pj: pj.trim() ? pj.trim() : '—',
      status,
      catatan,
      draftPekerjaan,
      buktiDokumen,
      buktiSuratDiterima,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-[620px] bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/20 my-8 max-h-[90vh] flex flex-col font-['Inter',sans-serif] text-white">
        {/* Header Bar */}
        <div className="bg-[#003b5c]/90 backdrop-blur-md text-white px-6 py-4 flex justify-between items-center flex-shrink-0 border-b border-white/10">
          <div>
            <span className="text-[10px] font-mono tracking-widest text-cyan-300 uppercase block font-bold">
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
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-white">
          {/* NAMA PEKERJAAN / SURAT & NOMOR SURAT */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-[11px] tracking-[0.08em] uppercase text-cyan-300 mb-1.5">
                NAMA PEKERJAAN / SURAT
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black/40 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 font-['Inter',sans-serif]"
                placeholder="Judul pekerjaan atau nama surat..."
                required
              />
            </div>
            <div>
              <label className="block font-semibold text-[11px] tracking-[0.08em] uppercase text-cyan-300 mb-1.5">
                NOMOR SURAT
              </label>
              <input
                type="text"
                value={noSurat}
                onChange={(e) => setNoSurat(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/20 rounded-xl font-mono text-[12px] text-cyan-300 font-semibold focus:outline-none focus:border-cyan-400 placeholder-gray-500"
                placeholder="e.g. 045/SK/PAN-RI/2026"
              />
            </div>
          </div>

          {/* BIDANG & PENANGGUNG JAWAB */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[11px] tracking-[0.08em] uppercase text-cyan-300 mb-1.5">
                BIDANG PEKERJAAN
              </label>
              <select
                value={selectedBidangOption}
                onChange={(e) => setSelectedBidangOption(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#002845] border border-white/20 rounded-xl text-[13.5px] text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
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
                    placeholder="Nama bidang pekerjaan baru..."
                    className="w-full px-3.5 py-2 bg-black/50 border border-cyan-400/50 rounded-xl font-['Inter',sans-serif] text-[13px] text-cyan-200 placeholder-gray-400 focus:outline-none focus:border-cyan-300"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block font-semibold text-[11px] tracking-[0.08em] uppercase text-cyan-300 mb-1.5">
                PENANGGUNG JAWAB (PJ)
              </label>
              <input
                type="text"
                value={pj}
                onChange={(e) => setPj(e.target.value)}
                placeholder="Nama PJ (e.g. Drs. Ahmad Yani)"
                className="w-full px-3.5 py-2.5 bg-black/40 border border-white/20 rounded-xl text-[13.5px] text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* STATUS PEKERJAAN Toggle Buttons */}
          <div>
            <label className="block font-semibold text-[11px] tracking-[0.08em] uppercase text-cyan-300 mb-1.5">
              STATUS PEKERJAAN
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('BELUM')}
                className={`py-2.5 px-3 rounded-xl font-mono text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
                  status === 'BELUM'
                    ? 'bg-rose-500/30 border-2 border-rose-400 text-rose-200 shadow-md'
                    : 'bg-white/10 border border-white/15 text-gray-300 hover:bg-white/20'
                }`}
              >
                BELUM
              </button>
              <button
                type="button"
                onClick={() => setStatus('PROSES')}
                className={`py-2.5 px-3 rounded-xl font-mono text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
                  status === 'PROSES'
                    ? 'bg-amber-500/30 border-2 border-amber-400 text-amber-200 shadow-md'
                    : 'bg-white/10 border border-white/15 text-gray-300 hover:bg-white/20'
                }`}
              >
                PROSES
              </button>
              <button
                type="button"
                onClick={() => setStatus('SELESAI')}
                className={`py-2.5 px-3 rounded-xl font-mono text-[11px] font-bold tracking-wider transition-all cursor-pointer ${
                  status === 'SELESAI'
                    ? 'bg-emerald-500/30 border-2 border-emerald-400 text-emerald-200 shadow-md'
                    : 'bg-white/10 border border-white/15 text-gray-300 hover:bg-white/20'
                }`}
              >
                SELESAI
              </button>
            </div>
          </div>

          {/* CATATAN */}
          <div>
            <label className="block font-semibold text-[11px] tracking-[0.08em] uppercase text-cyan-300 mb-1.5">
              CATATAN PEKERJAAN
            </label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan tambahan..."
              className="w-full px-3.5 py-2.5 bg-black/40 border border-white/20 rounded-xl text-[13.5px] text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="border-t border-white/15 pt-5 space-y-6">
            {/* 1. DRAFT PEKERJAAN */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-semibold text-[11px] tracking-[0.08em] uppercase text-rose-300 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">edit_note</span>
                  DRAFT PEKERJAAN (KONSEP DOKUMEN)
                </label>
                <span className="text-[10px] font-mono text-gray-300 font-bold bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                  {draftPekerjaan.length} Berkas
                </span>
              </div>

              {draftPekerjaan.length > 0 ? (
                <div className="space-y-2 mb-3">
                  {draftPekerjaan.map((fileName, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/15 shadow-md text-xs text-white"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="material-symbols-outlined text-base text-rose-400">
                          description
                        </span>
                        <span className="font-semibold text-white truncate">
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
                          className="px-2.5 py-1.5 bg-[#003b5c] hover:bg-[#005f8e] text-cyan-200 border border-cyan-400/30 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            visibility
                          </span>
                          <span>Lihat</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(fileName)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            download
                          </span>
                          <span>Unduh</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(fileName, 'draft')}
                          className="p-1 text-rose-400 hover:text-rose-300 font-bold text-xs cursor-pointer ml-1"
                          title="Hapus draft"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic mb-2">
                  Belum ada draft pekerjaan yang diunggah.
                </p>
              )}

              <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-rose-400/40 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 transition-colors cursor-pointer text-center group">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-rose-300 text-lg">
                    note_add
                  </span>
                  <span className="text-[12px] font-bold text-rose-200 group-hover:text-white">
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
              <div className="flex items-center justify-between mb-2">
                <label className="font-semibold text-[11px] tracking-[0.08em] uppercase text-emerald-300 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  BUKTI DOKUMEN SELESAI
                </label>
                <span className="text-[10px] font-mono text-gray-300 font-bold bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                  {buktiDokumen.length} Berkas
                </span>
              </div>

              {buktiDokumen.length > 0 ? (
                <div className="space-y-2 mb-3">
                  {buktiDokumen.map((fileName, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/15 shadow-md text-xs text-white"
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="material-symbols-outlined text-base text-emerald-400">
                          task_check
                        </span>
                        <span className="font-semibold text-white truncate">
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
                          className="px-2.5 py-1.5 bg-[#003b5c] hover:bg-[#005f8e] text-cyan-200 border border-cyan-400/30 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            visibility
                          </span>
                          <span>Lihat</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(fileName)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            download
                          </span>
                          <span>Unduh</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(fileName, 'dokumen')}
                          className="p-1 text-rose-400 hover:text-rose-300 font-bold text-xs cursor-pointer ml-1"
                          title="Hapus dokumen"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic mb-2">
                  Belum ada bukti dokumen selesai.
                </p>
              )}

              <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-emerald-400/40 rounded-xl bg-emerald-950/20 hover:bg-emerald-950/40 transition-colors cursor-pointer text-center group">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-300 text-lg">
                    attach_file
                  </span>
                  <span className="text-[12px] font-bold text-emerald-200 group-hover:text-white">
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

            {/* 3. BUKTI SURAT DITERIMA (TANDA TERIMA) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-semibold text-[11px] tracking-[0.08em] uppercase text-sky-300 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">mark_email_read</span>
                  BUKTI SURAT DITERIMA (TANDA TERIMA - FOTO / BERKAS)
                </label>
                <span className="text-[10px] font-mono text-gray-300 font-bold bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                  {buktiSuratDiterima.length} Foto / Berkas
                </span>
              </div>

              {buktiSuratDiterima.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                  {buktiSuratDiterima.map((fileName, idx) => (
                    <ReceiptPhotoItem
                      key={idx}
                      fileName={fileName}
                      onPreview={() =>
                        setActivePreview({
                          fileName,
                          category: 'Bukti Surat Diterima',
                        })
                      }
                      onDownload={() => handleDownloadFile(fileName)}
                      onRemove={() => handleRemoveFile(fileName, 'tandaTerima')}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic mb-2">
                  Belum ada foto / bukti tanda terima surat yang diunggah.
                </p>
              )}

              <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-sky-400/40 rounded-xl bg-sky-950/20 hover:bg-sky-950/40 transition-colors cursor-pointer text-center group">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sky-300 text-lg">
                    add_a_photo
                  </span>
                  <span className="text-[12px] font-bold text-sky-200 group-hover:text-white">
                    + Unggah Multi Foto Tanda Terima / Bukti Surat Diterima
                  </span>
                </div>
                <span className="text-[10.5px] text-gray-300 mt-0.5">
                  Dapat memilih &amp; mengunggah lebih dari 1 foto sekaligus (.jpg, .png, .pdf)
                </span>
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  multiple
                  onChange={(e) => handleFileUpload(e, 'tandaTerima')}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-white/15 flex items-center justify-between gap-3">
            {onDelete ? (
              <button
                type="button"
                onClick={() => onDelete(task.id)}
                className="px-4 py-2.5 bg-rose-500/20 hover:bg-rose-600 text-rose-200 hover:text-white border border-rose-500/30 rounded-xl text-[12px] font-semibold transition-colors cursor-pointer"
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
                className="px-5 py-2.5 bg-white/10 border border-white/20 hover:bg-white/20 text-white rounded-xl text-[12px] font-semibold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#00a3e0] hover:bg-[#008bc2] text-white rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-cyan-500/25 cursor-pointer active:scale-95"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* SUB-MODAL FOR REAL DIRECT IN-APP FILE & PHOTO PREVIEW */}
      {activePreview && (
        <FilePreviewSubModal
          fileName={activePreview.fileName}
          category={activePreview.category}
          title={title}
          bidang={finalBidang}
          noSurat={task.noSurat}
          catatan={catatan}
          onClose={() => setActivePreview(null)}
          onDownload={handleDownloadFile}
        />
      )}
    </div>
  );
};
