import React, { useState, useEffect, useRef } from 'react';
import { renderAsync } from 'docx-preview';
import * as pdfjsLib from 'pdfjs-dist';
import { openInGoogleDrive, getStoredFileBlob } from '../utils/fileStorage';

// Configure PDF.js worker with exact matching version
if (pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version || '6.1.200'}/build/pdf.worker.min.mjs`;
}

export interface DocumentPreviewData {
  title: string;
  fileName: string;
  noSurat?: string;
  bidang: string;
  catatan?: string;
  description?: string;
  date?: string;
  status?: string;
  fileUrl?: string | null;
  fileType?: string;
  fileSize?: string;
}

interface OfficialDocumentViewerProps {
  data: DocumentPreviewData;
  onDownload: () => void;
  onClose?: () => void;
}

// Dedicated PDF Viewer Component
const PdfViewer: React.FC<{
  blob: Blob | null;
  fileUrl?: string | null;
  fileName: string;
  onDownload: () => void;
  onOpenNewTab: () => void;
}> = ({ blob, fileUrl, fileName, onDownload, onOpenNewTab }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (fileUrl) {
      setPdfUrl(fileUrl);
    }
  }, [blob, fileUrl]);

  return (
    <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center p-2 bg-[#00182b] rounded-2xl border border-cyan-500/30 overflow-hidden">
      {pdfUrl ? (
        <div className="w-full h-full min-h-[500px] flex flex-col">
          <iframe
            src={pdfUrl}
            title={fileName}
            className="w-full h-[520px] rounded-xl border border-white/10 bg-slate-900"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#00223d] mt-2 rounded-xl border border-white/10 text-xs">
            <span className="text-cyan-200 font-mono truncate max-w-[320px]">
              📄 Dokumen Asli PDF: {fileName}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onOpenNewTab}
                className="px-3.5 py-1.5 bg-[#00a3e0] hover:bg-[#008bc2] text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
                <span>Buka Tab Baru</span>
              </button>
              <button
                type="button"
                onClick={onDownload}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Unduh File Asli</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-xl w-full flex flex-col items-center text-center space-y-4 p-6">
          <div className="w-16 h-16 rounded-2xl bg-[#033957] border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-xl">
            <span className="material-symbols-outlined text-3xl">picture_as_pdf</span>
          </div>
          <h3 className="font-['Lora',serif] font-bold text-xl text-white">
            Dokumen Asli PDF: {fileName}
          </h3>
          <p className="text-xs text-slate-300">
            Peramban membatasi pratinjau PDF langsung. Klik tombol untuk membuka atau mengunduh.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onOpenNewTab}
              className="px-5 py-2.5 bg-[#00a3e0] hover:bg-[#008bc2] text-white rounded-xl text-xs font-bold transition shadow"
            >
              Buka Tab Baru
            </button>
            <button
              type="button"
              onClick={onDownload}
              className="px-5 py-2.5 bg-[#00a05e] hover:bg-[#00874e] text-white rounded-xl text-xs font-bold transition shadow"
            >
              Unduh File PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const OfficialDocumentViewer: React.FC<OfficialDocumentViewerProps> = ({
  data,
  onDownload,
  onClose,
}) => {
  const [rawBlob, setRawBlob] = useState<Blob | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);
  const [docxError, setDocxError] = useState<boolean>(false);
  const docxContainerRef = useRef<HTMLDivElement>(null);

  const isImage =
    data.fileType === 'image' ||
    /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(data.fileName || data.title);

  const isPdf =
    data.fileType === 'pdf' ||
    /\.pdf$/i.test(data.fileName || data.title);

  const isDocx =
    data.fileType === 'docx' ||
    data.fileType === 'doc' ||
    /\.(docx|doc)$/i.test(data.fileName || data.title);

  const displayNoSurat = data.noSurat || '400.14.1.1/ /TAPEM SETDA KKR';
  const displayCatatan =
    data.catatan ||
    data.description ||
    'Pelaksanaan uraian tugas dan tata kelola korespondensi administrasi terpadu di lingkungan Bagian Tata Pemerintahan Sekretariat Daerah Kabupaten Kubu Raya.';

  // Load raw binary Blob from file registry or generator
  useEffect(() => {
    let isMounted = true;
    const fetchBlob = async () => {
      setIsLoadingFile(true);
      setDocxError(false);
      try {
        const res = await getStoredFileBlob(data.fileName || data.title, {
          title: data.title,
          noSurat: data.noSurat,
          bidang: data.bidang,
          catatan: displayCatatan,
        });
        if (isMounted && res?.blob) {
          setRawBlob(res.blob);
        }
      } catch (err) {
        console.error('Error fetching file blob:', err);
        if (isMounted) setDocxError(true);
      } finally {
        if (isMounted) setIsLoadingFile(false);
      }
    };

    fetchBlob();
    return () => {
      isMounted = false;
    };
  }, [data.fileName, data.title, data.noSurat, data.bidang, displayCatatan]);

  // Render DOCX using docx-preview when rawBlob is available
  useEffect(() => {
    if (isDocx && rawBlob && docxContainerRef.current) {
      docxContainerRef.current.innerHTML = '';
      setIsLoadingFile(true);
      renderAsync(rawBlob, docxContainerRef.current, undefined, {
        className: 'docx-view-page',
        inWrapper: true,
        ignoreWidth: false,
        ignoreHeight: false,
        ignoreFonts: false,
        breakPages: true,
        experimental: true,
        trimXmlDeclaration: true,
        useBase64URL: true,
      })
        .then(() => {
          setIsLoadingFile(false);
          setDocxError(false);
        })
        .catch((err) => {
          console.error('DOCX preview error:', err);
          setIsLoadingFile(false);
          setDocxError(true);
        });
    }
  }, [isDocx, rawBlob]);

  const handlePrint = () => {
    window.print();
  };

  const handleOpenNewTab = async () => {
    // 1. Synchronously open new tab to bypass popup blockers
    const targetWin = window.open('about:blank', '_blank');
    if (!targetWin) {
      onDownload();
      return;
    }

    try {
      // If fileUrl is a remote HTTP/HTTPS link, open directly
      if (data.fileUrl && (data.fileUrl.startsWith('http://') || data.fileUrl.startsWith('https://'))) {
        targetWin.location.href = data.fileUrl;
        return;
      }

      let activeBlob: Blob | null = rawBlob;

      // Check if fileUrl is a base64 Data URL
      if (!activeBlob && data.fileUrl && data.fileUrl.startsWith('data:')) {
        try {
          const arr = data.fileUrl.split(',');
          const mimeMatch = arr[0].match(/:(.*?);/);
          const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          activeBlob = new Blob([u8arr], { type: mime });
        } catch (e) {
          console.error('Failed to parse data URL:', e);
        }
      }

      // If still no blob, retrieve or generate via getStoredFileBlob
      if (!activeBlob) {
        const res = await getStoredFileBlob(data.fileName || data.title, {
          title: data.title,
          noSurat: data.noSurat,
          bidang: data.bidang,
          catatan: displayCatatan,
        });
        if (res?.blob) {
          activeBlob = res.blob;
        }
      }

      if (activeBlob) {
        const pdfBlobUrl = URL.createObjectURL(activeBlob);
        targetWin.location.href = pdfBlobUrl;
      } else {
        targetWin.document.write(`
          <div style="font-family: sans-serif; text-align: center; padding: 40px; background: #020c1b; color: white;">
            <h2>Dokumen Tidak Ditemukan</h2>
            <p style="color: #94a3b8;">Berkas PDF tidak dapat dimuat secara langsung.</p>
          </div>
        `);
      }
    } catch (err) {
      console.error('Failed to open document in new tab:', err);
      onDownload();
    }
  };

  return (
    <div className="flex flex-col h-full w-full font-['Inter',sans-serif] text-white">
      {/* Top Toolbar */}
      <div className="p-3 bg-[#003b5c] rounded-xl border border-cyan-500/40 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 shadow-md mb-3">
        {/* Left: Document Label */}
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 text-cyan-200 font-semibold">
          <span className="material-symbols-outlined text-cyan-300 text-base">
            {isImage ? 'image' : isPdf ? 'picture_as_pdf' : 'description'}
          </span>
          <span>
            Pratinjau Berkas File Asli ({isDocx ? 'DOCX' : isPdf ? 'PDF' : isImage ? 'GMB' : 'FILE'})
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition shadow cursor-pointer"
            title="Cetak Naskah"
          >
            <span className="material-symbols-outlined text-sm">print</span>
            <span className="hidden sm:inline">Cetak</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNewTab}
            className="px-3 py-1.5 bg-[#00a3e0] hover:bg-[#008bc2] text-white rounded-lg font-bold text-xs flex items-center gap-1 transition shadow cursor-pointer"
            title="Buka File di Tab Baru"
          >
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            <span className="hidden sm:inline">Tab Baru</span>
          </button>

          <button
            type="button"
            onClick={onDownload}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition shadow cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span>Unduh Berkas</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto min-h-[440px] max-h-[72vh] bg-black/60 rounded-2xl border border-white/15 p-3 sm:p-5 flex justify-center items-start">
        <div className="w-full h-full flex flex-col space-y-3">
          {/* Header Info Bar */}
          <div className="bg-[#001e36] text-white p-3.5 rounded-xl border border-white/20 shadow-lg flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/30 shrink-0">
                <span className="material-symbols-outlined text-xl">
                  {isImage ? 'image' : isPdf ? 'picture_as_pdf' : 'description'}
                </span>
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-white truncate max-w-[420px]">
                  {data.fileName || data.title}
                </h4>
                <p className="text-[11px] text-cyan-200 font-mono truncate">
                  No: {displayNoSurat} • Bidang: {data.bidang}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-emerald-950 border border-emerald-400/40 text-emerald-300 font-mono text-[10.5px] font-bold rounded-md">
                SAH OTENTIK
              </span>
            </div>
          </div>

          {/* Document Render Container */}
          <div className="flex-1 min-h-[480px] bg-slate-900 rounded-xl border border-white/20 overflow-hidden flex flex-col justify-center items-center relative">
            {isLoadingFile && (
              <div className="absolute inset-0 bg-slate-950/80 z-20 flex flex-col items-center justify-center gap-2 text-cyan-300">
                <span className="material-symbols-outlined text-3xl animate-spin">
                  sync
                </span>
                <span className="text-xs font-semibold">Mempersiapkan pratinjau berkas otentik...</span>
              </div>
            )}

            {isDocx ? (
              /* DOCX Viewer using docx-preview */
              <div className="w-full h-full min-h-[500px] overflow-auto bg-[#f0f2f5] p-3 sm:p-6 text-slate-900 font-sans">
                {docxError ? (
                  <div className="p-8 text-center text-slate-700 bg-white rounded-xl shadow border border-slate-300 space-y-3 max-w-lg mx-auto my-12">
                    <span className="material-symbols-outlined text-4xl text-amber-600">
                      description
                    </span>
                    <h5 className="font-bold text-base text-slate-900">Dokumen Naskah Word (.docx)</h5>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Dokumen asli ini dapat langsung diunduh atau dibuka di Microsoft Word / Google Drive untuk pengeditan penuh.
                    </p>
                    <button
                      type="button"
                      onClick={onDownload}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow"
                    >
                      Unduh File DOCX Original
                    </button>
                  </div>
                ) : (
                  <div
                    ref={docxContainerRef}
                    className="docx-wrapper max-w-[820px] mx-auto bg-white shadow-2xl rounded-lg p-6 sm:p-10 border border-slate-300 text-slate-900"
                  />
                )}
              </div>
            ) : isPdf ? (
              /* Dedicated PDF Viewer with New Tab Stream */
              <PdfViewer
                blob={rawBlob}
                fileUrl={data.fileUrl}
                fileName={data.fileName || data.title}
                onDownload={onDownload}
                onOpenNewTab={handleOpenNewTab}
              />
            ) : isImage ? (
              /* Image Native Viewer */
              <div className="p-4 flex flex-col items-center justify-center min-h-[480px]">
                <img
                  src={rawBlob ? URL.createObjectURL(rawBlob) : data.fileUrl || ''}
                  alt={data.fileName || data.title}
                  className="max-h-[520px] w-auto max-w-full object-contain rounded-lg shadow-2xl border border-white/20"
                />
                <p className="text-cyan-200 text-xs mt-3 font-mono flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-cyan-400">
                    image
                  </span>
                  <span>Gambar Dokumen Otentik: {data.fileName || data.title}</span>
                </p>
              </div>
            ) : (
              /* Default File Information & Direct Download Card */
              <div className="p-8 text-center text-white space-y-4 max-w-md">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/40">
                  <span className="material-symbols-outlined text-4xl">description</span>
                </div>
                <div>
                  <h5 className="font-bold text-base text-white">{data.fileName || data.title}</h5>
                  <p className="text-xs text-gray-300 mt-1">
                    Dokumen asli tersimpan dalam pangkalan data terintegrasi SIPATI
                  </p>
                </div>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={onDownload}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    <span>Unduh File Original</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openInGoogleDrive(data.fileName)}
                    className="px-4 py-2 bg-[#00a3e0] hover:bg-[#008bc2] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    <span className="material-symbols-outlined text-sm">cloud</span>
                    <span>Google Drive</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


