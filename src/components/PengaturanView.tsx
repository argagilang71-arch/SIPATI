import React, { useState, useEffect } from 'react';
import garudaEmblemImg from '../assets/images/garuda_pancasila_emblem_1784830236371.jpg';
import { getDriveConfig, saveDriveConfig, openInGoogleDrive, GoogleDriveConfig } from '../utils/fileStorage';
import { GoogleDriveManager } from './GoogleDriveManager';
import {
  saveTeamMembersToCloud,
  loadTeamMembersFromCloud,
  subscribeTeamMembersCloud,
  saveSettingsToCloud,
  loadSettingsFromCloud,
} from '../utils/firebaseSync';
import { TeamMember } from '../types';

interface PengaturanViewProps {
  requireLogin?: boolean;
  onToggleRequireLogin?: (val: boolean) => void;
  isAuthenticated?: boolean;
  onLogout?: () => void;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  requireLogin = true,
  onToggleRequireLogin,
  isAuthenticated = true,
  onLogout,
}) => {
  const [namaInstansi, setNamaInstansi] = useState(
    'Bagian Tata Pemerintahan Sekretariat Daerah Kabupaten Kubu Raya'
  );
  const [namaAdmin, setNamaAdmin] = useState('Drs. H. Mulyadi, M.Si');
  const [nipAdmin, setNipAdmin] = useState('19780512 200312 1 002');
  const [emailNotif, setEmailNotif] = useState('tatapemerintahan@kuburayakab.go.id');
  const [autoArchive, setAutoArchive] = useState(true);
  const [googleDriveSync, setGoogleDriveSync] = useState(true);
  const [googleDriveConnected, setGoogleDriveConnected] = useState(true);
  const [saved, setSaved] = useState(false);

  // Google Drive Configuration State
  const [driveConfig, setDriveConfigState] = useState<GoogleDriveConfig>(getDriveConfig());

  // Current logged in user state
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Password visibility map for table
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('sipati_current_user');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

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
      id: 'm-1',
      nama: 'Drs. H. Mulyadi, M.Si',
      nip: '19780512 200312 1 002',
      jabatan: 'Kepala Bagian Tata Pemerintahan',
      subBagian: 'Kepala Bagian Tata Pemerintahan',
      username: '197805122003121002',
      password: 'admin123',
      role: 'Officer / Administrator',
    },
    {
      id: 'm-2',
      nama: 'Siti Rahma, S.IP, M.Si',
      nip: '19860920 200904 2 005',
      jabatan: 'Analis Kebijakan Ahli Muda',
      subBagian: 'Analis Kebijakan Ahli Muda',
      username: 'siti.rahma',
      password: 'user123',
      role: 'Analis Kebijakan',
    },
    {
      id: 'm-3',
      nama: 'Budi Santoso, S.STP, M.Si',
      nip: '19820415 200602 1 003',
      jabatan: 'Analis Kebijakan Ahli Pertama',
      subBagian: 'Analis Kebijakan Ahli Pertama',
      username: 'budi.santoso',
      password: 'user123',
      role: 'Analis Kebijakan',
    },
    {
      id: 'm-4',
      nama: 'Hendra Wijaya, S.IP',
      nip: '19890510 201201 1 004',
      jabatan: 'Penelaah Teknis Kebijakan',
      subBagian: 'Penelaah Teknis Kebijakan',
      username: 'hendra.w',
      password: 'user123',
      role: 'Staf Operasional',
    },
    {
      id: 'm-5',
      nama: 'Ahmad Subagyo, S.E.',
      nip: '19910314 201503 1 002',
      jabatan: 'Analis Kewilayahan',
      subBagian: 'Analis Kewilayahan',
      username: 'ahmad.s',
      password: 'user123',
      role: 'Staf Operasional',
    },
    {
      id: 'm-6',
      nama: 'Drs. Suparna',
      nip: '19720310 199803 1 004',
      jabatan: 'Pengadministrasi Umum',
      subBagian: 'Pengadministrasi Umum',
      username: 'suparna',
      password: 'user123',
      role: 'Staf Operasional',
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
    try {
      saveDriveConfig(driveConfig);
      await saveTeamMembersToCloud(anggotaList);
      await saveSettingsToCloud({
        namaInstansi,
        namaAdmin,
        nipAdmin,
        emailNotif,
        autoArchive,
      });

      setSaved(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSaved(false), 3500);
    } catch (err) {
      console.error('Gagal menyimpan pengaturan:', err);
      alert('Terjadi kesalahan saat menyimpan pengaturan.');
    }
  };

  const toggleShowPassword = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 max-w-5xl pb-12">
      {/* Title */}
      <div>
        <h2 className="font-['Lora',serif] text-[22px] sm:text-[26px] font-bold text-[#57000f] mb-1">
          Pengaturan Sistem &amp; Manajemen Akun Pengguna
        </h2>
        <p className="text-[#574141] font-['Inter',sans-serif] text-[13.5px]">
          Kelola identitas instansi, ID Google Drive target, serta kredensial Login (Username &amp; Password) untuk seluruh staff Officer.
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-[#2F6B44]/15 border border-[#2F6B44] text-[#2F6B44] rounded-lg text-xs font-['Inter',sans-serif] font-semibold flex items-center gap-2 animate-fadeIn">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          Seluruh konfigurasi sistem, ID Google Drive, dan akun login pengguna berhasil disimpan!
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Identitas Panitia & Satuan Kerja */}
        <div className="bg-[#FFFDF8] border border-[#E4DCC8] rounded-xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E4DCC8] pb-3">
            <h3 className="font-['Lora',serif] text-[16px] font-bold text-[#57000f] flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">domain</span>
              Identitas Panitia &amp; Satuan Kerja
            </h3>
            <div className="flex items-center gap-2">
              <img
                src={garudaEmblemImg}
                alt="Lambang Garuda Pancasila"
                className="w-8 h-8 object-contain rounded-full border border-[#E4DCC8] p-0.5 bg-white shadow-2xs"
              />
              <span className="text-xs font-semibold text-[#57000f] hidden sm:inline-block">Lambang Resmi Garuda Pancasila</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-['Inter',sans-serif] font-semibold text-[11px] uppercase text-[#6E6A61] mb-1">
                Nama Instansi / Satuan Kerja
              </label>
              <input
                type="text"
                value={namaInstansi}
                onChange={(e) => setNamaInstansi(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#E4DCC8] rounded-md font-['Inter',sans-serif] text-[13.5px] text-[#20201D] focus:outline-none focus:border-[#b62230]"
              />
            </div>

            <div>
              <label className="block font-['Inter',sans-serif] font-semibold text-[11px] uppercase text-[#6E6A61] mb-1">
                Nama Pejabat Penanggung Jawab
              </label>
              <input
                type="text"
                value={namaAdmin}
                onChange={(e) => setNamaAdmin(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#E4DCC8] rounded-md font-['Inter',sans-serif] text-[13.5px] text-[#20201D] focus:outline-none focus:border-[#b62230]"
              />
            </div>

            <div>
              <label className="block font-['Inter',sans-serif] font-semibold text-[11px] uppercase text-[#6E6A61] mb-1">
                NIP / ID Pejabat Penanggung Jawab
              </label>
              <input
                type="text"
                value={nipAdmin}
                onChange={(e) => setNipAdmin(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#E4DCC8] rounded-md font-['JetBrains_Mono',monospace] text-[13.5px] text-[#20201D] focus:outline-none focus:border-[#b62230]"
              />
            </div>
          </div>
        </div>

        {/* PENGATURAN KREDENSIAL LOGIN & DAFTAR ANGGOTA (BERDASARKAN PERAN HAK AKSES) */}
        {isOfficer ? (
          <div className="bg-[#FFFDF8] border border-[#E4DCC8] rounded-xl p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4DCC8] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-['Lora',serif] text-[16px] font-bold text-[#57000f] flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">manage_accounts</span>
                    Manajemen Username &amp; Password Pengguna (Akses Officer)
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                    Sesi Officer Aktif
                  </span>
                </div>
                <p className="text-xs text-[#6E6A61] mt-0.5">
                  Sebagai Officer / Administrator, Anda berhak melihat, menambah, dan mengubah Username &amp; Password login seluruh staf.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAddMember}
                className="px-3.5 py-2 bg-[#b62230] hover:bg-[#57000f] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto shadow-2xs active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">person_add</span>
                <span>Tambah Pengguna / Akun</span>
              </button>
            </div>

            {/* Table / List of Members with Username & Password */}
            <div className="overflow-x-auto rounded-lg border border-[#E4DCC8]">
              <table className="w-full text-left text-xs font-['Inter',sans-serif]">
                <thead className="bg-[#fcf8ee] border-b border-[#E4DCC8] font-bold uppercase text-[#6E6A61]">
                  <tr>
                    <th className="p-3">Nama Pengguna / NIP</th>
                    <th className="p-3">Jabatan &amp; Peran</th>
                    <th className="p-3">Username Login</th>
                    <th className="p-3">Kata Sandi (Password)</th>
                    <th className="p-3 text-right">Aksi Officer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4DCC8]/60 text-[#1c1c16]">
                  {anggotaList.map((member) => (
                    <tr key={member.id} className="hover:bg-[#fdfaf2] transition">
                      <td className="p-3">
                        <div className="font-semibold text-[#1c1c16]">{member.nama}</div>
                        <div className="font-mono text-[11px] text-[#57000f]">NIP: {member.nip}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-[#1c1c16] font-medium">{member.jabatan}</div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#57000f]/10 text-[#57000f] border border-[#57000f]/20">
                          {member.role || 'Analis Kebijakan'}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-[#b62230] bg-[#fdfaf2]">
                        {member.username}
                      </td>
                      <td className="p-3 font-mono font-semibold text-[#1c1c16]">
                        <div className="flex items-center gap-2">
                          <span>
                            {visiblePasswords[member.id]
                              ? member.password || 'user123'
                              : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleShowPassword(member.id)}
                            className="text-[#6E6A61] hover:text-[#57000f] transition cursor-pointer"
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
                            className="px-2.5 py-1 text-xs font-semibold bg-[#b62230]/10 text-[#b62230] hover:bg-[#b62230] hover:text-white rounded transition cursor-pointer flex items-center gap-1"
                            title="Atur Username & Password"
                          >
                            <span className="material-symbols-outlined text-sm">key</span>
                            <span>Atur Akses</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMember(member.id)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition cursor-pointer"
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
          <div className="bg-[#FFFDF8] border border-amber-300 rounded-xl p-6 shadow-2xs space-y-4 font-['Inter',sans-serif]">
            <div className="flex items-center justify-between border-b border-amber-200 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-amber-700 text-xl">lock_clock</span>
                <div>
                  <h3 className="font-['Lora',serif] text-[16px] font-bold text-[#57000f]">
                    Informasi Akun Pengguna Terautentikasi
                  </h3>
                  <p className="text-xs text-[#6E6A61] mt-0.5">
                    Akses Fitur Manajemen Seluruh Akun, Username &amp; Password Pengguna Dibatasi Khusus Officer / Administrator.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                Akses Terbatas (User)
              </span>
            </div>

            <div className="bg-[#fcf8ee] border border-[#E4DCC8] rounded-lg p-4 space-y-3">
              <div className="text-xs font-bold text-[#57000f] uppercase tracking-wider flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-emerald-600">verified</span>
                Profil Pengguna Login Saat Ini
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[#6E6A61] block text-[11px]">Nama Pegawai:</span>
                  <span className="font-bold text-[#1c1c16]">{currentUser?.nama || 'Pengguna SIPATI'}</span>
                </div>
                <div>
                  <span className="text-[#6E6A61] block text-[11px]">NIP:</span>
                  <span className="font-mono font-semibold text-[#57000f]">{currentUser?.nip || '-'}</span>
                </div>
                <div>
                  <span className="text-[#6E6A61] block text-[11px]">Jabatan / Unit Kerja:</span>
                  <span className="font-semibold text-[#1c1c16]">{currentUser?.jabatan || currentUser?.role || 'Staff Operasional'}</span>
                </div>
                <div>
                  <span className="text-[#6E6A61] block text-[11px]">Username Login Anda:</span>
                  <span className="font-mono font-bold text-[#b62230]">{currentUser?.username || '-'}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#E4DCC8] text-[11.5px] text-[#574141] flex items-start gap-2">
                <span className="material-symbols-outlined text-sm text-amber-700 shrink-0 mt-0.5">info</span>
                <span>
                  Jika Anda memerlukan perubahan Username, Password, atau hak akses login aplikasi, silakan hubungi <strong>Officer / Administrator Bagian Tata Pemerintahan</strong>.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* INTEGRASI EKOSISTEM GOOGLE DRIVE API & CONFIGURATION */}
        <GoogleDriveManager />

        <div className="bg-[#FFFDF8] border border-[#E4DCC8] rounded-xl p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4DCC8] pb-3">
            <div>
              <h3 className="font-['Lora',serif] text-[16px] font-bold text-[#57000f] flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">folder_managed</span>
                Target Folder Google Drive &amp; Parameter Sinkronisasi
              </h3>
              <p className="text-xs text-[#6E6A61] mt-0.5">
                Atur ID Folder Google Drive target tempat seluruh dokumen yang diunggah akan disimpan &amp; disinkronkan secara otomatis.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-['Inter',sans-serif] font-semibold text-[11px] uppercase text-[#6E6A61] mb-1">
                ID Folder Google Drive Utama (Google Drive Folder ID)
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6A61] text-base">
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
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#ffffff] border border-[#E4DCC8] rounded-md font-mono text-[13px] text-[#20201D] focus:outline-none focus:border-[#b62230]"
                />
              </div>
              <p className="text-[11px] text-[#6E6A61] mt-1">
                Dapatkan ID folder dari URL Google Drive Anda (karakter setelah <code>/folders/</code>).
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-['Inter',sans-serif] font-semibold text-[11px] uppercase text-[#6E6A61] mb-1">
                Tautan / Link Shared Folder Google Drive
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6A61] text-base">
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
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[#ffffff] border border-[#E4DCC8] rounded-md font-mono text-[12.5px] text-[#20201D] focus:outline-none focus:border-[#b62230]"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-['Inter',sans-serif] font-semibold text-[11px] uppercase text-[#6E6A61] mb-1">
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
                className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#E4DCC8] rounded-md font-mono text-[12.5px] text-[#20201D] focus:outline-none focus:border-[#b62230]"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#E4DCC8]">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoSyncCheck"
                checked={googleDriveSync}
                onChange={(e) => setGoogleDriveSync(e.target.checked)}
                className="w-4 h-4 accent-[#b62230] cursor-pointer"
              />
              <label htmlFor="autoSyncCheck" className="text-xs font-medium text-[#20201D] cursor-pointer">
                Otomatis Sinkronkan Seluruh Dokumen yang Diunggah ke ID Google Drive di atas
              </label>
            </div>

            <button
              type="button"
              onClick={() => {
                openInGoogleDrive();
              }}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              <span>Uji &amp; Buka Folder Google Drive</span>
            </button>
          </div>
        </div>

        {/* PENGATURAN AKSES LOGIN & KEAMANAN */}
        <div className="bg-[#FFFDF8] border border-[#E4DCC8] rounded-xl p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4DCC8] pb-3">
            <div>
              <h3 className="font-['Lora',serif] text-[16px] font-bold text-[#57000f] flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">lock</span>
                Pengaturan Akses Login &amp; Sesi Keamanan
              </h3>
              <p className="text-xs text-[#6E6A61] mt-0.5">
                Konfigurasi syarat otentikasi login pengguna sebelum dapat masuk ke dalam sistem aplikasi SIPATI.
              </p>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              isAuthenticated
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                : 'bg-rose-50 text-rose-800 border-rose-300'
            }`}>
              <span className="material-symbols-outlined text-sm">verified_user</span>
              {isAuthenticated ? 'Status: Terautentikasi' : 'Status: Sesi Tamu'}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-['Inter',sans-serif] font-semibold text-[13.5px] text-[#20201D]">
                  Wajibkan Login Sebelum Masuk Aplikasi
                </h4>
                <p className="font-['Inter',sans-serif] text-xs text-[#6E6A61]">
                  Setiap pengguna harus memasukkan Username/NIP &amp; Password di halaman Login untuk dapat mengakses data pekerjaan.
                </p>
              </div>
              <input
                type="checkbox"
                checked={requireLogin}
                disabled={!isOfficer}
                onChange={(e) => onToggleRequireLogin && onToggleRequireLogin(e.target.checked)}
                className={`w-5 h-5 accent-[#b62230] ${isOfficer ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                title={isOfficer ? 'Ubah syarat login' : 'Hanya Officer yang dapat mengubah syarat login'}
              />
            </div>

            {onLogout && (
              <div className="pt-2 border-t border-[#E4DCC8] flex flex-wrap justify-between items-center gap-2">
                <span className="text-xs text-[#6E6A61]">
                  Sesi Pengguna Saat Ini: <strong>{currentUser?.nama || 'Drs. H. Mulyadi, M.Si'} ({currentUser?.role || 'Officer / Administrator'})</strong>
                </span>
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">logout</span>
                  <span>Keluar / Logout Akun</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notifikasi & Otomasi Pelaporan */}
        <div className="bg-[#FFFDF8] border border-[#E4DCC8] rounded-xl p-6 shadow-2xs space-y-4">
          <h3 className="font-['Lora',serif] text-[16px] font-bold text-[#57000f] border-b border-[#E4DCC8] pb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">mark_email_read</span>
            Notifikasi &amp; Otomasi Pelaporan
          </h3>

          <div>
            <label className="block font-['Inter',sans-serif] font-semibold text-[11px] uppercase text-[#6E6A61] mb-1">
              Email Utama Penerima Laporan Eksekutif
            </label>
            <input
              type="email"
              value={emailNotif}
              onChange={(e) => setEmailNotif(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#ffffff] border border-[#E4DCC8] rounded-md font-['Inter',sans-serif] text-[13.5px] text-[#20201D] focus:outline-none focus:border-[#b62230]"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <h4 className="font-['Inter',sans-serif] font-semibold text-[13.5px] text-[#20201D]">
                Arsip Otomatis saat Pekerjaan 'SELESAI'
              </h4>
              <p className="font-['Inter',sans-serif] text-xs text-[#6E6A61]">
                Otomatis mengarsipkan dokumen tugas ke menu Arsip Digital saat status diubah menjadi SELESAI.
              </p>
            </div>
            <input
              type="checkbox"
              checked={autoArchive}
              onChange={(e) => setAutoArchive(e.target.checked)}
              className="w-5 h-5 accent-[#b62230] cursor-pointer"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="bg-[#b62230] hover:bg-[#57000f] text-white font-['Inter',sans-serif] font-bold text-[13px] uppercase tracking-wider px-7 py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">save</span>
            <span>Simpan Seluruh Pengaturan</span>
          </button>
        </div>
      </form>

      {/* MODAL TAMBAH / EDIT ANGGOTA & ATUR USERNAME & PASSWORD */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-[#FFFDF8] rounded-xl border border-[#E4DCC8] shadow-2xl max-w-md w-full overflow-hidden flex flex-col font-['Inter',sans-serif]">
            {/* Header */}
            <div className="bg-[#57000f] text-white px-5 py-3.5 flex items-center justify-between">
              <h4 className="font-['Lora',serif] font-bold text-base text-white">
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
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6A61] mb-1">
                  NAMA LENGKAP ANGGOTA
                </label>
                <input
                  type="text"
                  required
                  value={memberForm.nama}
                  onChange={(e) => setMemberForm({ ...memberForm, nama: e.target.value })}
                  placeholder="Contoh: Drs. H. Mulyadi, M.Si"
                  className="w-full px-3.5 py-2 bg-white border border-[#E4DCC8] rounded-md text-xs text-[#1c1c16] font-medium focus:border-[#b62230] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6A61] mb-1">
                  NIP / ID PEGAWAI
                </label>
                <input
                  type="text"
                  required
                  value={memberForm.nip}
                  onChange={(e) => setMemberForm({ ...memberForm, nip: e.target.value })}
                  placeholder="19780512 200312 1 002"
                  className="w-full px-3.5 py-2 bg-white border border-[#E4DCC8] rounded-md text-xs font-mono text-[#1c1c16] font-medium focus:border-[#b62230] outline-none"
                />
              </div>

              <div className="p-3 bg-[#fdfaf2] border border-[#E4DCC8] rounded-lg space-y-3">
                <div className="text-xs font-bold uppercase text-[#57000f] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">lock_person</span>
                  Setting Kredensial Login (Akses Officer)
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#6E6A61] mb-1">
                    USERNAME LOGIN
                  </label>
                  <input
                    type="text"
                    required
                    value={memberForm.username}
                    onChange={(e) => setMemberForm({ ...memberForm, username: e.target.value })}
                    placeholder="Contoh: mulyadi atau NIP"
                    className="w-full px-3 py-1.5 bg-white border border-[#E4DCC8] rounded text-xs font-mono font-bold text-[#b62230] focus:border-[#b62230] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#6E6A61] mb-1">
                    KATA SANDI / PASSWORD
                  </label>
                  <input
                    type="text"
                    required
                    value={memberForm.password}
                    onChange={(e) => setMemberForm({ ...memberForm, password: e.target.value })}
                    placeholder="Masukkan Password Baru"
                    className="w-full px-3 py-1.5 bg-white border border-[#E4DCC8] rounded text-xs font-mono text-[#1c1c16] focus:border-[#b62230] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-[#6E6A61] mb-1">
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
                    className="w-full px-3 py-1.5 bg-white border border-[#E4DCC8] rounded text-xs text-[#1c1c16] font-medium outline-none cursor-pointer"
                  >
                    <option value="Officer / Administrator">Officer / Administrator</option>
                    <option value="Analis Kebijakan">Analis Kebijakan</option>
                    <option value="Staf Operasional">Staf Operasional</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6A61] mb-1">
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
                  className="w-full px-3.5 py-2 bg-white border border-[#E4DCC8] rounded-md text-xs text-[#1c1c16] font-medium focus:border-[#b62230] outline-none cursor-pointer"
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

              <div className="pt-3 border-t border-[#E4DCC8] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-4 py-2 border border-[#E4DCC8] bg-white text-[#20201D] rounded font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#b62230] hover:bg-[#57000f] text-white rounded font-bold text-xs shadow-xs cursor-pointer"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

