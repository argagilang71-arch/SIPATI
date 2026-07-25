import React, { useState, useEffect } from 'react';
import { SipatiLogo } from './SipatiLogo';
import { getDriveConfig, saveDriveConfig, openInGoogleDrive, GoogleDriveConfig } from '../utils/fileStorage';
import { GoogleDriveManager } from './GoogleDriveManager';
import {
  saveTeamMembersToCloud,
  loadTeamMembersFromCloud,
  subscribeTeamMembersCloud,
  saveSettingsToCloud,
  loadSettingsFromCloud,
  saveBannerConfigToCloud,
  loadBannerConfigFromCloud,
  subscribeBannerConfigCloud,
} from '../utils/firebaseSync';
import { TeamMember, BannerConfig } from '../types';
import { BannerEditModal } from './BannerEditModal';

interface PengaturanViewProps {
  requireLogin?: boolean;
  onToggleRequireLogin?: (val: boolean) => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
  banner?: BannerConfig;
  onSaveBannerConfig?: (banner: BannerConfig) => void;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  requireLogin = true,
  onToggleRequireLogin,
  isAuthenticated = true,
  onLogout,
  banner,
  onSaveBannerConfig,
}) => {
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [namaInstansi, setNamaInstansi] = useState(
    'Bagian Tata Pemerintahan Sekretariat Daerah Kabupaten Kubu Raya'
  );
  const [namaAdmin, setNamaAdmin] = useState('Drs. H. Mulyadi, M.Si');
  const [nipAdmin, setNipAdmin] = useState('19780512 200312 1 002');
  const [emailNotif, setEmailNotif] = useState('tatapemerintahan@kuburayakab.go.id');
  const [autoArchive, setAutoArchive] = useState(true);
  const [logoUrl, setLogoUrl] = useState(() => {
    try {
      return localStorage.getItem('sipati_logo_url') || '';
    } catch {
      return '';
    }
  });
  const [googleDriveSync, setGoogleDriveSync] = useState(true);
  const [googleDriveConnected, setGoogleDriveConnected] = useState(true);
  const [saved, setSaved] = useState(false);

  // Google Drive Configuration State
  const [driveConfig, setDriveConfigState] = useState<GoogleDriveConfig>(getDriveConfig());

  // Current logged in user state & profile photo
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userPhoto, setUserPhoto] = useState<string>('');

  const PRESET_AVATARS = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuD0R1bby-MAB_3UmPNiN166iM6w8GN8Br7vcCFJTLw_T7QHb0dGgloCH4DrPbR58NA7vg0xGra_ObnphmVVsiXMjjoulq3Cy2Soh0B66LjFvIvUEXKE-jHiqHum5BMMWgIL5NRE-HcQ9dKAJaW3LBrDIAicr0EWyCh2VE7U9ayXTt9EycbZTG3pA-yiBDGCLa34RqH9noeFA24p9s0aphy44bWmlmdJaXy02lMqu38IlS_LnTmD2DHhEOr_D37BoPRkK3Yg9_BY-SQ",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256",
  ];

  // Password visibility map for table
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('sipati_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        setUserPhoto(parsed.avatar || parsed.photo || PRESET_AVATARS[0]);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSaveUserProfilePhoto = (photoUrl: string) => {
    try {
      setUserPhoto(photoUrl);
      const savedUser = localStorage.getItem('sipati_current_user');
      const userObj = savedUser ? JSON.parse(savedUser) : { nama: 'Pengguna SIPATI' };
      userObj.avatar = photoUrl;
      userObj.photo = photoUrl;
      localStorage.setItem('sipati_current_user', JSON.stringify(userObj));
      setCurrentUser(userObj);
      window.dispatchEvent(new Event('sipati_user_updated'));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Determine if the current logged-in user is an Officer / Administrator
  const isOfficer =
    !requireLogin ||
    !currentUser ||
    (currentUser.role &&
      (currentUser.role.toLowerCase().includes('officer') ||
        currentUser.role.toLowerCase().includes('admin'))) ||
    currentUser.username === 'admin' ||
    currentUser.username === '197805122003121002';

  // Daftar Anggota, NIP, Username & Password
  const [anggotaList, setAnggotaList] = useState<TeamMember[]>([
    {
      id: 'm-gilang',
      nama: 'Gilang Ariesta Arga, S.IP',
      nip: '199403162016091001',
      jabatan: 'Kepala Bagian Tata Pemerintahan',
      subBagian: 'Kepala Bagian Tata Pemerintahan',
      username: 'gilang.admin',
      password: 'admin12345',
      role: 'Officer / Administrator',
    },
    {
      id: 'm-erik',
      nama: 'Singgih Erik Rudiana, S.STP, M.A.P',
      nip: '19860920 200904 2 005',
      jabatan: 'Analis Kebijakan Ahli Muda',
      subBagian: 'Analis Kebijakan Ahli Muda',
      username: 'erik.2',
      password: 'user2',
      role: 'Analis Kebijakan',
    },
    {
      id: 'm-faisal',
      nama: 'Faisal Hadi Jaya, S.E, M.Si',
      nip: '196812111996031007',
      jabatan: 'Analis Kebijakan Ahli Pertama',
      subBagian: 'Analis Kebijakan Ahli Pertama',
      username: 'faisal.hadi1',
      password: 'user123',
      role: 'Analis Kebijakan',
    },
    {
      id: 'm-1',
      nama: 'Drs. H. Mulyadi, M.Si',
      nip: '19780512 200312 1 002',
      jabatan: 'Kepala Bagian Tata Pemerintahan',
      subBagian: 'Kepala Bagian Tata Pemerintahan',
      username: '197805122003121002',
      password: 'admin123',
      role: 'Officer / Administrator',
    },
  ]);

  // Modal State untuk Tambah/Edit Anggota & Login Credentials
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState<Omit<TeamMember, 'id'>>({
    nama: '',
    nip: '',
    jabatan: '',
    subBagian: 'Analis Kebijakan Ahli Muda',
    username: '',
    password: '',
    role: 'Analis Kebijakan',
  });

  // Load persisted settings and members from cloud on mount
  useEffect(() => {
    // Initial load from cloud
    loadTeamMembersFromCloud().then((members) => {
      if (members && members.length > 0) {
        setAnggotaList(members);
      }
    });

    loadSettingsFromCloud().then((settings) => {
      if (settings) {
        if (settings.namaInstansi) setNamaInstansi(settings.namaInstansi);
        if (settings.namaAdmin) setNamaAdmin(settings.namaAdmin);
        if (settings.nipAdmin) setNipAdmin(settings.nipAdmin);
        if (settings.emailNotif) setEmailNotif(settings.emailNotif);
        if (settings.autoArchive !== undefined) setAutoArchive(settings.autoArchive);
        if (settings.logoUrl !== undefined) setLogoUrl(settings.logoUrl || '');
      }
    });

    // Realtime subscription for instant cross-device updates
    const unsubscribe = subscribeTeamMembersCloud((cloudMembers) => {
      if (cloudMembers && cloudMembers.length > 0) {
        setAnggotaList(cloudMembers);
      }
    });

    try {
      const savedInstansi = localStorage.getItem('sipati_nama_instansi');
      if (savedInstansi) setNamaInstansi(savedInstansi);

      const savedAdmin = localStorage.getItem('sipati_nama_admin');
      if (savedAdmin) setNamaAdmin(savedAdmin);

      const savedNip = localStorage.getItem('sipati_nip_admin');
      if (savedNip) setNipAdmin(savedNip);

      const savedEmail = localStorage.getItem('sipati_email_notif');
      if (savedEmail) setEmailNotif(savedEmail);

      const savedArchive = localStorage.getItem('sipati_auto_archive');
      if (savedArchive !== null) setAutoArchive(JSON.parse(savedArchive));

      const savedLogo = localStorage.getItem('sipati_logo_url');
      if (savedLogo) setLogoUrl(savedLogo);
    } catch (e) {
      console.error(e);
    }

    return () => unsubscribe();
  }, []);

  const handleOpenAddMember = () => {
    setEditingMemberId(null);
    setMemberForm({
      nama: '',
      nip: '',
      jabatan: '',
      subBagian: 'Analis Kebijakan Ahli Muda',
      username: '',
      password: 'user123',
      role: 'Analis Kebijakan',
    });
    setIsMemberModalOpen(true);
  };

  const handleOpenEditMember = (m: TeamMember) => {
    setEditingMemberId(m.id);
    setMemberForm({
      nama: m.nama,
      nip: m.nip,
      jabatan: m.jabatan,
      subBagian: m.subBagian,
      username: m.username,
      password: m.password || 'user123',
      role: m.role || 'Analis Kebijakan',
    });
    setIsMemberModalOpen(true);
  };

  const handleDeleteMember = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus anggota ini dari daftar?')) {
      const newList = anggotaList.filter((m) => m.id !== id);
      setAnggotaList(newList);
      saveTeamMembersToCloud(newList);
    }
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.nama.trim() || !memberForm.nip.trim() || !memberForm.username.trim()) {
      alert('Nama, NIP, dan Username Login wajib diisi.');
      return;
    }

    let newList: TeamMember[];
    if (editingMemberId) {
      newList = anggotaList.map((m) =>
        m.id === editingMemberId ? { id: editingMemberId, ...memberForm } : m
      );
    } else {
      const newMember: TeamMember = {
        id: `m-${Date.now()}`,
        ...memberForm,
      };
      newList = [...anggotaList, newMember];
    }

    setAnggotaList(newList);
    saveTeamMembersToCloud(newList);
    setIsMemberModalOpen(false);
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOfficer) {
      alert('Akses Ditolak!\n\nPengubahan nama penanggung jawab, instansi, dan pengaturan sistem hanya dapat dilakukan oleh Admin / Officer.');
      return;
    }
    try {
      // Save local admin settings
      localStorage.setItem('sipati_nama_admin', namaAdmin);
      localStorage.setItem('sipati_nip_admin', nipAdmin);
      localStorage.setItem('sipati_nama_instansi', namaInstansi);
      if (logoUrl) {
        localStorage.setItem('sipati_logo_url', logoUrl);
      } else {
        localStorage.removeItem('sipati_logo_url');
      }
      window.dispatchEvent(new Event('sipati_logo_updated'));

      saveDriveConfig(driveConfig);
      await saveTeamMembersToCloud(anggotaList);
      await saveSettingsToCloud({
        namaInstansi,
        namaAdmin,
        nipAdmin,
        emailNotif,
        autoArchive,
        logoUrl,
      });

      setSaved(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      alert('✅ BERHASIL DISIMPAN!\n\nSeluruh konfigurasi instansi, ID Google Drive, serta Username & Password pengguna telah berhasil disimpan ke Cloud Database & Penyimpanan Lokal.');
      setTimeout(() => setSaved(false), 5000);
    } catch (err) {
      console.error('Gagal menyimpan pengaturan:', err);
      alert('Terjadi kesalahan saat menyimpan pengaturan.');
    }
  };

  const toggleShowPassword = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 max-w-5xl pb-12 text-white font-['Inter',sans-serif]">
      {/* Title */}
      <div>
        <h2 className="font-['Lora',serif] text-[22px] sm:text-[26px] font-bold text-white mb-1">
          Pengaturan Sistem &amp; Manajemen Akun Pengguna
        </h2>
        <p className="text-gray-300 font-['Inter',sans-serif] text-[13.5px]">
          Kelola foto profil Anda, identitas instansi, ID Google Drive target, serta kredensial Login (Username &amp; Password) pengguna.
        </p>
      </div>

      {!isOfficer && (
        <div className="p-4 bg-cyan-950/70 border border-cyan-400/40 rounded-2xl text-cyan-200 text-xs font-['Inter',sans-serif] flex items-center gap-3 backdrop-blur-xl">
          <span className="material-symbols-outlined text-cyan-300 text-xl shrink-0">lock</span>
          <div>
            <strong>Akses Pengaturan Dibatasi:</strong> Anda masuk sebagai <strong>{currentUser?.nama || 'Pengguna Staf'} ({currentUser?.role || 'Analis Kebijakan'})</strong>. Pengubahan nama pejabat penanggung jawab, instansi, dan akun pengguna hanya dapat dilakukan oleh Admin / Officer.
          </div>
        </div>
      )}

      {saved && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-400 text-emerald-200 rounded-xl text-xs font-['Inter',sans-serif] font-semibold flex items-center gap-2 animate-fadeIn backdrop-blur-xl">
          <span className="material-symbols-outlined text-sm text-emerald-400">check_circle</span>
          Seluruh foto profil, konfigurasi sistem, ID Google Drive, dan akun login berhasil disimpan!
        </div>
      )}

      {/* PENGATURAN FOTO PROFIL (BISA DIATUR OLEH PENGGUNA MANAPUN & ADMIN) */}
      <div className="bg-black/45 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/15 pb-3">
          <div>
            <h3 className="font-['Lora',serif] text-[16px] font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-cyan-300">account_circle</span>
              Pengaturan Foto Profil &amp; Identitas Akun Saya
            </h3>
            <p className="text-xs text-gray-300 mt-0.5">
              Atur dan pasang foto profil Anda sendiri agar tampil di bilah atas aplikasi (Header) dan catatan aktivitas.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
            Akses Bebas (Setiap Pengguna)
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 pt-1">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center gap-2 bg-white/10 p-4 rounded-2xl border border-white/15 shrink-0">
            <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">Foto Profil Aktif</span>
            <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-cyan-400/60 overflow-hidden shadow-lg">
              <img
                src={userPhoto || PRESET_AVATARS[0]}
                alt="User Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[10px] text-gray-300 font-medium">
              {currentUser?.nama || 'Pengguna SIPATI'}
            </span>
          </div>

          {/* Controls: Preset or Upload */}
          <div className="flex-1 space-y-4 w-full">
            <div>
              <label className="block font-semibold text-[11px] uppercase text-cyan-300 mb-2">
                Pilih Preset Foto Profil / Avatar
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {PRESET_AVATARS.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSaveUserProfilePhoto(url)}
                    className={`w-10 h-10 rounded-full overflow-hidden border-2 cursor-pointer transition-all ${
                      userPhoto === url ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-110' : 'border-white/20 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <label className="px-4 py-2 bg-[#00a3e0] hover:bg-[#008bc2] text-white text-xs font-bold rounded-xl cursor-pointer transition flex items-center gap-2 shadow-lg hover:shadow-cyan-500/25 active:scale-95">
                <span className="material-symbols-outlined text-base">upload</span>
                <span>Unggah Foto Dari Perangkat...</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 3 * 1024 * 1024) {
                        alert('Ukuran foto profil terlalu besar. Maksimal 3MB.');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const result = event.target?.result as string;
                        if (result) {
                          handleSaveUserProfilePhoto(result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>

              <span className="text-[11px] text-gray-400 italic">
                Foto profil langsung diperbarui secara otomatis.
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Identitas Panitia & Satuan Kerja */}
        <div className="bg-black/45 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/15 pb-3">
            <h3 className="font-['Lora',serif] text-[16px] font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-cyan-300">domain</span>
              Identitas Panitia &amp; Satuan Kerja
            </h3>
            <div className="flex items-center gap-2">
              <SipatiLogo size={32} />
              <span className="text-xs font-semibold text-cyan-300 hidden sm:inline-block">Logo Resmi SIPATI Bagian Tata Pemerintahan</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-['Inter',sans-serif] font-semibold text-[11px] uppercase text-cyan-300 mb-1">
                Nama Instansi / Satuan Kerja {!isOfficer && <span className="text-amber-400 font-normal">(Terunci)</span>}
              </label>
              <input
                type="text"
                disabled={!isOfficer}
                value={namaInstansi}
                onChange={(e) => setNamaInstansi(e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-xl font-['Inter',sans-serif] text-[13.5px] text-white focus:outline-none focus:border-[#00a3e0] ${
                  !isOfficer ? 'bg-white/5 border-white/10 cursor-not-allowed opacity-80' : 'bg-white/10 border-white/20'
                }`}
              />
            </div>

            <div>
              <label className="block font-['Inter',sans-serif] font-semibold text-[11px] uppercase text-cyan-300 mb-1">
                Nama Pejabat Penanggung Jawab {!isOfficer && <span className="text-amber-400 font-normal">(Khusus Admin)</span>}
              </label>
              <input
                type="text"
                disabled={!isOfficer}
                value={namaAdmin}
                onChange={(e) => setNamaAdmin(e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-xl font-['Inter',sans-serif] text-[13.5px] text-white focus:outline-none focus:border-[#00a3e0] ${
                  !isOfficer ? 'bg-white/5 border-white/10 cursor-not-allowed opacity-80' : 'bg-white/10 border-white/20'
                }`}
              />
            </div>

            <div>
              <label className="block font-['Inter',sans-serif] font-semibold text-[11px] uppercase text-cyan-300 mb-1">
                NIP / ID Pejabat Penanggung Jawab {!isOfficer && <span className="text-amber-400 font-normal">(Khusus Admin)</span>}
              </label>
              <input
                type="text"
                disabled={!isOfficer}
                value={nipAdmin}
                onChange={(e) => setNipAdmin(e.target.value)}
                className={`w-full px-3.5 py-2.5 border rounded-xl font-['JetBrains_Mono',monospace] text-[13.5px] text-white focus:outline-none focus:border-[#00a3e0] ${
                  !isOfficer ? 'bg-white/5 border-white/10 cursor-not-allowed opacity-80' : 'bg-white/10 border-white/20'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Pengaturan Logo Official SIPATI Instansi */}
        <div className="bg-black/45 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/15 pb-3">
            <div>
              <h3 className="font-['Lora',serif] text-[16px] font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-cyan-300">badge</span>
                Pengaturan Logo Official SIPATI Instansi
              </h3>
              <p className="text-xs text-gray-300 mt-0.5">
                Unggah file gambar logo instansi Anda (.PNG, .JPG, .SVG, .WEBP) atau masukkan URL logo khusus agar tampil berseragam di seluruh aplikasi.
              </p>
            </div>
            {!isOfficer && <span className="text-amber-400 font-semibold text-xs">(Khusus Admin)</span>}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-1">
            {/* Live Logo Preview Box */}
            <div className="flex flex-col items-center gap-2 bg-white/10 p-4 rounded-2xl border border-white/15 shrink-0">
              <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">Preview Logo Aktif</span>
              <div className="w-20 h-20 bg-slate-900 border border-white/20 rounded-xl flex items-center justify-center p-2 shadow-md">
                <SipatiLogo size={64} customLogoUrl={logoUrl} />
              </div>
              <span className="text-[10px] text-gray-300 font-mono">
                {logoUrl ? 'Logo Custom Aktif' : 'Logo Default Emblem'}
              </span>
            </div>

            {/* Controls for upload or URL */}
            <div className="flex-1 space-y-3.5 w-full">
              <div>
                <label className="block font-['Inter',sans-serif] font-semibold text-[11px] uppercase text-cyan-300 mb-1">
                  Unggah File Gambar Logo (PNG / JPG / SVG / WEBP)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className={`px-4 py-2 bg-[#00a3e0] hover:bg-[#008bc2] text-white text-xs font-semibold rounded-xl cursor-pointer transition flex items-center gap-1.5 shadow-md ${!isOfficer ? 'opacity-50 pointer-events-none' : ''}`}>
                    <span className="material-symbols-outlined text-base">upload_file</span>
                    <span>Pilih File Gambar Logo...</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={!isOfficer}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            alert('Ukuran file logo terlalu besar. Maksimal 2MB.');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result as string;
                            if (result) {
                              setLogoUrl(result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  {logoUrl && (
                    <button
                      type="button"
                      disabled={!isOfficer}
                      onClick={() => {
                        setLogoUrl('');
                        localStorage.removeItem('sipati_logo_url');
                        window.dispatchEvent(new Event('sipati_logo_updated'));
                      }}
                      className="px-3 py-2 bg-rose-950/60 text-rose-200 hover:bg-rose-900 border border-rose-400/40 text-xs font-semibold rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">restart_alt</span>
                      <span>Gunakan Logo Default</span>
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-['Inter',sans-serif] font-semibold text-[11px] uppercase text-cyan-300 mb-1">
                  Atau Masukkan Tautan (URL) Gambar Logo
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
                    link
                  </span>
                  <input
                    type="url"
                    disabled={!isOfficer}
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://contoh.com/logo-satuan-kerja.png"
                    className={`w-full pl-9 pr-3.5 py-2 border rounded-xl font-['Inter',sans-serif] text-[13px] text-white focus:outline-none focus:border-[#00a3e0] ${
                      !isOfficer ? 'bg-white/5 border-white/10 cursor-not-allowed opacity-80' : 'bg-white/10 border-white/20'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PENGATURAN BANNER DASHBOARD (KHUSUS ADMIN / OFFICER) */}
        <div className="bg-black/45 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/15 pb-3">
            <div>
              <h3 className="font-['Lora',serif] text-[16px] font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-cyan-300">campaign</span>
                Pengaturan Banner Pengumuman Dashboard (Khusus Admin)
              </h3>
              <p className="text-xs text-gray-300 mt-0.5">
                Konfigurasi pesan pengumuman, headline, tautan, dan gambar yang tampil di bagian atas halaman utama Dashboard.
              </p>
            </div>
            {isOfficer ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-400/50 self-start sm:self-auto">
                Akses Admin Aktif
              </span>
            ) : (
              <span className="text-amber-400 font-semibold text-xs">(Khusus Admin)</span>
            )}
          </div>

          {banner ? (
            <div className="bg-white/5 border border-white/15 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${banner.enabled ? 'bg-emerald-400 shadow-emerald-500/50 shadow-md animate-pulse' : 'bg-gray-500'}`}></span>
                  <span className="text-xs font-bold text-white">
                    Status: {banner.enabled ? 'TAYANG DI DASHBOARD' : 'NON-AKTIF (DISEMBUNYIKAN)'}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-cyan-300">
                  Tema: {banner.type?.toUpperCase() || 'INFO'}
                </span>
              </div>

              <div className="pt-2 border-t border-white/10 space-y-1">
                <div className="font-['Lora',serif] font-bold text-sm text-white">{banner.title}</div>
                <div className="text-xs text-gray-300 line-clamp-2">{banner.message}</div>
                {banner.linkUrl && (
                  <div className="text-[11px] font-mono text-cyan-400 pt-1">
                    Tautan: {banner.linkUrl} ({banner.linkText || 'Buka Link'})
                  </div>
                )}
              </div>

              {isOfficer && (
                <div className="pt-3 border-t border-white/10 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsBannerModalOpen(true)}
                    className="px-4 py-2 bg-[#00a3e0] hover:bg-[#008bc2] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg hover:shadow-cyan-500/25 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    <span>Kelola &amp; Ubah Banner Dashboard</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-gray-400 italic">Banner belum dikonfigurasi.</div>
          )}
        </div>

        {/* PENGATURAN KREDENSIAL LOGIN & DAFTAR ANGGOTA (BERDASARKAN PERAN HAK AKSES) */}
        {isOfficer ? (
          <div className="bg-black/45 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/15 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-['Lora',serif] text-[16px] font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-cyan-300">manage_accounts</span>
                    Manajemen Username &amp; Password Pengguna (Akses Officer)
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-400/50">
                    Sesi Officer Aktif
                  </span>
                </div>
                <p className="text-xs text-gray-300 mt-0.5">
                  Sebagai Officer / Administrator, Anda berhak melihat, menambah, dan mengubah Username &amp; Password login seluruh staf.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddMember}
                className="px-3.5 py-2 bg-[#00a3e0] hover:bg-[#008bc2] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto shadow-lg hover:shadow-cyan-500/25 active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
                <span>Tambah Pengguna / Akun</span>
              </button>
            </div>

            {/* Table / List of Members with Username & Password */}
            <div className="overflow-x-auto rounded-xl border border-white/15">
              <table className="w-full text-left text-xs font-['Inter',sans-serif]">
                <thead className="bg-white/10 border-b border-white/15 font-bold uppercase text-cyan-300">
                  <tr>
                    <th className="p-3">Nama Pengguna / NIP</th>
                    <th className="p-3">Jabatan &amp; Peran</th>
                    <th className="p-3">Username Login</th>
                    <th className="p-3">Kata Sandi (Password)</th>
                    <th className="p-3 text-right">Aksi Officer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 text-gray-200">
                  {anggotaList.map((member) => (
                    <tr key={member.id} className="hover:bg-white/10 transition">
                      <td className="p-3">
                        <div className="font-semibold text-white">{member.nama}</div>
                        <div className="font-mono text-[11px] text-cyan-300">NIP: {member.nip}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-gray-200 font-medium">{member.jabatan}</div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950/60 text-cyan-200 border border-cyan-400/40">
                          {member.role || 'Analis Kebijakan'}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-cyan-300 bg-white/5">
                        {member.username}
                      </td>
                      <td className="p-3 font-mono font-semibold text-white">
                        <div className="flex items-center gap-2">
                          <span>
                            {visiblePasswords[member.id]
                              ? member.password || 'user123'
                              : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleShowPassword(member.id)}
                            className="text-gray-400 hover:text-white transition cursor-pointer"
                            title="Tampilkan / Sembunyikan Password"
                          >
                            <span className="material-symbols-outlined text-sm">
                              {visiblePasswords[member.id] ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditMember(member)}
                            className="px-2.5 py-1 text-xs font-semibold bg-cyan-500/20 text-cyan-300 hover:bg-[#00a3e0] hover:text-white rounded-lg transition cursor-pointer flex items-center gap-1 border border-cyan-400/30"
                            title="Atur Username & Password"
                          >
                            <span className="material-symbols-outlined text-sm">key</span>
                            <span>Atur Akses</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMember(member.id)}
                            className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-950/50 rounded-lg transition cursor-pointer"
                            title="Hapus Akun"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* TERBATAS UNTUK PENGGUNA NON-OFFICER */
          <div className="bg-black/45 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 shadow-2xl space-y-4 font-['Inter',sans-serif]">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-cyan-300 text-xl">lock_clock</span>
                <div>
                  <h3 className="font-['Lora',serif] text-[16px] font-bold text-white">
                    Informasi Akun Pengguna Terautentikasi
                  </h3>
                  <p className="text-xs text-gray-300 mt-0.5">
                    Akses Fitur Manajemen Seluruh Akun, Username &amp; Password Pengguna Dibatasi Khusus Officer / Administrator.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-950/70 text-cyan-200 border border-cyan-400/40">
                Akses Terbatas (User)
              </span>
            </div>

            <div className="bg-white/10 border border-white/15 rounded-xl p-4 space-y-3">
              <div className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-emerald-400">verified</span>
                Profil Pengguna Login Saat Ini
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block text-[11px]">Nama Pegawai:</span>
                  <span className="font-bold text-white">{currentUser?.nama || 'Pengguna SIPATI'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">NIP:</span>
                  <span className="font-mono font-semibold text-cyan-300">{currentUser?.nip || '-'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Jabatan / Unit Kerja:</span>
                  <span className="font-semibold text-white">{currentUser?.jabatan || currentUser?.role || 'Staff Operasional'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Username Login Anda:</span>
                  <span className="font-mono font-bold text-cyan-300">{currentUser?.username || '-'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 text-[11.5px] text-gray-300 flex items-start gap-2">
                <span className="material-symbols-outlined text-sm text-cyan-300 shrink-0 mt-0.5">info</span>
                <span>
                  Jika Anda memerlukan perubahan Username, Password, atau hak akses login aplikasi, silakan hubungi <strong>Officer / Administrator Bagian Tata Pemerintahan</strong>.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* INTEGRASI EKOSISTEM GOOGLE DRIVE API & CONFIGURATION */}
        <GoogleDriveManager />

        <div className="bg-black/45 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/15 pb-3">
            <div>
              <h3 className="font-['Lora',serif] text-[16px] font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-cyan-300">folder_managed</span>
                Target Folder Google Drive &amp; Parameter Sinkronisasi
              </h3>
              <p className="text-xs text-gray-300 mt-0.5">
                Atur ID Folder Google Drive target tempat seluruh dokumen yang diunggah akan disimpan &amp; disinkronkan secara otomatis.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-['Inter',sans-serif] font-semibold text-[11px] uppercase text-cyan-300 mb-1">
                ID Folder Google Drive Utama (Google Drive Folder ID)
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base">
                  folder_special
                </span>
                <input
                  type="text"
                  required
                  value={driveConfig.folderId}
                  onChange={(e) => {
                    const newConfig = { ...driveConfig, folderId: e.target.value };
                    setDriveConfigState(newConfig);
                    saveDriveConfig(newConfig);
                  }}
                  placeholder="Contoh: 1A2b3C4d5E6f7G8h9I0j-SIPATI_KubuRaya"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl font-mono text-[13px] text-white focus:outline-none focus:border-[#00a3e0]"
                />
              </div>
              <p className="text-[11px] text-gray-300 mt-1">
                Dapatkan ID folder dari URL Google Drive Anda (karakter setelah <code>/folders/</code>).
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-['Inter',sans-serif] font-semibold text-[11px] uppercase text-cyan-300 mb-1">
                Tautan / Link Shared Folder Google Drive
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base">
                  link
                </span>
                <input
                  type="text"
                  value={driveConfig.sharedFolderUrl}
                  onChange={(e) => {
                    const newConfig = { ...driveConfig, sharedFolderUrl: e.target.value };
                    setDriveConfigState(newConfig);
                    saveDriveConfig(newConfig);
                  }}
                  placeholder="https://drive.google.com/drive/folders/1A2b3C4d5E..."
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl font-mono text-[12.5px] text-white focus:outline-none focus:border-[#00a3e0]"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-['Inter',sans-serif] font-semibold text-[11px] uppercase text-cyan-300 mb-1">
                Google Workspace Service Account Email / OAuth Client ID
              </label>
              <input
                type="text"
                value={driveConfig.serviceAccountEmail}
                onChange={(e) => {
                  const newConfig = { ...driveConfig, serviceAccountEmail: e.target.value };
                  setDriveConfigState(newConfig);
                  saveDriveConfig(newConfig);
                }}
                placeholder="sipati-drive-service@kuburaya.iam.gserviceaccount.com"
                className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl font-mono text-[12.5px] text-white focus:outline-none focus:border-[#00a3e0]"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/15">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoSyncCheck"
                checked={googleDriveSync}
                onChange={(e) => setGoogleDriveSync(e.target.checked)}
                className="w-4 h-4 accent-[#00a3e0] cursor-pointer"
              />
              <label htmlFor="autoSyncCheck" className="text-xs font-medium text-gray-200 cursor-pointer">
                Otomatis Sinkronkan Seluruh Dokumen yang Diunggah ke ID Google Drive di atas
              </label>
            </div>

            <button
              type="button"
              onClick={() => {
                openInGoogleDrive();
              }}
              className="px-4 py-2 bg-[#00a3e0] hover:bg-[#008bc2] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg hover:shadow-cyan-500/25"
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              <span>Uji &amp; Buka Folder Google Drive</span>
            </button>
          </div>
        </div>

        {/* PENGATURAN AKSES LOGIN & KEAMANAN */}
        <div className="bg-black/45 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/15 pb-3">
            <div>
              <h3 className="font-['Lora',serif] text-[16px] font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-cyan-300">lock</span>
                Pengaturan Akses Login &amp; Sesi Keamanan
              </h3>
              <p className="text-xs text-gray-300 mt-0.5">
                Konfigurasi syarat otentikasi login pengguna sebelum dapat masuk ke dalam sistem aplikasi SIPATI.
              </p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              isAuthenticated
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-400/50'
                : 'bg-rose-950/80 text-rose-300 border-rose-400/50'
            }`}>
              <span className="material-symbols-outlined text-sm">verified_user</span>
              {isAuthenticated ? 'Status: Terautentikasi' : 'Status: Sesi Tamu'}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-['Inter',sans-serif] font-semibold text-[13.5px] text-white">
                  Wajibkan Login Sebelum Masuk Aplikasi
                </h4>
                <p className="font-['Inter',sans-serif] text-xs text-gray-300">
                  Setiap pengguna harus memasukkan Username/NIP &amp; Password di halaman Login untuk dapat mengakses data pekerjaan.
                </p>
              </div>
              <input
                type="checkbox"
                checked={requireLogin}
                disabled={!isOfficer}
                onChange={(e) => onToggleRequireLogin && onToggleRequireLogin(e.target.checked)}
                className={`w-5 h-5 accent-[#00a3e0] ${isOfficer ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                title={isOfficer ? 'Ubah syarat login' : 'Hanya Officer yang dapat mengubah syarat login'}
              />
            </div>

            {onLogout && (
              <div className="pt-2 border-t border-white/15 flex flex-wrap justify-between items-center gap-2">
                <span className="text-xs text-gray-300">
                  Sesi Pengguna Saat Ini: <strong>{currentUser?.nama || 'Drs. H. Mulyadi, M.Si'} ({currentUser?.role || 'Officer / Administrator'})</strong>
                </span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  <span>Keluar / Logout Akun</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notifikasi & Otomasi Pelaporan */}
        <div className="bg-black/45 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl space-y-4">
          <h3 className="font-['Lora',serif] text-[16px] font-bold text-white border-b border-white/15 pb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-cyan-300">mark_email_read</span>
            Notifikasi &amp; Otomasi Pelaporan
          </h3>

          <div>
            <label className="block font-['Inter',sans-serif] font-semibold text-[11px] uppercase text-cyan-300 mb-1">
              Email Utama Penerima Laporan Eksekutif
            </label>
            <input
              type="email"
              value={emailNotif}
              onChange={(e) => setEmailNotif(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/10 border border-white/20 rounded-xl font-['Inter',sans-serif] text-[13.5px] text-white focus:outline-none focus:border-[#00a3e0]"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <h4 className="font-['Inter',sans-serif] font-semibold text-[13.5px] text-white">
                Arsip Otomatis saat Pekerjaan 'SELESAI'
              </h4>
              <p className="font-['Inter',sans-serif] text-xs text-gray-300">
                Otomatis mengarsipkan dokumen tugas ke menu Arsip Digital saat status diubah menjadi SELESAI.
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoArchive}
              onChange={(e) => setAutoArchive(e.target.checked)}
              className="w-5 h-5 accent-[#00a3e0] cursor-pointer"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {saved ? (
            <div className="p-3 bg-emerald-950/80 border border-emerald-400 text-emerald-200 rounded-xl text-xs font-['Inter',sans-serif] font-bold flex items-center gap-2 animate-fadeIn w-full sm:w-auto">
              <span className="material-symbols-outlined text-base text-emerald-400">check_circle</span>
              <span>Seluruh pengaturan &amp; akun pengguna telah berhasil disimpan!</span>
            </div>
          ) : (
            <div className="text-xs text-gray-300 italic">
              {isOfficer
                ? 'Klik simpan untuk memperbarui seluruh konfigurasi ke database cloud.'
                : '🔒 Mode Lihat Saja: Pengajuan perubahan hanya dapat dilakukan oleh Officer / Admin.'}
            </div>
          )}
          <button
            type="submit"
            disabled={!isOfficer}
            className={`w-full sm:w-auto font-['Inter',sans-serif] font-bold text-[13px] uppercase tracking-wider px-7 py-3.5 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 shrink-0 ${
              isOfficer
                ? 'bg-[#00a3e0] hover:bg-[#008bc2] text-white hover:shadow-cyan-500/25 cursor-pointer active:scale-95'
                : 'bg-slate-700 text-slate-400 border border-slate-600 cursor-not-allowed opacity-75'
            }`}
            title={isOfficer ? 'Simpan Seluruh Pengaturan' : 'Hanya Officer / Admin yang dapat menyimpan pengaturan'}
          >
            <span className="material-symbols-outlined text-lg">{isOfficer ? 'save' : 'lock'}</span>
            <span>{isOfficer ? 'Simpan Seluruh Pengaturan' : 'Pengaturan Terkunci (Khusus Admin)'}</span>
          </button>
        </div>
      </form>

      {/* MODAL TAMBAH / EDIT ANGGOTA & ATUR USERNAME & PASSWORD */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#002845] border border-cyan-500/40 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col font-['Inter',sans-serif] text-white">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#003b5c] via-[#005f8e] to-[#003b5c] text-white px-5 py-3.5 flex items-center justify-between border-b border-white/15">
              <h4 className="font-['Lora',serif] font-bold text-base text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-300">person_add</span>
                {editingMemberId ? 'Pengaturan Akses & Account Officer' : 'Tambah Pengguna Baru'}
              </h4>
              <button
                type="button"
                onClick={() => setIsMemberModalOpen(false)}
                className="text-white/80 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveMember} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300 mb-1">
                  NAMA LENGKAP ANGGOTA
                </label>
                <input
                  type="text"
                  required
                  value={memberForm.nama}
                  onChange={(e) => setMemberForm({ ...memberForm, nama: e.target.value })}
                  placeholder="Contoh: Drs. H. Mulyadi, M.Si"
                  className="w-full px-3.5 py-2 bg-white/10 border border-white/20 rounded-xl text-xs text-white font-medium focus:border-[#00a3e0] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300 mb-1">
                  NIP / ID PEGAWAI
                </label>
                <input
                  type="text"
                  required
                  value={memberForm.nip}
                  onChange={(e) => setMemberForm({ ...memberForm, nip: e.target.value })}
                  placeholder="19780512 200312 1 002"
                  className="w-full px-3.5 py-2 bg-white/10 border border-white/20 rounded-xl text-xs font-mono text-white font-medium focus:border-[#00a3e0] outline-none"
                />
              </div>

              <div className="p-3 bg-white/5 border border-white/15 rounded-xl space-y-3">
                <div className="text-xs font-bold uppercase text-cyan-300 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">lock_person</span>
                  Setting Kredensial Login (Akses Officer)
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">
                    USERNAME LOGIN
                  </label>
                  <input
                    type="text"
                    required
                    value={memberForm.username}
                    onChange={(e) => setMemberForm({ ...memberForm, username: e.target.value })}
                    placeholder="Contoh: mulyadi atau NIP"
                    className="w-full px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-xs font-mono font-bold text-cyan-300 focus:border-[#00a3e0] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">
                    KATA SANDI / PASSWORD
                  </label>
                  <input
                    type="text"
                    required
                    value={memberForm.password}
                    onChange={(e) => setMemberForm({ ...memberForm, password: e.target.value })}
                    placeholder="Masukkan Password Baru"
                    className="w-full px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-xs font-mono text-white focus:border-[#00a3e0] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-gray-300 mb-1">
                    PERAN / PERIZINAN HAK AKSES
                  </label>
                  <select
                    value={memberForm.role}
                    onChange={(e) =>
                      setMemberForm({
                        ...memberForm,
                        role: e.target.value as TeamMember['role'],
                      })
                    }
                    className="w-full px-3 py-1.5 bg-[#002845] border border-white/20 rounded-lg text-xs text-white font-medium outline-none cursor-pointer"
                  >
                    <option value="Officer / Administrator">Officer / Administrator</option>
                    <option value="Analis Kebijakan">Analis Kebijakan</option>
                    <option value="Staf Operasional">Staf Operasional</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300 mb-1">
                  JABATAN / SUB-BAGIAN FORMAL
                </label>
                <select
                  value={memberForm.subBagian}
                  onChange={(e) => {
                    const selected = e.target.value;
                    setMemberForm({
                      ...memberForm,
                      subBagian: selected,
                      jabatan: memberForm.jabatan ? memberForm.jabatan : selected,
                    });
                  }}
                  className="w-full px-3.5 py-2 bg-[#002845] border border-white/20 rounded-xl text-xs text-white font-medium focus:border-[#00a3e0] outline-none cursor-pointer"
                >
                  <option value="Kepala Bagian Tata Pemerintahan">Kepala Bagian Tata Pemerintahan</option>
                  <option value="Analis Kebijakan Ahli Muda">Analis Kebijakan Ahli Muda</option>
                  <option value="Analis Kebijakan Ahli Pertama">Analis Kebijakan Ahli Pertama</option>
                  <option value="Penelaah Teknis Kebijakan">Penelaah Teknis Kebijakan</option>
                  <option value="Analis Kewilayahan">Analis Kewilayahan</option>
                  <option value="Pengadministrasi Umum">Pengadministrasi Umum</option>
                  <option value="Pengelola Layanan Operasional">Pengelola Layanan Operasional</option>
                  <option value="Tenaga Pendukung Teknis (Outsourcing)">Tenaga Pendukung Teknis (Outsourcing)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-white/15 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-4 py-2 border border-white/20 bg-white/10 text-white rounded-xl font-bold text-xs hover:bg-white/20 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00a3e0] hover:bg-[#008bc2] text-white rounded-xl font-bold text-xs shadow-lg cursor-pointer"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banner Edit Modal for Admin */}
      {isBannerModalOpen && banner && (
        <BannerEditModal
          banner={banner}
          onClose={() => setIsBannerModalOpen(false)}
          onSave={(updatedBanner) => {
            setIsBannerModalOpen(false);
            if (onSaveBannerConfig) onSaveBannerConfig(updatedBanner);
          }}
        />
      )}
    </div>
  );
};

