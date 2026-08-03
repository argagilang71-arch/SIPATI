import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ViewMode,
  TaskItem,
  ArchiveItem,
  TemplateItem,
  ProposalItem,
  TaskStatus,
  BannerConfig,
} from './types';
import {
  INITIAL_TASKS,
  INITIAL_ARCHIVES,
  INITIAL_TEMPLATES,
  INITIAL_PROPOSALS,
} from './mockData';
import {
  loadTasksFromCloud,
  saveTasksToCloud,
  subscribeTasksCloud,
  loadArchivesFromCloud,
  saveArchivesToCloud,
  subscribeArchivesCloud,
  loadTemplatesFromCloud,
  saveTemplatesToCloud,
  subscribeTemplatesCloud,
  loadProposalsFromCloud,
  saveProposalsToCloud,
  subscribeProposalsCloud,
  loadBannerConfigFromCloud,
  saveBannerConfigToCloud,
  subscribeBannerConfigCloud,
  subscribeNotificationsCloud,
  subscribeActivityLogsCloud,
  DEFAULT_BANNER_CONFIG,
} from './utils/firebaseSync';

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
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { ActivityHistoryModal } from './components/ActivityHistoryModal';
import { addNotification, addActivityLog } from './utils/activityNotificationStore';
import { PengaturanView } from './components/PengaturanView';
import { AppsScriptView } from './components/AppsScriptView';
import { downloadStoredFile } from './utils/fileStorage';
import sipatiHeroMokaImg from './assets/images/sipati_moka_hero_1784883832801.jpg';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [requireLogin, setRequireLogin] = useState<boolean>(true);

  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [archives, setArchives] = useState<ArchiveItem[]>(INITIAL_ARCHIVES);
  const [templates, setTemplates] = useState<TemplateItem[]>(INITIAL_TEMPLATES);
  const [proposals, setProposals] = useState<ProposalItem[]>(INITIAL_PROPOSALS);
  const [bannerConfig, setBannerConfig] = useState<BannerConfig>(DEFAULT_BANNER_CONFIG);

  // Helper to re-fetch all fresh data from Cloud Firestore across all devices
  const refreshAllCloudData = () => {
    loadTasksFromCloud().then((cloudTasks) => {
      if (cloudTasks && Array.isArray(cloudTasks)) setTasks(cloudTasks);
    });
    loadArchivesFromCloud().then((cloudArchives) => {
      if (cloudArchives && Array.isArray(cloudArchives)) setArchives(cloudArchives);
    });
    loadTemplatesFromCloud().then((cloudTemplates) => {
      if (cloudTemplates && Array.isArray(cloudTemplates)) setTemplates(cloudTemplates);
    });
    loadProposalsFromCloud().then((cloudProposals) => {
      if (cloudProposals && Array.isArray(cloudProposals)) setProposals(cloudProposals);
    });
    loadBannerConfigFromCloud().then((cloudBanner) => {
      if (cloudBanner) setBannerConfig(cloudBanner);
    });
  };

  // Initial load from Cloud Firestore & real-time subscriptions across all connected devices
  useEffect(() => {
    refreshAllCloudData();

    const unsubTasks = subscribeTasksCloud((nextTasks) => {
      setTasks(nextTasks);
      setActiveTaskForModal((current) => {
        if (!current) return null;
        return nextTasks.find((t) => t.id === current.id) || current;
      });
    });
    const unsubArchives = subscribeArchivesCloud((nextArchives) => setArchives(nextArchives));
    const unsubTemplates = subscribeTemplatesCloud((nextTemplates) => setTemplates(nextTemplates));
    const unsubProposals = subscribeProposalsCloud((nextProposals) => setProposals(nextProposals));
    const unsubBanner = subscribeBannerConfigCloud((nextBanner) => setBannerConfig(nextBanner));
    const unsubNotifs = subscribeNotificationsCloud((nextNotifs) => {
      try {
        localStorage.setItem('sipati_notifications', JSON.stringify(nextNotifs));
        window.dispatchEvent(new CustomEvent('sipati_notifications_updated', { detail: nextNotifs }));
      } catch (e) {}
    });
    const unsubLogs = subscribeActivityLogsCloud((nextLogs) => {
      try {
        localStorage.setItem('sipati_activity_logs', JSON.stringify(nextLogs));
        window.dispatchEvent(new CustomEvent('sipati_activity_logs_updated', { detail: nextLogs }));
      } catch (e) {}
    });

    // Also listen to local banner & data refresh update events
    const handleLocalBannerUpdate = () => {
      loadBannerConfigFromCloud().then((b) => {
        if (b) setBannerConfig(b);
      });
    };
    window.addEventListener('sipati_banner_updated', handleLocalBannerUpdate);
    window.addEventListener('sipati_refresh_cloud', refreshAllCloudData);

    return () => {
      unsubTasks();
      unsubArchives();
      unsubTemplates();
      unsubProposals();
      unsubBanner();
      unsubNotifs();
      unsubLogs();
      window.removeEventListener('sipati_banner_updated', handleLocalBannerUpdate);
      window.removeEventListener('sipati_refresh_cloud', refreshAllCloudData);
    };
  }, []);

  const handleSaveBannerConfig = async (newBanner: BannerConfig) => {
    setBannerConfig(newBanner);
    await saveBannerConfigToCloud(newBanner);
    addNotification('Banner Dashboard Diperbarui', 'Foto slide banner informasi utama telah diterbitkan.', 'banner');
    addActivityLog('Memperbarui Banner Slide Dashboard', 'Banner Slide Informasi Utama', 'system');
    showBanner('Pengaturan Banner Dashboard Admin berhasil disimpan & diterbitkan!');
  };

  // Global search & UI states
  const [globalSearch, setGlobalSearch] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals state
  const [activeTaskForModal, setActiveTaskForModal] = useState<TaskItem | null>(null);
  const [activeArchiveForViewer, setActiveArchiveForViewer] = useState<ArchiveItem | null>(null);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [isSendEmailModalOpen, setIsSendEmailModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);

  // Helper for floating banner notification
  const showBanner = (msg: string) => {
    setNotificationBanner(msg);
    setTimeout(() => {
      setNotificationBanner(null);
    }, 3500);
  };

  // Ensure the archive list ONLY contains documents from tasks that are completed (status === 'SELESAI')
  const completedTaskIds = new Set(tasks.filter((t) => t.status === 'SELESAI').map((t) => t.id));

  // Auto-sync completed tasks into archives
  const displayArchives = React.useMemo(() => {
    const map = new Map<string, ArchiveItem>();
    
    // First, add existing archives that either have no taskId or belong to a completed task
    archives.forEach((a) => {
      if (!a.taskId || completedTaskIds.has(a.taskId)) {
        map.set(a.id, a);
      }
    });

    // Second, ensure every completed task has a corresponding archive item entry with original file attached
    tasks
      .filter((t) => t.status === 'SELESAI')
      .forEach((t) => {
        const existing = Array.from(map.values()).find((a) => a.taskId === t.id);
        const allFiles = [
          ...(t.buktiDokumen || []),
          ...(t.buktiSuratDiterima || []),
          ...(t.draftPekerjaan || []),
        ];
        const mainFile = allFiles[0];

        if (!existing) {
          const hasPdf = allFiles.some((f) => f.toLowerCase().endsWith('.pdf'));
          const hasZip = allFiles.some((f) => f.toLowerCase().endsWith('.zip') || f.toLowerCase().endsWith('.rar'));
          const fileType: 'pdf' | 'doc' | 'zip' = hasPdf ? 'pdf' : hasZip ? 'zip' : 'doc';
          const archId = `arch-${t.id}`;
          map.set(archId, {
            id: archId,
            taskId: t.id,
            title: t.title,
            noSurat: t.noSurat || `0${Math.floor(Math.random() * 80) + 10}/SIPATI/VIII/2026`,
            bidang: t.bidang,
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
            status: 'TERVERIFIKASI',
            fileType,
            description: t.catatan || 'Dokumen naskah dinas hasil pekerjaan yang telah diselesaikan.',
            fileSize: allFiles.length > 0 ? `${(allFiles.length * 1.2 + 0.8).toFixed(1)} MB` : '1.8 MB',
            fileName: mainFile,
          });
        } else {
          const calcType = mainFile
            ? mainFile.toLowerCase().endsWith('.pdf')
              ? 'pdf'
              : mainFile.toLowerCase().endsWith('.zip') || mainFile.toLowerCase().endsWith('.rar')
              ? 'zip'
              : 'doc'
            : existing.fileType;

          map.set(existing.id, {
            ...existing,
            title: t.title,
            bidang: t.bidang,
            noSurat: t.noSurat || existing.noSurat,
            description: t.catatan || existing.description,
            fileName: mainFile || existing.fileName,
            fileType: calcType,
          });
        }
      });

    return Array.from(map.values());
  }, [tasks, archives, completedTaskIds]);

  // Task Handlers
  const handleSaveTask = (updatedTask: TaskItem, closeModal: boolean = true) => {
    const exists = tasks.some((t) => t.id === updatedTask.id);
    const nextTasks = exists
      ? tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      : [updatedTask, ...tasks];

    // Clean up any archive items whose tasks are no longer completed
    const nextCompletedIds = new Set(nextTasks.filter((t) => t.status === 'SELESAI').map((t) => t.id));
    const nextArchives = archives.filter((a) => !a.taskId || nextCompletedIds.has(a.taskId));

    setTasks(nextTasks);
    setArchives(nextArchives);
    saveTasksToCloud(nextTasks);
    saveArchivesToCloud(nextArchives);

    if (closeModal) {
      setActiveTaskForModal(null);
    } else {
      setActiveTaskForModal(updatedTask);
    }

    if (updatedTask.status === 'SELESAI') {
      addNotification(
        'Pekerjaan Selesai!',
        `Pekerjaan "${updatedTask.title}" (${updatedTask.bidang}) telah diselesaikan & otomatis terdaftar di Arsip Digital.`,
        'task_completed',
        updatedTask.id
      );
      addActivityLog('Menyelesaikan Pekerjaan', updatedTask.title, 'complete');
      if (closeModal) {
        showBanner(
          `Pekerjaan "${updatedTask.title}" telah diselesaikan & otomatis terdaftar di Arsip Digital (No. Surat: ${updatedTask.noSurat}).`
        );
      }
    } else {
      addActivityLog(exists ? 'Memperbarui Pekerjaan' : 'Membuat Pekerjaan Baru', updatedTask.title, exists ? 'edit' : 'create');
      if (closeModal) {
        showBanner(
          exists && targetTaskWasCompleted(tasks, updatedTask.id)
            ? `Pekerjaan diperbarui, otomatis dikeluarkan dari Arsip Digital.`
            : `Perubahan pekerjaan tersimpan.`
        );
      }
    }
  };

  const targetTaskWasCompleted = (taskList: TaskItem[], id: string) => {
    const t = taskList.find((item) => item.id === id);
    return t ? t.status === 'SELESAI' : false;
  };

  const handleDeleteTask = (taskId: string) => {
    const deletedTask = tasks.find((t) => t.id === taskId);
    const nextTasks = tasks.filter((t) => t.id !== taskId);
    const nextArchives = archives.filter((a) => a.taskId !== taskId);
    setTasks(nextTasks);
    setArchives(nextArchives);
    saveTasksToCloud(nextTasks);
    saveArchivesToCloud(nextArchives);
    setActiveTaskForModal(null);
    if (deletedTask) {
      addActivityLog('Menghapus Pekerjaan', deletedTask.title, 'delete');
    }
    showBanner('Pekerjaan berhasil dihapus.');
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const updatedTask: TaskItem = { ...targetTask, status: newStatus };
    const updatedTasks = tasks.map((t) => (t.id === taskId ? updatedTask : t));

    // Auto sync archive state when status changes
    const nextCompletedIds = new Set(updatedTasks.filter((t) => t.status === 'SELESAI').map((t) => t.id));
    const nextArchives = archives.filter((a) => !a.taskId || nextCompletedIds.has(a.taskId));

    setTasks(updatedTasks);
    setArchives(nextArchives);
    saveTasksToCloud(updatedTasks);
    saveArchivesToCloud(nextArchives);

    if (newStatus === 'SELESAI') {
      addNotification(
        'Pekerjaan Selesai!',
        `Pekerjaan "${updatedTask.title}" (${updatedTask.bidang}) telah diselesaikan & otomatis diarsipkan dengan No. Surat: ${updatedTask.noSurat}.`,
        'task_completed',
        taskId
      );
      addActivityLog('Menyelesaikan Pekerjaan', updatedTask.title, 'complete');
      showBanner(
        `Pekerjaan "${updatedTask.title}" selesai & otomatis diarsipkan dengan No. Surat: ${updatedTask.noSurat}.`
      );
    } else {
      addActivityLog(`Memperbarui Status (${newStatus})`, updatedTask.title, 'edit');
      showBanner(
        targetTask.status === 'SELESAI'
          ? `Status diubah dari SELESAI, dokumen otomatis dikeluarkan dari Arsip Digital.`
          : `Status pekerjaan diperbarui.`
      );
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
    const nextTasks = [newTask, ...tasks];
    setTasks(nextTasks);
    saveTasksToCloud(nextTasks);
    setCurrentView('pekerjaan');
    showBanner(`Pekerjaan baru "${title}" berhasil dibuat dari template.`);
  };

  const handleSaveTemplate = (savedTpl: TemplateItem) => {
    let nextArr: TemplateItem[] = [];
    const idx = templates.findIndex((t) => t.id === savedTpl.id);
    if (idx >= 0) {
      nextArr = [...templates];
      nextArr[idx] = savedTpl;
    } else {
      nextArr = [savedTpl, ...templates];
    }
    setTemplates(nextArr);
    saveTemplatesToCloud(nextArr);
    showBanner(`Template "${savedTpl.title}" berhasil disimpan.`);
  };

  const handleDeleteTemplate = (id: string) => {
    const nextArr = templates.filter((t) => t.id !== id);
    setTemplates(nextArr);
    saveTemplatesToCloud(nextArr);
    showBanner('Template berhasil dihapus.');
  };

  const handleDeleteArchive = (id: string) => {
    const item = archives.find((a) => a.id === id);
    const nextArr = archives.filter((a) => a.id !== id);
    setArchives(nextArr);
    saveArchivesToCloud(nextArr);
    if (item) {
      addActivityLog('Menghapus Berkas Arsip', item.title, 'delete');
    }
    showBanner('Dokumen arsip berhasil dihapus.');
  };

  // Proposal submit
  const handleSubmitProposal = (proposal: ProposalItem) => {
    const nextProposals = [proposal, ...proposals];
    setProposals(nextProposals);
    saveProposalsToCloud(nextProposals);
    setIsProposalModalOpen(false);
    showBanner(`Proposal "${proposal.judul}" telah diajukan.`);
  };

  // Add Archive item
  const handleAddArchive = (file?: File) => {
    let title = 'Nota Kesepakatan Lintas Sektor HUT RI 81';
    let fileType: 'pdf' | 'doc' | 'zip' = 'pdf';
    let fileSize = '3.1 MB';

    if (file) {
      title = file.name;
      const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      fileType = ext === 'doc' || ext === 'docx' ? 'doc' : ext === 'zip' || ext === 'rar' ? 'zip' : 'pdf';
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      fileSize = `${sizeMb} MB`;
    }

    const taskId = `task-arch-${Date.now()}`;
    const noSurat = `0${archives.length + 50}/NK/PAN-RI/VIII/2026`;
    const fileName = file ? file.name : (title.toLowerCase().endsWith(`.${fileType}`) ? title : `${title}.${fileType}`);

    const newArch: ArchiveItem = {
      id: `arch-${Date.now()}`,
      taskId,
      title,
      noSurat,
      bidang: 'Legalisasi Operasional',
      date: new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      status: 'TERVERIFIKASI',
      fileType,
      description: 'Dokumen arsip terunggah resmi terverifikasi dari pekerjaan yang diselesaikan.',
      fileSize,
      fileName,
    };

    const newTask: TaskItem = {
      id: taskId,
      title,
      bidang: 'Legalisasi Operasional',
      pj: 'Staf Administrasi',
      status: 'SELESAI',
      catatan: 'Pekerjaan selesai dengan unggahan berkas ke Arsip Digital.',
      buktiDokumen: file ? [file.name] : ['Dokumen_Arsip_Terverifikasi.pdf'],
      buktiSuratDiterima: [],
      draftPekerjaan: [],
      noSurat,
      dateCreated: new Date().toISOString().split('T')[0],
    };

    const nextTasks = [newTask, ...tasks];
    const nextArchives = [newArch, ...archives];

    setTasks(nextTasks);
    setArchives(nextArchives);
    saveTasksToCloud(nextTasks);
    saveArchivesToCloud(nextArchives);
    showBanner(`Dokumen "${title}" berhasil diunggah, tersimpan di Arsip Digital & terdaftar di Daftar Pekerjaan (Selesai).`);
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
    const ext = item.fileType ? `.${item.fileType.toLowerCase()}` : '.pdf';
    const fileNameCandidate = item.fileName || (
      item.title.toLowerCase().endsWith(ext)
        ? item.title
        : `${cleanTitle}${ext}`
    );
    downloadStoredFile(fileNameCandidate, {
      title: item.title,
      noSurat: item.noSurat,
      bidang: item.bidang,
      catatan: item.description,
    });
    showBanner(`Mengunduh berkas asli: ${fileNameCandidate}`);
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
              refreshAllCloudData();
              showBanner('Login Berhasil! Selamat datang di SIPATI.');
            }}
            onBackToLanding={() => setCurrentView('landing')}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="relative min-h-screen text-slate-100 font-['Inter',sans-serif] flex overflow-x-hidden antialiased">
      {/* Hero Background Image with Dark Transparent Mask */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src={sipatiHeroMokaImg}
          alt="SIPATI Workspace Background"
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/85 to-black/90"></div>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

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
      <div className="flex-1 md:ml-[250px] flex flex-col min-h-screen relative z-10">
        {/* Top App Bar */}
        <Header
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onDownloadReport={handleDownloadReportPdf}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          onOpenHelpModal={() => setIsHelpModalOpen(true)}
          onOpenNotifications={() => setIsNotifModalOpen(true)}
          onOpenActivityHistory={() => setIsHistoryModalOpen(true)}
        />

        {/* Floating Banner Notification */}
        {notificationBanner && (
          <div className="fixed top-20 right-6 z-50 bg-[#00a3e0] text-white px-5 py-3 rounded-xl shadow-2xl border border-cyan-300/40 text-xs font-['Inter',sans-serif] font-semibold flex items-center gap-2.5 animate-bounce backdrop-blur-md">
            <span className="material-symbols-outlined text-sm text-cyan-200">
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
                  onDeleteTask={handleDeleteTask}
                />
              )}

              {currentView === 'arsip' && (
                <ArsipDigital
                  archives={displayArchives}
                  onViewArchive={(item) => setActiveArchiveForViewer(item)}
                  onDownloadArchive={handleDownloadArchiveFile}
                  onAddArchive={handleAddArchive}
                />
              )}

              {currentView === 'ringkasan' && (
                <RingkasanDashboard
                  tasks={tasks}
                  archives={displayArchives}
                  banner={bannerConfig}
                  onSaveBannerConfig={handleSaveBannerConfig}
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
                  banner={bannerConfig}
                  onSaveBannerConfig={handleSaveBannerConfig}
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
              {currentView === 'appscript' && (
                (() => {
                  let isUserAdmin = true;
                  try {
                    const uStr = localStorage.getItem('sipati_current_user');
                    if (uStr) {
                      const u = JSON.parse(uStr);
                      const role = (u.role || '').toLowerCase();
                      isUserAdmin = role.includes('officer') || role.includes('admin') || role.includes('administrator') || role.includes('kepala bagian');
                    }
                  } catch {
                    isUserAdmin = true;
                  }

                  if (!isUserAdmin) {
                    return (
                      <div className="p-8 bg-black/45 backdrop-blur-xl border border-rose-500/40 rounded-2xl text-center space-y-4 max-w-lg mx-auto text-white">
                        <span className="material-symbols-outlined text-rose-400 text-5xl">lock</span>
                        <h3 className="font-['Lora',serif] text-xl font-bold text-white">Akses Dibatasi Khusus Admin</h3>
                        <p className="text-sm text-gray-300">
                          Halaman Google Apps Script &amp; Automation Engine hanya dapat diakses oleh akun dengan peran Officer / Administrator.
                        </p>
                        <button
                          onClick={() => setCurrentView('pekerjaan')}
                          className="px-5 py-2.5 bg-[#00a3e0] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg hover:shadow-cyan-500/25 cursor-pointer"
                        >
                          Kembali ke Daftar Pekerjaan
                        </button>
                      </div>
                    );
                  }

                  return <AppsScriptView />;
                })()
              )}
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

      {/* Notification Center Modal */}
      {isNotifModalOpen && (
        <NotificationCenterModal onClose={() => setIsNotifModalOpen(false)} />
      )}

      {/* Activity History Log Modal */}
      {isHistoryModalOpen && (
        <ActivityHistoryModal onClose={() => setIsHistoryModalOpen(false)} />
      )}
    </div>
  );
}
