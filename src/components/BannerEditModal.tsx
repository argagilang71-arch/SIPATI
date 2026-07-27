import React, { useState } from 'react';
import { BannerConfig } from '../types';
import { compressBannerImage } from '../utils/storageUtils';

interface BannerEditModalProps {
  banner: BannerConfig;
  onClose: () => void;
  onSave: (updatedBanner: BannerConfig) => void;
}

export const BannerEditModal: React.FC<BannerEditModalProps> = ({
  banner,
  onClose,
  onSave,
}) => {
  const [enabled, setEnabled] = useState<boolean>(banner.enabled ?? true);
  const [dismissible, setDismissible] = useState<boolean>(banner.dismissible ?? true);

  // Initialize up to 5 images from banner.images or banner.imageUrl
  const initialImages = Array.isArray(banner.images) && banner.images.length > 0
    ? banner.images.filter(x => Boolean(x)).slice(0, 5)
    : banner.imageUrl
    ? [banner.imageUrl]
    : [];

  const [images, setImages] = useState<string[]>(initialImages);

  const handleAddImage = (url: string) => {
    if (!url || !url.trim()) return;
    const cleanCurrent = images.filter(x => Boolean(x && x.trim()));
    if (cleanCurrent.length >= 5) {
      alert('Maksimal 5 foto banner.');
      return;
    }
    handleUpdateImage(cleanCurrent.length, url.trim());
  };

  const handleUpdateImage = (index: number, newUrl: string) => {
    setImages(prev => {
      const updated = [...prev];
      while (updated.length <= index) {
        updated.push('');
      }
      updated[index] = newUrl;
      return updated;
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveImage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === images.length - 1)
    ) {
      return;
    }
    const updated = [...images];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setImages(updated);
  };

  const handleFileUploadForSlot = async (index: number, file: File) => {
    try {
      const compressed = await compressBannerImage(file);
      if (compressed) {
        handleUpdateImage(index, compressed);
      }
    } catch (err) {
      console.error('Error compressing banner image:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let updatedBy = 'Admin';
    try {
      const uStr = localStorage.getItem('sipati_current_user');
      if (uStr) {
        const u = JSON.parse(uStr);
        updatedBy = u.nama || u.username || 'Admin';
      }
    } catch {
      updatedBy = 'Admin';
    }

    const cleanImages = images.filter(img => Boolean(img && img.trim())).slice(0, 5);

    const nextBanner: BannerConfig = {
      ...banner,
      enabled,
      dismissible,
      images: cleanImages,
      imageUrl: cleanImages[0] || '',
      title: banner.title || 'Foto Banner Utama SIPATI',
      message: '',
      type: 'info',
      updatedAt: new Date().toISOString(),
      updatedBy,
    };

    onSave(nextBanner);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn font-['Inter',sans-serif]">
      <div className="bg-[#0b1329] border border-cyan-500/40 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-5 border-b border-white/15 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <span className="material-symbols-outlined text-xl">collections</span>
            </div>
            <div>
              <h3 className="font-['Lora',serif] text-lg font-bold text-white">
                Kelola Foto Banner Slide (Maks. 5 Foto)
              </h3>
              <p className="text-xs text-cyan-300 font-mono">
                Atur foto banner utama dashboard untuk pergeseran slide otomatis
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-white">
          {/* Status Penayangan Toggle */}
          <div className="p-4 bg-white/5 border border-white/15 rounded-xl flex items-center justify-between">
            <div>
              <span className="font-bold text-sm text-white block">Status Penayangan Banner Slide</span>
              <span className="text-xs text-gray-300">
                Aktifkan penayangan pergeseran slide foto banner di bagian atas Dashboard.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a3e0]"></div>
            </label>
          </div>

          {/* Banner Photo Slots (Up to 5) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                Daftar Foto Banner Slide ({images.length} / 5 Foto)
              </label>
              {images.length < 5 && (
                <label className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 rounded-lg text-xs font-bold transition cursor-pointer">
                  <span className="material-symbols-outlined text-sm">add_photo_alternate</span>
                  <span>Tambah Foto Ke-{images.length + 1}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUploadForSlot(images.length, file);
                    }}
                  />
                </label>
              )}
            </div>

            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, idx) => {
                const imgUrl = images[idx];
                const hasImage = Boolean(imgUrl);

                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row items-center gap-3.5 ${
                      hasImage
                        ? 'bg-white/10 border-cyan-500/40'
                        : 'bg-white/5 border-dashed border-white/20'
                    }`}
                  >
                    {/* Badge Slot Number */}
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center shrink-0 font-mono text-xs font-bold text-cyan-300">
                      #{idx + 1}
                    </div>

                    {/* Thumbnail Preview */}
                    {hasImage ? (
                      <div className="w-24 h-16 rounded-lg bg-black/60 border border-white/20 overflow-hidden shrink-0 flex items-center justify-center relative">
                        <img src={imgUrl} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-24 h-16 rounded-lg bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center text-gray-400 shrink-0">
                        <span className="material-symbols-outlined text-xl">image</span>
                        <span className="text-[9px] font-mono">Kosong</span>
                      </div>
                    )}

                    {/* Inputs & Upload Control */}
                    <div className="flex-1 w-full space-y-1.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={imgUrl || ''}
                          onChange={(e) => handleUpdateImage(idx, e.target.value)}
                          placeholder={hasImage ? 'URL Gambar Banner...' : `Tambahkan URL atau unggah Foto #${idx + 1}...`}
                          className="flex-1 px-3 py-1.5 bg-black/40 border border-white/20 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-[#00a3e0]"
                        />
                        <label className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-xs font-semibold cursor-pointer transition shrink-0 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">upload</span>
                          <span className="hidden sm:inline">Pilih File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUploadForSlot(idx, file);
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Action Controls */}
                    {hasImage && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 text-gray-300 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Geser Ke Atas"
                        >
                          <span className="material-symbols-outlined text-base">arrow_upward</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveImage(idx, 'down')}
                          disabled={idx === images.length - 1}
                          className="p-1 text-gray-300 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Geser Ke Bawah"
                        >
                          <span className="material-symbols-outlined text-base">arrow_downward</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1 text-rose-400 hover:text-rose-300 cursor-pointer ml-1"
                          title="Hapus Foto Ini"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dismissible Option */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
            <input
              type="checkbox"
              id="dismissibleCheck"
              checked={dismissible}
              onChange={(e) => setDismissible(e.target.checked)}
              className="w-4 h-4 accent-[#00a3e0] cursor-pointer"
            />
            <label htmlFor="dismissibleCheck" className="text-xs text-gray-300 cursor-pointer">
              Izinkan pengguna untuk menyembunyikan/menutup sementara slider banner ini
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-white/15 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#00a3e0] hover:bg-[#008bc2] text-white rounded-xl text-xs font-bold transition shadow-lg hover:shadow-cyan-500/25 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              <span>Simpan &amp; Terbitkan Banner</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
