import React, { useState } from 'react';
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

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('pekerjaan');
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

  // Task Handlers
  const handleSaveTask = (updatedTask: TaskItem) => {
    const exists = tasks.some((t) => t.id === updatedTask.id);
    let nextTasks: TaskItem[];

    if (exists) {
      nextTasks = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    } else {
      nextTasks = [updatedTask, ...tasks];
    }

    setTasks(nextTasks);
    setActiveTaskForModal(null);

    // Auto archive if status became SELESAI
    if (updatedTask.status === 'SELESAI') {
      const alreadyArchived = archives.some((a) => a.title.includes(updatedTask.title));
      if (!alreadyArchived) {
        const newArch: ArchiveItem = {
          id: `arch-${Date.now()}`,
          title: updatedTask.title,
          noSurat: updatedTask.noSurat || `SIP/${Date.now().toString().slice(-4)}/VIII/2026`,
          bidang: updatedTask.bidang,
          date: new Date().toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
          status: 'TERVERIFIKASI',
          fileType: 'doc',
          description: updatedTask.catatan || 'Dokumen tugas telah diselesaikan dan diverifikasi.',
          fileSize: '1.5 MB',
        };
        setArchives([newArch, ...archives]);
        showBanner(`Pekerjaan "${updatedTask.title}" telah diselesaikan dan diarsip otomatis.`);
      } else {
        showBanner(`Perubahan pekerjaan "${updatedTask.title}" tersimpan.`);
      }
    } else {
      showBanner(`Perubahan pekerjaan tersimpan.`);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((t) => t.id !== taskId));
    setActiveTaskForModal(null);
    showBanner('Pekerjaan berhasil dihapus.');
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const updated = tasks.map((t) =>
      t.id === taskId ? { ...t, status: newStatus } : t
    );
    setTasks(updated);
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
      noSurat: `0${tasks.length + 10}/PAN-RI/VIII/2026`,
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

  // Downloads simulation
  const handleDownloadReportPdf = () => {
    showBanner('Mengunduh Buku Laporan Digital Otomatis (PDF)...');
  };

  const handleDownloadArchiveFile = (item: ArchiveItem) => {
    showBanner(`Mengunduh berkas salinan: ${item.title}`);
  };

  // Render standalone pages without sidebar if Landing or Login
  if (currentView === 'landing') {
    return (
      <LandingPage
        onEnterApp={() => setCurrentView('pekerjaan')}
        onOpenLogin={() => setCurrentView('login')}
      />
    );
  }

  if (currentView === 'login') {
    return (
      <LoginPage
        onLoginSuccess={() => {
          setCurrentView('pekerjaan');
          showBanner('Login Berhasil! Selamat datang di SIPATI.');
        }}
        onBackToLanding={() => setCurrentView('landing')}
      />
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

          {currentView === 'pengaturan' && <PengaturanView />}
          {currentView === 'appscript' && <AppsScriptView />}
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
