import React, { useState, useEffect, useRef } from 'react';
import { renderAsync } from 'docx-preview';
import * as pdfjsLib from 'pdfjs-dist';
import { openInGoogleDrive, getStoredFileBlob } from '../utils/fileStorage';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

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

// Dedicated High-Performance PDF Viewer Component
const PdfViewer: React.FC<{ blob: Blob | null; url?: string | null; onDownload: () => void }> = ({
  blob,
  url,
  onDownload,
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfDocRef = useRef<pdfjsLib.PDFDocumentProxy | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadPdf = async () => {
      setLoading(true);
      setError(null);
      try {
        let pdfData: Uint8Array | ArrayBuffer | string | null = null;
        if (blob) {
          pdfData = await blob.arrayBuffer();
        } else if (url) {
          pdfData = url;
        }

        if (!pdfData) {
          throw new Error('Berkas PDF tidak ditemukan.');
        }

        const loadingTask = pdfjsLib.getDocument(
          typeof pdfData === 'string' ? { url: pdfData } : { data: pdfData }
        );

        const pdf = await loadingTask.promise;
        if (!isMounted) return;
        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);
        setCurrentPage(1);
        setLoading(false);
      } catch (err: any) {
        console.error('PDF.js load error:', err);
        if (isMounted) {
          setError(err?.message || 'Gagal memuat pratinjau PDF.');
          setLoading(false);
        }
      }
    };

    loadPdf();
    return () => {
      isMounted = false;
    };
  }, [blob, url]);

  // Render current page onto canvas
  useEffect(() => {
    let isMounted = true;
    const renderPage = async () => {
      if (!pdfDocRef.current || !canvasRef.current) return;
      try {
        const page = await pdfDocRef.current.getPage(currentPage);
        if (!isMounted || !canvasRef.current) return;
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
      } catch (renderErr) {
        console.error('Error rendering PDF page:', renderErr);
      }
    };

    if (!loading && !error && pdfDocRef.current) {
      renderPage();
    }
  }, [currentPage, scale, loading, error]);

  if (loading) {
    return (
      <div className="w-full h-[520px] flex flex-col items-center justify-center bg-slate-900 text-cyan-300 gap-3 rounded-xl border border-white/20">
        <span className="material-symbols-outlined text-4xl animate-spin text-cyan-400">
          sync
        </span>
        <p className="text-xs font-semibold">Memuat berkas PDF otentik dengan PDF.js Engine...</p>
      </div>
    );
  }

  if (error || numPages === 0) {
    return (
      <div className="w-full h-[520px] flex flex-col items-center justify-center p-8 text-center text-slate-200 bg-slate-900 rounded-xl space-y-4 border border-white/20">
        <span className="material-symbols-outlined text-5xl text-amber-500">
          picture_as_pdf
        </span>
        <h5 className="font-bold text-base text-white">Dokumen Berkas PDF Otentik</h5>
        <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed">
          Dokumen asli PDF ini tersimpan aman di SIPATI Cloud. Anda dapat membuka PDF secara langsung di tab baru atau mengunduhnya.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {url && (
            <button
              type="button"
              onClick={() => window.open(url, '_blank')}
              className="px-4 py-2 bg-[#00a3e0] hover:bg-[#008bc2] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg"
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              <span>Buka PDF di Tab Baru</span>
            </button>
          )}
          <button
            type="button"
            onClick={onDownload}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg"
          >
            <span className="material-symbols-outlined text-sm">download</span>
            <span>Unduh File PDF Original</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[520px] flex flex-col items-center bg-slate-950 rounded-xl overflow-hidden border border-slate-700">
      {/* PDF Toolbar Controls */}
      <div className="w-full bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-200 shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-cyan-400 text-base">picture_as_pdf</span>
          <span className="font-bold text-white text-xs">PDF Document Viewer</span>
          <span className="bg-slate-800 border border-slate-700 text-cyan-300 px-2.5 py-0.5 rounded font-mono text-[11px] font-semibold">
            Halaman {currentPage} / {numPages}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation */}
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded font-bold transition cursor-pointer flex items-center gap-1 border border-slate-700"
          >
            <span className="material-symbols-outlined text-xs">arrow_back</span>
            <span className="hidden sm:inline">Sebelumnya</span>
          </button>
          <button
            type="button"
            disabled={currentPage >= numPages}
            onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded font-bold transition cursor-pointer flex items-center gap-1 border border-slate-700"
          >
            <span className="hidden sm:inline">Selanjutnya</span>
            <span className="material-symbols-outlined text-xs">arrow_forward</span>
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded border border-slate-700 ml-2 text-[11px]">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.6, s - 0.2))}
              className="hover:text-cyan-300 px-1 font-bold"
              title="Perkecil"
            >
              -
            </button>
            <span className="font-mono text-cyan-200">{Math.round(scale * 100)}%</span>
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
              className="hover:text-cyan-300 px-1 font-bold"
              title="Perbesar"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Scroll Area */}
      <div className="w-full flex-1 overflow-auto p-4 flex justify-center items-start bg-slate-900/90 min-h-[460px]">
        <canvas ref={canvasRef} className="shadow-2xl rounded border border-slate-700 bg-white max-w-full" />
      </div>
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

          {data.fileUrl && (
            <button
              type="button"
              onClick={() => window.open(data.fileUrl!, '_blank')}
              className="px-3 py-1.5 bg-[#00a3e0] hover:bg-[#008bc2] text-white rounded-lg font-bold text-xs flex items-center gap-1 transition shadow cursor-pointer"
              title="Buka File di Tab Baru"
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              <span className="hidden sm:inline">Tab Baru</span>
            </button>
          )}

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
              /* High-Fidelity PDF Viewer using PDF.js */
              <PdfViewer blob={rawBlob} url={data.fileUrl} onDownload={onDownload} />
            ) : isImage && data.fileUrl ? (
              /* Image Native Viewer */
              <div className="p-4 flex flex-col items-center justify-center min-h-[480px]">
                <img
                  src={data.fileUrl}
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


