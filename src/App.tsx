import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ViewMode,
  TaskItem,
  ArchiveItem,
  TemplateItem,
  ProposalItem,
  TaskStatus,
} from './types';
import {
  INITIAL_TASKS,
  INITIAL_ARCHIVES,
  INITIAL_TEMPLATES,
  INITIAL_PROPOSALS,
} from './mockData';

// Components
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { DaftarPekerjaan } from './components/DaftarPekerjaan';
import { TaskDetailModal } from './components/TaskDetailModal';
import { ArsipDigital } from './components/ArsipDigital';
import { RingkasanDashboard } from './components/RingkasanDashboard';
import { TemplateSurat } from './components/TemplateSurat';
import { ProposalModal } from './components/ProposalModal';
import { DocumentViewerModal } from './components/DocumentViewerModal';
import { SendEmailModal } from './components/SendEmailModal';
import { HelpModal } from './components/HelpModal';
import { PengaturanView } from './components/PengaturanView';
import { AppsScriptView } from './components/AppsScriptView';
import { downloadStoredFile } from './utils/fileStorage';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [requireLogin, setRequireLogin] = useState<boolean>(true);

  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [archives, setArchives] = useState<ArchiveItem[]>(INITIAL_ARCHIVES);
  const [templates, setTemplates] = useState<TemplateItem[]>(INITIAL_TEMPLATES);
  const [proposals, setProposals] = useState<ProposalItem[]>(INITIAL_PROPOSALS);

  // Global search & UI states
  const [globalSearch, setGlobalSearch] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals state
  const [activeTaskForModal, setActiveTaskForModal] = useState<TaskItem | null>(null);
  const [activeArchiveForViewer, setActiveArchiveForViewer] = useState<ArchiveItem | null>(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [isSendEmailModalOpen, setIsSendEmailModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);

  // Helper for floating banner notification
  const showBanner = (msg: string) => {
    setNotificationBanner(msg);
    setTimeout(() => {
      setNotificationBanner(null);
    }, 3500);
  };

  // Helper to synchronize completed tasks directly into archives
  const syncTaskToArchive = (task: TaskItem, currentArchives: ArchiveItem[]): ArchiveItem[] => {
    if (task.status === 'SELESAI') {
      const allFiles = [
        ...(task.buktiDokumen || []),
        ...(task.buktiSuratDiterima || []),
        ...(task.draftPekerjaan || []),
      ];
      const hasPdf = allFiles.some((f) => f.toLowerCase().endsWith('.pdf'));
      const hasZip = allFiles.some((f) => f.toLowerCase().endsWith('.zip') || f.toLowerCase().endsWith('.rar'));
      const fileType: 'pdf' | 'doc' | 'zip' = hasPdf ? 'pdf' : hasZip ? 'zip' : 'doc';

      const existingIndex = currentArchives.findIndex(
        (a) => a.taskId === task.id || a.title === task.title || (a.noSurat && task.noSurat && a.noSurat === task.noSurat)
      );

      const formattedNoSurat = task.noSurat || `0${Math.floor(Math.random() * 80) + 10}/SIPATI/VIII/2026`;

      const updatedArchItem: ArchiveItem = {
        id: existingIndex >= 0 ? currentArchives[existingIndex].id : `arch-${task.id}`,
        taskId: task.id,
        title: task.title,
        noSurat: formattedNoSurat,
        bidang: task.bidang,
        date: new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
        status: 'TERVERIFIKASI',
        fileType,
        description:
          task.catatan ||
          'Dokumen naskah dinas hasil pekerjaan yang telah diselesaikan dan terverifikasi di Google Drive SIPATI.',
        fileSize: allFiles.length > 0 ? `${(allFiles.length * 1.2 + 0.8).toFixed(1)} MB` : '1.8 MB',
      };

      if (existingIndex >= 0) {
        const next = [...currentArchives];
        next[existingIndex] = updatedArchItem;
        return next;
      } else {
        return [updatedArchItem, ...currentArchives];
      }
    } else {
      // If task is no longer SELESAI, remove its auto-archive entry
      return currentArchives.filter((a) => a.taskId !== task.id);
    }
  };

  // Task Handlers
  const handleSaveTask = (updatedTask: TaskItem) => {
    const exists = tasks.some((t) => t.id === updatedTask.id);
    const nextTasks = exists
      ? tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      : [updatedTask, ...tasks];

    const nextArchives = syncTaskToArchive(updatedTask, archives);

    setTasks(nextTasks);
    setArchives(nextArchives);
    setActiveTaskForModal(null);

    if (updatedTask.status === 'SELESAI') {
      showBanner(
        `Pekerjaan "${updatedTask.title}" telah diselesaikan & otomatis terdaftar di Arsip Digital (No. Surat: ${updatedTask.noSurat}).`
      );
    } else {
      showBanner(`Perubahan pekerjaan tersimpan.`);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
    setArchives(archives.filter((a) => a.taskId !== taskId));
    setActiveTaskForModal(null);
    showBanner('Pekerjaan berhasil dihapus.');
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const updatedTask: TaskItem = { ...targetTask, status: newStatus };
    const updatedTasks = tasks.map((t) => (t.id === taskId ? updatedTask : t));
    const nextArchives = syncTaskToArchive(updatedTask, archives);

    setTasks(updatedTasks);
    setArchives(nextArchives);

    if (newStatus === 'SELESAI') {
      showBanner(
        `Pekerjaan "${updatedTask.title}" selesai & otomatis diarsipkan dengan No. Surat: ${updatedTask.noSurat}.`
      );
    } else {
      showBanner(`Status pekerjaan diperbarui.`);
    }
  };

  const handleCreateNewTask = () => {
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: '',
      bidang: 'Legalisasi Operasional',
      pj: '—',
      status: 'BELUM',
      catatan: '',
      buktiDokumen: [],
      buktiSuratDiterima: [],
      noSurat: `0${tasks.length + 11}/SIPATI/VIII/2026`,
      dateCreated: new Date().toISOString().split('T')[0],
    };
    setActiveTaskForModal(newTask);
  };

  const handleCreateTaskFromTemplate = (title: string, category: string) => {
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title,
      bidang: category,
      pj: 'Drs. H. Mulyadi',
      status: 'PROSES',
      catatan: 'Draf dibuat dari template surat resmi.',
      buktiDokumen: [],
      buktiSuratDiterima: [],
      noSurat: `0${tasks.length + 12}/TPL/VIII/2026`,
      dateCreated: new Date().toISOString().split('T')[0],
    };
    setTasks([newTask, ...tasks]);
    setCurrentView('pekerjaan');
    showBanner(`Pekerjaan baru "${title}" berhasil dibuat dari template.`);
  };

  const handleSaveTemplate = (savedTpl: TemplateItem) => {
    setTemplates((prev) => {
      const idx = prev.findIndex((t) => t.id === savedTpl.id);
      if (idx >= 0) {
        const nextArr = [...prev];
        nextArr[idx] = savedTpl;
        return nextArr;
      }
      return [savedTpl, ...prev];
    });
    showBanner(`Template "${savedTpl.title}" berhasil disimpan.`);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    showBanner('Template berhasil dihapus.');
  };

  // Proposal submit
  const handleSubmitProposal = (proposal: ProposalItem) => {
    setProposals([proposal, ...proposals]);
    setIsProposalModalOpen(false);
    showBanner(`Proposal "${proposal.judul}" telah diajukan.`);
  };

  // Add Archive item
  const handleAddArchive = () => {
    const newArch: ArchiveItem = {
      id: `arch-${Date.now()}`,
      title: 'Nota Kesepakatan Lintas Sektor HUT RI 81',
      noSurat: `0${archives.length + 50}/NK/PAN-RI/VIII/2026`,
      bidang: 'Legalisasi Operasional',
      date: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      status: 'TERVERIFIKASI',
      fileType: 'pdf',
      description: 'Dokumen kesepakatan sinergi pengamanan dan protokol.',
      fileSize: '3.1 MB',
    };
    setArchives([newArch, ...archives]);
    showBanner('Dokumen arsip baru berhasil diunggah.');
  };

  // Downloads
  const handleDownloadReportPdf = () => {
    downloadStoredFile('Laporan_Eksekutif_Administrasi_SIPATI.pdf', {
      title: 'Laporan Eksekutif Administrasi Bagian Tata Pemerintahan',
      noSurat: '001/LAP-EKS/SIPATI/VIII/2026',
      bidang: 'Sekretariat Daerah Tata Pemerintahan',
    });
    showBanner('Buku Laporan Digital Otomatis (PDF) berhasil diunduh.');
  };

  const handleDownloadArchiveFile = (item: ArchiveItem) => {
    const cleanTitle = item.title.replace(/[\/\\:*?"<>|]/g, '_');
    downloadStoredFile(`${cleanTitle}.${item.fileType}`, {
      title: item.title,
      noSurat: item.noSurat,
      bidang: item.bidang,
    });
    showBanner(`Mengunduh berkas salinan: ${cleanTitle}.${item.fileType}`);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('landing');
    showBanner('Anda telah keluar dari sesi akun SIPATI.');
  };

  // Render standalone pages without sidebar if Landing or Login
  if (currentView === 'landing') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <LandingPage
            onEnterApp={() => {
              if (requireLogin && !isAuthenticated) {
                setCurrentView('login');
              } else {
                setCurrentView('pekerjaan');
              }
            }}
            onOpenLogin={() => setCurrentView('login')}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  if (currentView === 'login') {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="login"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          <LoginPage
            onLoginSuccess={() => {
              setIsAuthenticated(true);
              setCurrentView('pekerjaan');
              showBanner('Login Berhasil! Selamat datang di SIPATI.');
            }}
            onBackToLanding={() => setCurrentView('landing')}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="bg-[#fdf9f0] min-h-screen text-[#1c1c16] font-['Inter',sans-serif] flex digital-paper-texture">
      {/* Persistent Left Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={(v) => {
          setCurrentView(v);
          setGlobalSearch('');
        }}
        onOpenProposalModal={() => setIsProposalModalOpen(true)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main App Content Area */}
      <div className="flex-1 md:ml-[250px] flex flex-col min-h-screen">
        {/* Top App Bar */}
        <Header
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onDownloadReport={handleDownloadReportPdf}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          onOpenHelpModal={() => setIsHelpModalOpen(true)}
        />

        {/* Floating Banner Notification */}
        {notificationBanner && (
          <div className="fixed top-20 right-6 z-50 bg-[#57000f] text-white px-5 py-3 rounded-lg shadow-xl border border-[#ffdad9] text-xs font-['Inter',sans-serif] font-semibold flex items-center gap-2.5 animate-bounce">
            <span className="material-symbols-outlined text-sm text-[#ff8386]">
              check_circle
            </span>
            <span>{notificationBanner}</span>
          </div>
        )}

        {/* Main View Canvas */}
        <main className="flex-1 pt-24 px-4 md:px-[34px] pb-12 w-full max-w-[1200px] mx-auto overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              {currentView === 'pekerjaan' && (
                <DaftarPekerjaan
                  tasks={tasks}
                  onOpenTaskDetail={(task) => setActiveTaskForModal(task)}
                  onAddTask={handleCreateNewTask}
                  onUpdateStatus={handleUpdateTaskStatus}
                />
              )}

              {currentView === 'arsip' && (
                <ArsipDigital
                  archives={archives}
                  onViewArchive={(item) => setActiveArchiveForViewer(item)}
                  onDownloadArchive={handleDownloadArchiveFile}
                  onAddArchive={handleAddArchive}
                />
              )}

              {currentView === 'ringkasan' && (
                <RingkasanDashboard
                  tasks={tasks}
                  archives={archives}
                  onOpenSendEmailModal={() => setIsSendEmailModalOpen(true)}
                  onDownloadPdf={handleDownloadReportPdf}
                  onViewAllVerifiedList={() => setCurrentView('arsip')}
                />
              )}

              {currentView === 'template' && (
                <TemplateSurat
                  templates={templates}
                  onCreateTaskFromTemplate={handleCreateTaskFromTemplate}
                  onSaveTemplate={handleSaveTemplate}
                  onDeleteTemplate={handleDeleteTemplate}
                />
              )}

              {currentView === 'pengaturan' && (
                <PengaturanView
                  requireLogin={requireLogin}
                  onToggleRequireLogin={(val) => {
                    setRequireLogin(val);
                    showBanner(
                      val
                        ? 'Syarat login wajib sebelum masuk aplikasi DIAKTIFKAN.'
                        : 'Syarat login dinonaktifkan.'
                    );
                  }}
                  isAuthenticated={isAuthenticated}
                  onLogout={handleLogout}
                />
              )}
              {currentView === 'appscript' && <AppsScriptView />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* MODALS */}

      {/* Task Detail Modal */}
      {activeTaskForModal && (
        <TaskDetailModal
          task={activeTaskForModal}
          onClose={() => setActiveTaskForModal(null)}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
        />
      )}

      {/* Archive Document Viewer Modal */}
      {activeArchiveForViewer && (
        <DocumentViewerModal
          item={activeArchiveForViewer}
          onClose={() => setActiveArchiveForViewer(null)}
          onDownload={handleDownloadArchiveFile}
        />
      )}

      {/* Proposal Creation Modal */}
      {isProposalModalOpen && (
        <ProposalModal
          onClose={() => setIsProposalModalOpen(false)}
          onSubmitProposal={handleSubmitProposal}
        />
      )}

      {/* Send Email Modal */}
      {isSendEmailModalOpen && (
        <SendEmailModal
          onClose={() => setIsSendEmailModalOpen(false)}
          onSuccess={(email) => {
            setIsSendEmailModalOpen(false);
            showBanner(`Laporan eksekutif berhasil dikirim ke ${email}.`);
          }}
        />
      )}

      {/* Help / Guide Modal */}
      {isHelpModalOpen && <HelpModal onClose={() => setIsHelpModalOpen(false)} />}
    </div>
  );
}
