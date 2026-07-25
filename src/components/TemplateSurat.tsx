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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#FFFDF8] p-6 rounded-2xl border border-[#E4DCC8] shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#57000f]/10 rounded-full text-xs font-bold text-[#57000f] mb-2">
            <span className="material-symbols-outlined text-sm">description</span>
            Pustaka Template Naskah Dinas Resmi
          </div>
          <h2 className="font-['Lora',serif] text-2xl md:text-3xl font-bold text-[#57000f]">
            Template Surat &amp; Dokumen
          </h2>
          <p className="text-xs md:text-sm text-[#574141] mt-1">
            Format baku tata naskah dinas kementerian untuk percepatan penyusunan surat panitia HUT RI Ke-81.
          </p>
        </div>

        <button
          onClick={handleAddNewTemplate}
          className="px-5 py-2.5 bg-[#b62230] hover:bg-[#57000f] text-white rounded-xl text-xs md:text-sm font-bold transition shadow-sm flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
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
            <div key={cat} className="rounded-xl overflow-hidden border border-[#E4DCC8] bg-[#FFFDF8] shadow-2xs">
              {/* Category Header */}
              <div className="bg-[#7a1220] text-white px-5 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2 font-[#FFFDF8]">
                  <span className="text-base">{getCategoryIcon(cat)}</span>
                  <h3 className="font-['Lora',serif] text-base md:text-lg font-bold tracking-wide">
                    {cat}
                  </h3>
                </div>
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-[#57000f] text-[#FFFDF8] border border-white/20">
                  {catTemplates.length} template
                </span>
              </div>

              {/* Template Items List */}
              <div className="divide-y divide-[#E4DCC8]/60">
                {catTemplates.length > 0 ? (
                  catTemplates.map((tpl) => (
                    <div
                      key={tpl.id}
                      onClick={() => handleOpenDetailModal(tpl)}
                      className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 px-5 hover:bg-[#fcf8ee] transition cursor-pointer gap-3 group"
                    >
                      {/* Left: Title and subtitles */}
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm md:text-base text-[#1c1c16] group-hover:text-[#b62230] transition">
                          {tpl.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#6E6A61]">
                          {tpl.googleDocsUrl ? (
                            <span className="text-blue-700 font-medium flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">link</span>
                              ada tautan Google Docs
                            </span>
                          ) : (
                            <span className="text-[#8e8d8a]">belum ada tautan Google Docs</span>
                          )}

                          {tpl.backupFile && (
                            <span className="text-[#574141] font-medium flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">attach_file</span>
                              berkas template terlampir
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Middle: Target Pekerjaan */}
                      <div className="text-xs text-[#574141] md:text-right max-w-md">
                        <span className="text-[#8e8d8a]">Pekerjaan: </span>
                        <span className="font-semibold text-[#1c1c16]">{tpl.targetPekerjaan || '-'}</span>
                      </div>

                      {/* Right: Status Dashed Pill */}
                      <div className="shrink-0">
                        <span className="border border-dashed border-[#8e8d8a] text-[#8e8d8a] bg-transparent font-mono text-[11px] px-3.5 py-1 rounded-full font-bold tracking-wider inline-block uppercase">
                          {tpl.status || 'BELUM'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-[#8e8d8a]">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#FFFDF8] rounded-2xl border border-[#E4DCC8] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-[#7a1220] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <h3 className="font-['Lora',serif] text-lg md:text-xl font-bold tracking-wide">
                Detail Template
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1 font-['Inter',sans-serif]">
              {/* NAMA TEMPLATE */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6A61] mb-1">
                  NAMA TEMPLATE
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Template Undangan Rapat"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E4DCC8] rounded-lg text-sm text-[#222] font-medium focus:ring-2 focus:ring-[#b62230]/20 focus:border-[#b62230] outline-none"
                />
              </div>

              {/* BIDANG */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6A61] mb-1">
                  BIDANG
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E4DCC8] rounded-lg text-sm text-[#222] font-medium focus:ring-2 focus:ring-[#b62230]/20 focus:border-[#b62230] outline-none cursor-pointer"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6A61] mb-1">
                  PEKERJAAN YANG DITUJU
                </label>
                <input
                  type="text"
                  value={formData.targetPekerjaan}
                  onChange={(e) => setFormData({ ...formData, targetPekerjaan: e.target.value })}
                  placeholder="e.g. Koordinasi rapat internal/eksternal"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E4DCC8] rounded-lg text-sm text-[#222] font-medium focus:ring-2 focus:ring-[#b62230]/20 focus:border-[#b62230] outline-none"
                />
                
                {/* Status Dashed Pill Indicator */}
                <div className="mt-2.5 flex items-center gap-2">
                  <span className="text-xs text-[#8e8d8a]">Status Pekerjaan:</span>
                  <button
                    type="button"
                    onClick={toggleStatus}
                    className="border border-dashed border-[#8e8d8a] text-[#8e8d8a] hover:bg-slate-100 font-mono text-[11px] px-3.5 py-1 rounded-full font-bold tracking-wider inline-flex items-center gap-1 cursor-pointer transition uppercase"
                  >
                    <span>{formData.status}</span>
                    <span className="material-symbols-outlined text-xs">sync</span>
                  </button>
                </div>
              </div>

              {/* DESKRIPSI */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6A61] mb-1">
                  DESKRIPSI
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Format undangan rapat koordinasi internal/eksternal."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E4DCC8] rounded-lg text-sm text-[#222] focus:ring-2 focus:ring-[#b62230]/20 focus:border-[#b62230] outline-none"
                />
              </div>

              {/* TAUTAN GOOGLE DOCS */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6A61] mb-1">
                  TAUTAN GOOGLE DOCS
                </label>
                <input
                  type="text"
                  value={formData.googleDocsUrl || ''}
                  onChange={(e) => setFormData({ ...formData, googleDocsUrl: e.target.value })}
                  placeholder="Tempel tautan Google Docs di sini..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E4DCC8] rounded-lg text-sm text-[#222] focus:ring-2 focus:ring-[#b62230]/20 focus:border-[#b62230] outline-none"
                />
              </div>

              {/* BERKAS TEMPLATE (OPSIONAL) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6A61]">
                    BERKAS TEMPLATE (OPSIONAL)
                  </label>
                  {formData.backupFile && (
                    <span className="text-[11px] font-semibold text-[#2F6B44] flex items-center gap-1">
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
                  <div className="p-3.5 bg-[#fdfaf2] rounded-xl border-2 border-[#E4DCC8] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="material-symbols-outlined text-[#b62230] text-xl">
                        description
                      </span>
                      <div>
                        <p className="text-xs font-bold text-[#1c1c16] truncate">
                          {formData.backupFile}
                        </p>
                        <p className="text-[10px] text-[#8e8d8a]">
                          Berkas Template Resmi
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                      <button
                        type="button"
                        onClick={handlePreviewFile}
                        className="px-3 py-1.5 bg-[#57000f] text-white hover:bg-[#8e1925] rounded-md text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        <span>Lihat Berkas</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 bg-white border border-[#E4DCC8] text-[#574141] hover:bg-[#f1eee5] rounded-md text-xs font-semibold cursor-pointer transition"
                      >
                        Ganti
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#E4DCC8] bg-[#fdfaf2] hover:bg-[#f8f2e4] rounded-xl p-4 text-center cursor-pointer transition flex items-center justify-center gap-2 group"
                  >
                    <span className="material-symbols-outlined text-[#8e8d8a] group-hover:text-[#57000f] transition">
                      attach_file
                    </span>
                    <span className="text-xs font-bold text-[#574141] uppercase tracking-wide">
                      UNGGAH BERKAS TEMPLATE (.DOC, .PDF, .ZIP)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-[#E4DCC8] p-4 bg-[#fcf8ee] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={handleDelete}
                className="w-full sm:w-auto px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-bold tracking-wide transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>🗑</span> Hapus Template
              </button>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handlePreviewFile}
                  className="px-3.5 py-2 bg-[#57000f] text-white hover:bg-[#7a1220] rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  Lihat Berkas
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <span>↓</span> Unduh Berkas
                </button>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2 bg-[#b62230] hover:bg-[#57000f] text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
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
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn font-['Inter',sans-serif]">
          <div className="bg-[#FFFDF8] rounded-xl border border-[#E4DCC8] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#57000f] text-white px-5 py-3.5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-200">
                  visibility
                </span>
                <h4 className="font-['Lora',serif] font-bold text-base text-white">
                  Pratinjau Template Dokumen
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
                  FORMAT BAKU TATA NASKAH DINAS (SIPATI 2026)
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-[#E4DCC8] space-y-1.5 shadow-2xs">
                <div className="flex justify-between items-start">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#b62230]">
                    TEMPLATE NASKAH RESMI
                  </span>
                  <span className="px-2 py-0.5 border border-[#2F6B44] text-[#2F6B44] font-mono text-[10px] font-bold rounded">
                    VERIFIKASI PANITIA
                  </span>
                </div>
                <h5 className="font-bold text-sm text-[#1c1c16]">
                  {activePreview.title}
                </h5>
                <p className="text-[11px] text-[#574141]">
                  Bidang Operasional: <span className="font-semibold">{activePreview.category}</span>
                </p>
                <p className="text-[11px] text-[#574141]">
                  Nama Berkas: <span className="font-mono font-semibold">{activePreview.fileName}</span>
                </p>
              </div>

              {/* Simulated Document Body Content */}
              <div className="bg-white p-4 rounded-lg border border-dashed border-[#8e8d8a] text-[#574141] text-[11.5px] leading-relaxed space-y-2">
                <p className="font-semibold text-[#1c1c16]">
                  Ketentuan Format &amp; Petunjuk Pengisian Template:
                </p>
                <p>
                  {activePreview.description ||
                    'Naskah baku ini disusun sesuai pedoman Peraturan Menteri Sekretaris Negara tentang Tata Naskah Dinas Perayaan HUT Kemerdekaan RI Ke-81 Tahun 2026.'}
                </p>
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded text-[11px] text-amber-900 mt-2 space-y-1">
                  <p className="font-bold">PETUNJUK:</p>
                  <p>1. Salin format template ke Google Docs atau aplikasi pengolah kata Anda.</p>
                  <p>2. Lakukan penyesuaian pada nomor surat, tanggal, dan nama penanggung jawab.</p>
                </div>
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
                  handleDownload();
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
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
