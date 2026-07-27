import React, { useState, useRef } from 'react';
import { TemplateItem, TaskStatus } from '../types';
import { downloadStoredFile, registerUploadedFile } from '../utils/fileStorage';

interface TemplateSuratProps {
  templates: TemplateItem[];
  onCreateTaskFromTemplate: (title: string, category: string) => void;
  onSaveTemplate?: (savedTpl: TemplateItem) => void;
  onDeleteTemplate?: (id: string) => void;
}

export const TemplateSurat: React.FC<TemplateSuratProps> = ({
  templates,
  onCreateTaskFromTemplate,
  onSaveTemplate,
  onDeleteTemplate,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activePreview, setActivePreview] = useState<{
    fileName: string;
    title: string;
    category: string;
    description: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state inside modal
  const [formData, setFormData] = useState<TemplateItem>({
    id: '',
    title: '',
    category: 'Legalisasi Operasional',
    targetPekerjaan: '',
    status: 'BELUM',
    description: '',
    googleDocsUrl: '',
    backupFile: '',
  });

  const handleOpenDetailModal = (tpl: TemplateItem) => {
    setSelectedTemplate(tpl);
    setFormData({ ...tpl });
    setIsModalOpen(true);
  };

  const handleAddNewTemplate = () => {
    const newTpl: TemplateItem = {
      id: `tpl-${Date.now()}`,
      title: '',
      category: 'Legalisasi Operasional',
      targetPekerjaan: '',
      status: 'BELUM',
      description: '',
      googleDocsUrl: '',
      backupFile: '',
      code: `TPL-${Math.floor(10 + Math.random() * 90)}`,
    };
    setSelectedTemplate(newTpl);
    setFormData(newTpl);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      alert('Nama template tidak boleh kosong.');
      return;
    }
    if (onSaveTemplate) {
      onSaveTemplate(formData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!selectedTemplate || !selectedTemplate.id) return;
    if (confirm(`Apakah Anda yakin ingin menghapus template "${formData.title}"?`)) {
      if (onDeleteTemplate) {
        onDeleteTemplate(selectedTemplate.id);
      }
      setIsModalOpen(false);
    }
  };

  const handleDownload = () => {
    const fileName = formData.backupFile || `${formData.title || 'Template_Surat'}.doc`;
    downloadStoredFile(fileName, {
      title: formData.title || 'Template Surat',
      noSurat: formData.code || 'TPL/SIPATI/2026',
      bidang: formData.category,
      catatan: formData.description,
    });
  };

  const handlePreviewFile = () => {
    const fileName = formData.backupFile || `${formData.title || 'Template_Surat'}.doc`;
    setActivePreview({
      fileName,
      title: formData.title || 'Template Surat',
      category: formData.category,
      description: formData.description || 'Format baku dokumen tata naskah dinas resmi.',
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const uploadedFile = files[0];
      registerUploadedFile(uploadedFile);
      setFormData({ ...formData, backupFile: uploadedFile.name });
    }
  };

  const toggleStatus = () => {
    const statuses: TaskStatus[] = ['BELUM', 'PROSES', 'SELESAI'];
    const currIndex = statuses.indexOf(formData.status);
    const nextStatus = statuses[(currIndex + 1) % statuses.length];
    setFormData({ ...formData, status: nextStatus });
  };

  // Group templates by category
  const categoriesList: string[] = Array.from(new Set(templates.map((t) => t.category)));
  // Default categories if empty
  if (!categoriesList.includes('Legalisasi Operasional')) categoriesList.push('Legalisasi Operasional');
  if (!categoriesList.includes('Tata Kelola Rapat')) categoriesList.push('Tata Kelola Rapat');
  if (!categoriesList.includes('Manajemen Korespondensi')) categoriesList.push('Manajemen Korespondensi');

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Legalisasi Operasional': return '📜';
      case 'Tata Kelola Rapat': return '🤝';
      case 'Manajemen Korespondensi': return '📄';
      default: return '📋';
    }
  };

  return (
    <div className="space-y-6 pb-12 font-['Inter',sans-serif]">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black/45 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-2xl text-white">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 border border-cyan-400/30 rounded-full text-xs font-bold text-cyan-300 mb-2">
            <span className="material-symbols-outlined text-sm">description</span>
            Pustaka Template Naskah Dinas Resmi
          </div>
          <h2 className="font-['Lora',serif] text-2xl md:text-3xl font-bold text-white">
            Template Surat &amp; Dokumen
          </h2>
          <p className="text-xs md:text-sm text-gray-300 mt-1">
            Format baku tata naskah dinas kementerian untuk percepatan penyusunan surat panitia.
          </p>
        </div>

        <button
          onClick={handleAddNewTemplate}
          className="px-5 py-2.5 bg-[#00a3e0] hover:bg-[#008bc2] text-white rounded-xl text-xs md:text-sm font-bold uppercase tracking-wider transition shadow-lg hover:shadow-cyan-500/25 flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Tambah Template Baru
        </button>
      </div>

      {/* Categories Grouped Display */}
      <div className="space-y-6">
        {categoriesList.map((cat) => {
          const catTemplates = templates.filter((t) => t.category === cat);
          return (
            <div key={cat} className="rounded-2xl overflow-hidden border border-white/20 bg-black/45 backdrop-blur-xl shadow-xl text-white">
              {/* Category Header */}
              <div className="bg-gradient-to-r from-[#003b5c]/90 via-[#005f8e]/90 to-[#003b5c]/90 border-b border-cyan-500/30 text-white px-5 py-3.5 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-2 text-white">
                  <span className="text-base text-cyan-300">{getCategoryIcon(cat)}</span>
                  <h3 className="font-['Lora',serif] text-base md:text-lg font-bold tracking-wide">
                    {cat}
                  </h3>
                </div>
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-cyan-950/60 text-cyan-200 border border-cyan-400/40">
                  {catTemplates.length} template
                </span>
              </div>

              {/* Template Items List */}
              <div className="divide-y divide-white/10">
                {catTemplates.length > 0 ? (
                  catTemplates.map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() => handleOpenDetailModal(tpl)}
                      className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 px-5 hover:bg-white/10 transition cursor-pointer gap-3 group"
                    >
                      {/* Left: Title and subtitles */}
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm md:text-base text-white group-hover:text-cyan-300 transition">
                          {tpl.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300">
                          {tpl.googleDocsUrl ? (
                            <span className="text-cyan-300 font-medium flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">link</span>
                              ada tautan Google Docs
                            </span>
                          ) : (
                            <span className="text-gray-400">belum ada tautan Google Docs</span>
                          )}

                          {tpl.backupFile && (
                            <span className="text-gray-200 font-medium flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">attach_file</span>
                              berkas template terlampir
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Middle: Target Pekerjaan */}
                      <div className="text-xs text-gray-300 md:text-right max-w-md">
                        <span className="text-gray-400">Pekerjaan: </span>
                        <span className="font-semibold text-white">{tpl.targetPekerjaan || '-'}</span>
                      </div>

                      {/* Right: Status Dashed Pill */}
                      <div className="shrink-0">
                        <span className="border border-dashed border-cyan-400/50 text-cyan-300 bg-cyan-950/40 font-mono text-[11px] px-3.5 py-1 rounded-full font-bold tracking-wider inline-block uppercase">
                          {tpl.status || 'BELUM'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-gray-400">
                    Belum ada template pada kategori ini.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAIL TEMPLATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-50 animate-fadeIn font-['Inter',sans-serif]">
          <div className="bg-[#011627] border border-cyan-500/30 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-white">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#002845] to-[#001f35] border-b border-cyan-500/30 text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 truncate">
                <span className="material-symbols-outlined text-cyan-400 text-2xl shrink-0">
                  description
                </span>
                <h3 className="font-['Lora',serif] text-base sm:text-xl font-bold tracking-wide text-white truncate">
                  Detail Template & Naskah Resmi
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer shrink-0 ml-2"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 font-['Inter',sans-serif] text-white">
              {/* NAMA TEMPLATE */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300 mb-1.5">
                  NAMA TEMPLATE
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Template Undangan Rapat"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/20 focus:border-cyan-400 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              {/* BIDANG */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300 mb-1.5">
                  BIDANG
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950/90 border border-white/20 focus:border-cyan-400 rounded-xl text-sm text-white outline-none cursor-pointer transition focus:ring-1 focus:ring-cyan-400"
                >
                  <option value="Legalisasi Operasional">Legalisasi Operasional</option>
                  <option value="Tata Kelola Rapat">Tata Kelola Rapat</option>
                  <option value="Manajemen Korespondensi">Manajemen Korespondensi</option>
                  <option value="Seksi Acara & Upacara">Seksi Acara & Upacara</option>
                  <option value="Logistik & Perlengkapan">Logistik & Perlengkapan</option>
                  <option value="Keuangan & Audit">Keuangan & Audit</option>
                </select>
              </div>

              {/* PEKERJAAN YANG DITUJU */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300 mb-1.5">
                  PEKERJAAN YANG DITUJU
                </label>
                <input
                  type="text"
                  value={formData.targetPekerjaan}
                  onChange={(e) => setFormData({ ...formData, targetPekerjaan: e.target.value })}
                  placeholder="e.g. Koordinasi rapat internal/eksternal"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/20 focus:border-cyan-400 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition focus:ring-1 focus:ring-cyan-400"
                />
                
                {/* Status Dashed Pill Indicator */}
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="text-xs text-slate-300 font-medium">Status Pekerjaan:</span>
                  <button
                    type="button"
                    onClick={toggleStatus}
                    className="border border-dashed border-cyan-400/60 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/60 font-mono text-[11px] px-3 py-1 rounded-full font-bold tracking-wider inline-flex items-center gap-1.5 cursor-pointer transition uppercase"
                  >
                    <span>{formData.status}</span>
                    <span className="material-symbols-outlined text-xs">sync</span>
                  </button>
                </div>
              </div>

              {/* DESKRIPSI */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300 mb-1.5">
                  DESKRIPSI
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Format undangan rapat koordinasi internal/eksternal."
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/20 focus:border-cyan-400 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              {/* TAUTAN GOOGLE DOCS */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300 mb-1.5">
                  TAUTAN GOOGLE DOCS
                </label>
                <input
                  type="text"
                  value={formData.googleDocsUrl || ''}
                  onChange={(e) => setFormData({ ...formData, googleDocsUrl: e.target.value })}
                  placeholder="Tempel tautan Google Docs di sini..."
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-white/20 focus:border-cyan-400 rounded-xl text-sm text-white placeholder-gray-500 outline-none transition focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              {/* BERKAS TEMPLATE (OPSIONAL) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                    BERKAS TEMPLATE (OPSIONAL)
                  </label>
                  {formData.backupFile && (
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      Tersedia
                    </span>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                {/* Uploaded File View & Action Box */}
                {formData.backupFile ? (
                  <div className="p-3.5 bg-slate-950/80 rounded-xl border border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="material-symbols-outlined text-cyan-400 text-xl shrink-0">
                        description
                      </span>
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">
                          {formData.backupFile}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Berkas Template Resmi
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                      <button
                        type="button"
                        onClick={handlePreviewFile}
                        className="px-3 py-1.5 bg-[#00a3e0] hover:bg-[#008bc2] text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-sm"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        <span>Lihat Berkas</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-slate-800 border border-white/20 text-slate-200 hover:bg-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition"
                      >
                        Ganti
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/25 bg-slate-950/60 hover:bg-slate-900 rounded-xl p-4 text-center cursor-pointer transition flex items-center justify-center gap-2 group"
                  >
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-cyan-400 transition">
                      attach_file
                    </span>
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wide group-hover:text-cyan-300 transition">
                      UNGGAH BERKAS TEMPLATE (.DOC, .PDF, .ZIP)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-cyan-500/30 p-4 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={handleDelete}
                className="px-3.5 py-2 bg-rose-900/40 border border-rose-500/40 text-rose-300 hover:bg-rose-900/70 rounded-xl text-xs font-bold tracking-wide transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>🗑</span> Hapus Template
              </button>

              <div className="flex flex-wrap items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={handlePreviewFile}
                  className="px-3.5 py-2 bg-[#00a3e0] hover:bg-[#008bc2] text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-md"
                >
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  Lihat Berkas
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-md"
                >
                  <span>↓</span> Unduh
                </button>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-white/20 text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-lg cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-MODAL FOR TEMPLATE PREVIEW (LIHAT BERKAS TEMPLATE) */}
      {activePreview && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 animate-fadeIn font-['Inter',sans-serif]">
          <div className="bg-[#011627] border border-cyan-500/30 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col text-white">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#002845] to-[#001f35] border-b border-cyan-500/30 text-white px-5 py-3.5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400">
                  visibility
                </span>
                <h4 className="font-['Lora',serif] font-bold text-base text-white">
                  Pratinjau Template Dokumen
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setActivePreview(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Preview Document Paper */}
            <div className="p-5 bg-slate-950 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
              <div className="border-b border-cyan-500/30 pb-3 text-center space-y-1">
                <p className="font-['Lora',serif] font-bold text-sm text-cyan-300 uppercase tracking-wide">
                  PANITIA PELAKSANA PERINGATAN HUT RI KE-81
                </p>
                <p className="font-mono text-[10px] text-slate-400">
                  FORMAT BAKU TATA NASKAH DINAS (SIPATI 2026)
                </p>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-white/15 space-y-2 shadow-md">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-[10px] uppercase font-bold text-cyan-400">
                    TEMPLATE NASKAH RESMI
                  </span>
                  <span className="px-2 py-0.5 border border-emerald-500/50 bg-emerald-950/40 text-emerald-300 font-mono text-[10px] font-bold rounded-md">
                    VERIFIKASI PANITIA
                  </span>
                </div>
                <h5 className="font-bold text-sm text-white">
                  {activePreview.title}
                </h5>
                <p className="text-[11px] text-slate-300">
                  Bidang Operasional: <span className="font-semibold text-cyan-300">{activePreview.category}</span>
                </p>
                <p className="text-[11px] text-slate-300">
                  Nama Berkas: <span className="font-mono font-semibold text-amber-300">{activePreview.fileName}</span>
                </p>
              </div>

              {/* Simulated Document Body Content */}
              <div className="bg-slate-900 p-4 rounded-xl border border-dashed border-white/25 text-slate-200 text-[11.5px] leading-relaxed space-y-2">
                <p className="font-semibold text-white">
                  Ketentuan Format &amp; Petunjuk Pengisian Template:
                </p>
                <p className="text-slate-300">
                  {activePreview.description ||
                    'Naskah baku ini disusun sesuai pedoman Peraturan Menteri Sekretaris Negara tentang Tata Naskah Dinas Perayaan HUT Kemerdekaan RI Ke-81 Tahun 2026.'}
                </p>
                <div className="p-3 bg-cyan-950/50 border border-cyan-500/30 rounded-lg text-[11px] text-cyan-200 mt-2 space-y-1">
                  <p className="font-bold text-cyan-300">PETUNJUK:</p>
                  <p>1. Salin format template ke Google Docs atau aplikasi pengolah kata Anda.</p>
                  <p>2. Lakukan penyesuaian pada nomor surat, tanggal, dan nama penanggung jawab.</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950/90 border-t border-cyan-500/30 flex justify-between items-center shrink-0">
              <button
                type="button"
                onClick={() => setActivePreview(null)}
                className="px-4 py-2 border border-white/20 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDownload();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
              >
                <span className="material-symbols-outlined text-sm">
                  download
                </span>
                <span>Unduh Template</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
