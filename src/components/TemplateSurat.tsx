import React, { useState, useRef } from 'react';
import { TemplateItem, TaskStatus, ArchiveItem } from '../types';
import { downloadStoredFile, registerUploadedFile } from '../utils/fileStorage';
import { DocumentViewerModal } from './DocumentViewerModal';
import { addActivityLog, addNotification } from '../utils/activityNotificationStore';

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
  const [viewerItem, setViewerItem] = useState<ArchiveItem | null>(null);

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
    backupFiles: [],
  });

  const handleOpenDetailModal = (tpl: TemplateItem) => {
    setSelectedTemplate(tpl);
    const files = tpl.backupFiles && tpl.backupFiles.length > 0
      ? tpl.backupFiles
      : (tpl.backupFile ? [tpl.backupFile] : []);
    setFormData({ ...tpl, backupFiles: files, backupFile: files[0] || '' });
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
      backupFiles: [],
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
    addActivityLog('Menyimpan Template Surat', formData.title, 'create');
    addNotification('Template Surat Tersimpan', `Template "${formData.title}" telah diperbarui & disimpan di Pustaka.`, 'template_added');
    setIsModalOpen(false);
  };

  const handleDelete = (idToDelete?: string, titleToDelete?: string) => {
    const id = idToDelete || selectedTemplate?.id;
    const title = titleToDelete || formData.title || 'Template';
    if (!id) return;

    if (onDeleteTemplate) {
      onDeleteTemplate(id);
    }
    addActivityLog('Menghapus Template Surat', title, 'delete');
    if (isModalOpen && selectedTemplate?.id === id) {
      setIsModalOpen(false);
    }
  };

  const handleDownload = (tpl?: TemplateItem, fileNameOverride?: string) => {
    const t = tpl || formData;
    if (fileNameOverride) {
      downloadStoredFile(fileNameOverride, {
        title: t.title || 'Template Surat',
        noSurat: t.code || 'TPL/SIPATI/2026',
        bidang: t.category,
        catatan: t.description,
      });
    } else {
      const files = t.backupFiles && t.backupFiles.length > 0
        ? t.backupFiles
        : (t.backupFile ? [t.backupFile] : []);
      if (files.length > 0) {
        files.forEach((file) => {
          downloadStoredFile(file, {
            title: t.title || 'Template Surat',
            noSurat: t.code || 'TPL/SIPATI/2026',
            bidang: t.category,
            catatan: t.description,
          });
        });
      } else {
        const fileName = `${t.title || 'Template_Surat'}.doc`;
        downloadStoredFile(fileName, {
          title: t.title || 'Template Surat',
          noSurat: t.code || 'TPL/SIPATI/2026',
          bidang: t.category,
          catatan: t.description,
        });
      }
    }
    addActivityLog('Mengunduh Template Surat', t.title || 'Template Surat', 'archive');
  };

  const handleOpenViewer = (tpl: TemplateItem, fileNameOverride?: string) => {
    const files = tpl.backupFiles && tpl.backupFiles.length > 0
      ? tpl.backupFiles
      : (tpl.backupFile ? [tpl.backupFile] : []);
    const fileName = fileNameOverride || files[0] || `${tpl.title || 'Template_Surat'}.doc`;
    const ext = fileName.split('.').pop()?.toLowerCase() || 'docx';

    const archiveItem: ArchiveItem = {
      id: `${tpl.id}-${Date.now()}`,
      title: `${tpl.title}${files.length > 1 ? ` (${fileName})` : ''}`,
      noSurat: tpl.code || `0${Math.floor(Math.random() * 90 + 10)}/TPL/SIPATI/2026`,
      bidang: tpl.category,
      date: new Date().toISOString().split('T')[0],
      status: 'TERVERIFIKASI',
      fileType: ext,
      description: tpl.description || 'Format naskah dinas resmi.',
      fileName: fileName,
    };
    setViewerItem(archiveItem);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFileNames: string[] = [];
      (Array.from(files) as File[]).forEach((uploadedFile: File) => {
        registerUploadedFile(uploadedFile);
        newFileNames.push(uploadedFile.name);
      });

      const currentFiles = formData.backupFiles && formData.backupFiles.length > 0
        ? formData.backupFiles
        : (formData.backupFile ? [formData.backupFile] : []);

      const updatedFiles = Array.from(new Set([...currentFiles, ...newFileNames]));

      setFormData({
        ...formData,
        backupFiles: updatedFiles,
        backupFile: updatedFiles[0] || '',
      });
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleRemoveFile = (fileNameToRemove: string) => {
    const currentFiles = formData.backupFiles && formData.backupFiles.length > 0
      ? formData.backupFiles
      : (formData.backupFile ? [formData.backupFile] : []);

    const updatedFiles = currentFiles.filter((f) => f !== fileNameToRemove);

    setFormData({
      ...formData,
      backupFiles: updatedFiles,
      backupFile: updatedFiles[0] || '',
    });
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
                      <div className="space-y-1 flex-1">
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

                          {tpl.backupFiles && tpl.backupFiles.length > 0 ? (
                            <div className="flex flex-wrap items-center gap-1.5 my-1">
                              {tpl.backupFiles.map((file, idx) => (
                                <span
                                  key={idx}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenViewer(tpl, file);
                                  }}
                                  className="text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 px-2 py-0.5 rounded-md text-[11px] font-medium flex items-center gap-1 cursor-pointer transition shadow-sm"
                                  title={`Lihat ${file}`}
                                >
                                  <span className="material-symbols-outlined text-[13px]">attach_file</span>
                                  <span className="truncate max-w-[160px]">{file}</span>
                                </span>
                              ))}
                            </div>
                          ) : tpl.backupFile ? (
                            <span className="text-emerald-300 font-medium flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">attach_file</span>
                              {tpl.backupFile}
                            </span>
                          ) : (
                            <span className="text-gray-400">dokumen standar template</span>
                          )}
                        </div>
                      </div>

                      {/* Middle: Target Pekerjaan */}
                      <div className="text-xs text-gray-300 md:text-right max-w-xs">
                        <span className="text-gray-400">Pekerjaan: </span>
                        <span className="font-semibold text-white">{tpl.targetPekerjaan || '-'}</span>
                      </div>

                      {/* Right: Actions (Lihat Berkas, Unduh, Hapus) & Status */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenViewer(tpl);
                          }}
                          className="px-2.5 py-1.5 bg-[#00a3e0] hover:bg-[#008bc2] text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow cursor-pointer transition active:scale-95"
                          title="Lihat Berkas Dokumen"
                        >
                          <span className="material-symbols-outlined text-xs">visibility</span>
                          <span className="hidden sm:inline">Lihat</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(tpl);
                          }}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow cursor-pointer transition active:scale-95"
                          title="Unduh Berkas Template"
                        >
                          <span className="material-symbols-outlined text-xs">download</span>
                          <span className="hidden sm:inline">Unduh</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(tpl.id, tpl.title);
                          }}
                          className="p-1.5 bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900/80 hover:text-white rounded-lg transition cursor-pointer active:scale-95"
                          title="Hapus Template Ini"
                        >
                          <span className="material-symbols-outlined text-xs">delete</span>
                        </button>

                        <span className="border border-dashed border-cyan-400/50 text-cyan-300 bg-cyan-950/40 font-mono text-[11px] px-3 py-1 rounded-full font-bold tracking-wider inline-block uppercase ml-1">
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

              {/* BERKAS TEMPLATE & DOKUMEN LAMPIRAN (LEBIH DARI 1 DOKUMEN) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                    BERKAS TEMPLATE &amp; LAMPIRAN DOKUMEN
                  </label>
                  {formData.backupFiles && formData.backupFiles.length > 0 && (
                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-xs">check_circle</span>
                      {formData.backupFiles.length} Berkas Tersedia
                    </span>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                />

                {/* List of uploaded files */}
                {formData.backupFiles && formData.backupFiles.length > 0 ? (
                  <div className="space-y-2">
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {formData.backupFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-slate-950/80 rounded-xl border border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5"
                        >
                          <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
                            <span className="material-symbols-outlined text-cyan-400 text-xl shrink-0">
                              description
                            </span>
                            <div className="truncate">
                              <p className="text-xs font-bold text-white truncate">
                                {file}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                Berkas Dokumen Template #{idx + 1}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                            <button
                              type="button"
                              onClick={() => handleOpenViewer(formData, file)}
                              className="px-2.5 py-1.5 bg-[#00a3e0] hover:bg-[#008bc2] text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-sm"
                              title="Lihat Berkas"
                            >
                              <span className="material-symbols-outlined text-sm">visibility</span>
                              <span>Lihat</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownload(formData, file)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-sm"
                              title="Unduh Berkas Ini"
                            >
                              <span className="material-symbols-outlined text-sm">download</span>
                              <span>Unduh</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(file)}
                              className="p-1.5 bg-rose-950/60 border border-rose-500/40 text-rose-300 hover:bg-rose-900/80 hover:text-white rounded-lg transition cursor-pointer"
                              title="Hapus Dokumen Ini"
                            >
                              <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-dashed border-cyan-400/50 rounded-xl text-xs font-bold text-cyan-300 flex items-center justify-center gap-2 cursor-pointer transition"
                    >
                      <span className="material-symbols-outlined text-sm">add_circle</span>
                      <span>+ Tambah Dokumen Lainnya</span>
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-white/25 bg-slate-950/60 hover:bg-slate-900 rounded-xl p-5 text-center cursor-pointer transition flex items-center justify-center gap-2 group"
                  >
                    <span className="material-symbols-outlined text-slate-400 group-hover:text-cyan-400 transition text-2xl">
                      upload_file
                    </span>
                    <div className="text-left">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wide group-hover:text-cyan-300 transition block">
                        UNGGAH BERKAS TEMPLATE &amp; LAMPIRAN
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal block">
                        Dapat memilih lebih dari 1 dokumen (.DOC, .DOCX, .PDF, .ZIP, dll)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-cyan-500/30 p-4 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => handleDelete(formData.id, formData.title)}
                className="px-3.5 py-2 bg-rose-900/40 border border-rose-500/40 text-rose-300 hover:bg-rose-900/70 rounded-xl text-xs font-bold tracking-wide transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>🗑</span> Hapus Template
              </button>

              <div className="flex flex-wrap items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => handleOpenViewer(formData)}
                  className="px-3.5 py-2 bg-[#00a3e0] hover:bg-[#008bc2] text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-md"
                >
                  <span className="material-symbols-outlined text-sm">visibility</span>
                  Lihat Berkas
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload(formData)}
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

      {/* DOCUMENT VIEWER MODAL FOR TEMPLATES */}
      {viewerItem && (
        <DocumentViewerModal
          item={viewerItem}
          onClose={() => setViewerItem(null)}
          onDownload={(item) =>
            downloadStoredFile(item.fileName || item.title, {
              title: item.title,
              noSurat: item.noSurat,
              bidang: item.bidang,
              catatan: item.description,
            })
          }
        />
      )}
    </div>
  );
};
