import React, { useState, useEffect } from 'react';
import { ArchiveItem } from '../types';
import { openInGoogleDrive, getStoredFileBlob } from '../utils/fileStorage';
import { OfficialDocumentViewer } from './OfficialDocumentViewer';

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
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'pdf' | 'other'>('other');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    async function loadBlob() {
      setIsLoading(true);
      const targetName = item.fileName || item.title;
      const res = await getStoredFileBlob(targetName, {
        title: item.title,
        noSurat: item.noSurat,
        bidang: item.bidang,
        catatan: item.description,
      });
      if (!active) return;

      if (res && res.blob) {
        createdUrl = URL.createObjectURL(res.blob);
        setFileUrl(createdUrl);

        if (res.mimeType.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(targetName)) {
          setFileType('image');
        } else if (res.mimeType === 'application/pdf' || /\.pdf$/i.test(targetName)) {
          setFileType('pdf');
        } else {
          setFileType('other');
        }
      } else {
        // Fallback by extension name
        if (/\.(jpg|jpeg|png|webp|gif|svg)$/i.test(targetName)) {
          setFileType('image');
        } else if (/\.pdf$/i.test(targetName)) {
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
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [item.fileName, item.title, item.noSurat, item.bidang, item.description]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-[900px] bg-[#002845] rounded-2xl shadow-2xl overflow-hidden border border-cyan-500/40 my-4 max-h-[94vh] flex flex-col text-white font-['Inter',sans-serif]">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#003b5c] via-[#005f8e] to-[#003b5c] text-white px-5 py-3.5 flex justify-between items-center shrink-0 border-b border-white/15">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-300">
              {fileType === 'image' ? 'photo' : fileType === 'pdf' ? 'picture_as_pdf' : 'description'}
            </span>
            <h3 className="font-['Lora',serif] text-base sm:text-lg font-bold text-white truncate max-w-[550px]">
              Pratinjau Dokumen Direct: {item.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 bg-black/40 flex-1">
          {isLoading ? (
            <div className="p-12 text-center text-gray-300 space-y-2 bg-white/10 rounded-xl border border-white/20">
              <span className="material-symbols-outlined text-4xl animate-spin text-cyan-300">
                sync
              </span>
              <p className="text-xs font-semibold">Memuat berkas dari database...</p>
            </div>
          ) : (
            <OfficialDocumentViewer
              data={{
                title: item.title,
                fileName: item.fileName || (item.title.toLowerCase().endsWith(`.${(item.fileType || 'docx').toLowerCase()}`) ? item.title : `${item.title}.${item.fileType || 'docx'}`),
                noSurat: item.noSurat,
                bidang: item.bidang,
                description: item.description,
                date: item.date,
                status: item.status,
                fileUrl: fileUrl,
                fileType: fileType,
                fileSize: item.fileSize,
              }}
              onDownload={() => onDownload(item)}
              onClose={onClose}
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-[#001e36] border-t border-white/15 flex flex-wrap justify-between items-center gap-2 shrink-0 text-xs">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 border border-white/20 hover:bg-white/20 text-white rounded-xl font-semibold transition-colors cursor-pointer"
          >
            Tutup Pratinjau
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openInGoogleDrive(`${item.title}.${item.fileType}`)}
              className="px-4 py-2 bg-[#00a3e0] hover:bg-[#008bc2] text-white rounded-xl font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-sm">cloud</span>
              <span>Buka di Google Drive</span>
            </button>
            <button
              onClick={() => onDownload(item)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Unduh Berkas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


