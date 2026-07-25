import React, { useState } from 'react';
import { BannerConfig } from '../types';

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
  const [form, setForm] = useState<BannerConfig>({
    enabled: banner.enabled ?? true,
    title: banner.title || '📢 PENGUMUMAN RESMI & INFORMASI PANITIA',
    message: banner.message || '',
    type: banner.type || 'info',
    linkUrl: banner.linkUrl || '',
    linkText: banner.linkText || 'Buka Tautan',
    imageUrl: banner.imageUrl || '',
    dismissible: banner.dismissible ?? true,
  });

  const [imagePreview, setImagePreview] = useState<string>(banner.imageUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Judul banner wajib diisi.');
      return;
    }

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

    const nextBanner: BannerConfig = {
      ...form,
      imageUrl: imagePreview,
      updatedAt: new Date().toISOString(),
      updatedBy,
    };

    onSave(nextBanner);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0b1329] border border-cyan-500/40 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="p-5 border-b border-white/15 bg-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <span className="material-symbols-outlined text-xl">campaign</span>
            </div>
            <div>
              <h3 className="font-['Lora',serif] text-lg font-bold text-white">
                Pengaturan Banner Dashboard Admin
              </h3>
              <p className="text-xs text-cyan-300 font-mono">
                Kelola pengumuman, headline, dan informasi penting di halaman utama dashboard
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 font-['Inter',sans-serif]">
          {/* Enable / Disable Banner Switch */}
          <div className="p-4 bg-white/5 border border-white/15 rounded-xl flex items-center justify-between">
            <div>
              <span className="font-bold text-sm text-white block">Status Penayangan Banner</span>
              <span className="text-xs text-gray-300">
                Tampilkan banner pengumuman ini secara langsung di bagian atas Dashboard.
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00a3e0]"></div>
            </label>
          </div>

          {/* Type / Theme Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300 mb-2">
              Tema &amp; Karakter Banner
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'info', label: 'Informasi', icon: 'info', color: 'border-cyan-400 bg-cyan-950/60 text-cyan-300' },
                { id: 'success', label: 'Sukses', icon: 'check_circle', color: 'border-emerald-400 bg-emerald-950/60 text-emerald-300' },
                { id: 'warning', label: 'Peringatan', icon: 'warning', color: 'border-amber-400 bg-amber-950/60 text-amber-300' },
                { id: 'urgent', label: 'Penting / Urgent', icon: 'error', color: 'border-rose-400 bg-rose-950/60 text-rose-300' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setForm({ ...form, type: item.id as any })}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    form.type === item.id
                      ? `${item.color} ring-2 ring-cyan-400/50`
                      : 'border-white/15 bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Judul Banner */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300 mb-1">
              Judul Pengumuman Banner <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Contoh: 📢 PENGUMUMAN PANITIA & TENGGAT VERIFIKASI DOKUMEN"
              className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl font-['Lora',serif] text-sm text-white focus:outline-none focus:border-[#00a3e0]"
            />
          </div>

          {/* Pesan Banner */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300 mb-1">
              Isi Pesan / Rincian Pengumuman
            </label>
            <textarea
              rows={3}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Tuliskan isi pengumuman atau instruksi kerja untuk seluruh tim di sini..."
              className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#00a3e0] resize-none"
            />
          </div>

          {/* Action Link & Text */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300 mb-1">
                Tautan / URL Tombol Aksi (Opsional)
              </label>
              <input
                type="text"
                value={form.linkUrl || ''}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                placeholder="https://drive.google.com/..."
                className="w-full px-3.5 py-2 bg-white/10 border border-white/20 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#00a3e0]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300 mb-1">
                Label Teks Tombol (Opsional)
              </label>
              <input
                type="text"
                value={form.linkText || ''}
                onChange={(e) => setForm({ ...form, linkText: e.target.value })}
                placeholder="Contoh: Buka Berkas Google Drive"
                className="w-full px-3.5 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white focus:outline-none focus:border-[#00a3e0]"
              />
            </div>
          </div>

          {/* Gambar / Mascot / Graphic Image for Banner */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300 mb-1">
              Gambar Gambar / Banner Artwork (Opsional)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {imagePreview && (
                <div className="w-24 h-20 rounded-xl bg-slate-900 border border-white/20 overflow-hidden shrink-0 relative group">
                  <img src={imagePreview} alt="Banner Graphic" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImagePreview('')}
                    className="absolute top-1 right-1 bg-black/70 text-rose-400 p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    title="Hapus gambar"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </div>
              )}
              <div className="flex-1 space-y-2 w-full">
                <input
                  type="text"
                  value={imagePreview}
                  onChange={(e) => setImagePreview(e.target.value)}
                  placeholder="Masukkan URL gambar banner (https://...)"
                  className="w-full px-3.5 py-2 bg-white/10 border border-white/20 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-[#00a3e0]"
                />
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg cursor-pointer transition border border-white/20">
                  <span className="material-symbols-outlined text-sm">upload_file</span>
                  <span>Unggah Gambar Dari Perangkat...</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 3 * 1024 * 1024) {
                          alert('Ukuran gambar banner maksimal 3MB.');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const res = event.target?.result as string;
                          if (res) setImagePreview(res);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Dismissible Toggle */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
            <input
              type="checkbox"
              id="dismissibleCheck"
              checked={form.dismissible}
              onChange={(e) => setForm({ ...form, dismissible: e.target.checked })}
              className="w-4 h-4 accent-[#00a3e0] cursor-pointer"
            />
            <label htmlFor="dismissibleCheck" className="text-xs text-gray-300 cursor-pointer">
              Izinkan pengguna lain untuk menutup/menyembunyikan sementara banner ini di sesi mereka
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
