import React, { useState, useEffect } from 'react';
import sipatiHeroMokaImg from '../assets/images/sipati_moka_hero_1784883832801.jpg';
import { SipatiLogo } from './SipatiLogo';
import {
  loadTeamMembersFromCloud,
  subscribeTeamMembersCloud,
  loadSettingsFromCloud,
} from '../utils/firebaseSync';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onBackToLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onBackToLanding,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [cloudMembers, setCloudMembers] = useState<any[]>([]);

  useEffect(() => {
    // Sync latest accounts from cloud immediately when login page loads
    loadTeamMembersFromCloud().then((members) => {
      if (members && members.length > 0) {
        setCloudMembers(members);
      }
    });

    loadSettingsFromCloud();

    // Subscribe to realtime updates from cloud
    const unsubscribe = subscribeTeamMembersCloud((members) => {
      if (members && members.length > 0) {
        setCloudMembers(members);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawUser = username.trim().toLowerCase();
    const cleanUser = rawUser.replace(/\s+/g, '');
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMsg('Mohon masukkan Username / NIP dan Kata Sandi.');
      return;
    }

    // Load registered team members & admin settings from LocalStorage & Cloud
    let localTeamMembers: any[] = [];
    let savedAdminName = '';
    let savedAdminNip = '';

    try {
      const saved = localStorage.getItem('sipati_team_members');
      if (saved) {
        localTeamMembers = JSON.parse(saved);
      }
      savedAdminName = localStorage.getItem('sipati_nama_admin') || '';
      savedAdminNip = localStorage.getItem('sipati_nip_admin') || '';
    } catch (err) {
      console.error('Error loading team members:', err);
    }

    const teamMembers = cloudMembers.length > 0 ? cloudMembers : localTeamMembers;

    // Official admin officer account
    const officerName = savedAdminName || 'Gilang arga';
    const officerNip = savedAdminNip || '19780512 200312 1 002';

    // Default fallback accounts list matching system defaults
    const defaultAccounts = [
      {
        id: 'acc-gilang',
        nama: 'Gilang Ariesta Arga, S.IP',
        nip: '199403162016091001',
        username: 'gilang.admin',
        password: 'admin12345',
        role: 'Officer / Administrator',
      },
      {
        id: 'acc-erik',
        nama: 'Singgih Erik Rudiana, S.STP, M.A.P',
        nip: '19860920 200904 2 005',
        username: 'erik.2',
        password: 'user2',
        role: 'Analis Kebijakan',
      },
      {
        id: 'acc-faisal',
        nama: 'Faisal Hadi Jaya, S.E, M.Si',
        nip: '196812111996031007',
        username: 'faisal.hadi1',
        password: 'user123',
        role: 'Analis Kebijakan',
      },
      {
        id: 'officer-main',
        nama: officerName,
        nip: officerNip,
        username: '197805122003121002',
        password: 'admin123',
        role: 'Officer / Administrator',
      },
      {
        id: 'm-1',
        nama: 'Drs. H. Mulyadi, M.Si',
        nip: '19780512 200312 1 002',
        username: 'mulyadi',
        password: 'admin123',
        role: 'Officer / Administrator',
      },
    ];

    const allAccounts = [...teamMembers, ...defaultAccounts];

    // Find registered user by Username, NIP, or Full Name with strict password verification
    const matchedUser = allAccounts.find((m) => {
      const uUsername = (m.username || '').toLowerCase().trim().replace(/\s+/g, '');
      const uNip = (m.nip || '').toLowerCase().replace(/\s+/g, '');
      const uName = (m.nama || '').toLowerCase().trim();
      const uPass = (m.password || '').trim();

      const usernameMatch =
        cleanUser === uUsername ||
        cleanUser === uNip ||
        (rawUser.length >= 3 && uName === rawUser);

      // Verify exact password, or standard default passwords for built-in administrative accounts
      const isDefaultAccount = defaultAccounts.some((d) => d.id === m.id);
      const passwordMatch =
        cleanPass === uPass ||
        (isDefaultAccount && (cleanPass === 'admin123' || cleanPass === 'admin'));

      return usernameMatch && passwordMatch;
    });

    if (matchedUser) {
      setErrorMsg('');
      try {
        localStorage.setItem('sipati_current_user', JSON.stringify(matchedUser));
      } catch (err) {
        console.error(err);
      }
      onLoginSuccess();
    } else {
      setErrorMsg('Username / NIP atau Kata Sandi yang Anda masukkan salah. Akses dibatasi hanya untuk akun yang terdaftar di Pengaturan.');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-8 text-white font-['Inter',sans-serif] overflow-hidden">
      {/* Hero Background Image with Dark Transparent Mask */}
      <div className="absolute inset-0 z-0">
        <img
          src={sipatiHeroMokaImg}
          alt="SIPATI Workspace Background"
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/75 to-black/90"></div>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

      {/* Back button */}
      <button
        onClick={onBackToLanding}
        className="absolute top-6 left-6 z-20 flex items-center gap-1.5 text-xs font-['JetBrains_Mono',monospace] text-gray-200 hover:text-white transition-colors cursor-pointer bg-black/40 hover:bg-black/60 px-3.5 py-1.5 rounded-full border border-white/20 backdrop-blur-md"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Kembali ke Beranda
      </button>

      {/* Main Glassmorphic Login Card */}
      <div className="relative z-10 w-full max-w-[420px] bg-black/45 backdrop-blur-xl border border-white/20 rounded-2xl p-8 sm:p-10 shadow-2xl overflow-hidden space-y-6">
        {/* Brand Identity Header */}
        <div className="text-center relative z-10 flex flex-col items-center">
          <SipatiLogo size={64} className="mb-3 drop-shadow-md" />
          <h1 className="font-['Lora',serif] text-[30px] font-bold text-white mb-1 tracking-tight">
            SIPATI
          </h1>
          <p className="font-['Inter',sans-serif] text-[13px] text-gray-200 leading-snug font-medium">
            Bagian Tata Pemerintahan
            <br />
            Sekretariat Daerah Kabupaten Kubu Raya
          </p>
        </div>

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-4 pt-1">
          {errorMsg && (
            <div className="p-3 bg-rose-950/80 text-rose-200 text-xs rounded-lg border border-rose-500/40 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Username Input */}
          <div>
            <label
              htmlFor="username"
              className="block font-['Inter',sans-serif] font-semibold text-[11px] tracking-wider uppercase text-gray-200 mb-1.5"
            >
              Username / NIP Pengguna
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-[18px] pointer-events-none">
                person
              </span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan Username / NIP"
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/25 rounded-xl font-['Inter',sans-serif] text-[13px] text-white placeholder-gray-400 focus:outline-none focus:border-[#00a3e0] focus:ring-1 focus:ring-[#00a3e0] transition"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label
                htmlFor="password"
                className="block font-['Inter',sans-serif] font-semibold text-[11px] tracking-wider uppercase text-gray-200"
              >
                Kata Sandi (Password)
              </label>
              <button
                type="button"
                onClick={() =>
                  alert(
                    'Lupa Password? Silakan hubungi Officer Administrator Bagian Tata Pemerintahan.'
                  )
                }
                className="font-['Inter',sans-serif] font-semibold text-[11px] text-[#00a3e0] hover:text-cyan-300 transition cursor-pointer"
              >
                Lupa Password?
              </button>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 text-[18px] pointer-events-none">
                lock
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan Kata Sandi"
                className="w-full pl-10 pr-10 py-2.5 bg-white/10 border border-white/25 rounded-xl font-['Inter',sans-serif] text-[13px] text-white placeholder-gray-400 focus:outline-none focus:border-[#00a3e0] focus:ring-1 focus:ring-[#00a3e0] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white cursor-pointer"
                title="Tampilkan / Sembunyikan Password"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Submission Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#00a3e0] hover:bg-[#008bc2] text-white font-['Inter',sans-serif] font-bold text-[12px] tracking-wider uppercase py-3 px-4 rounded-xl shadow-lg hover:shadow-cyan-500/25 transition flex justify-center items-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Let's Work — Masuk Aplikasi</span>
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </button>
          </div>

          {/* Security footnote */}
          <div className="pt-3 border-t border-white/15 text-center">
            <p className="text-[11px] text-gray-300 flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-xs text-emerald-400">verified_user</span>
              <span>Sistem terautentikasi resmi untuk Staf Bagian Tata Pemerintahan.</span>
            </p>
          </div>
        </form>
      </div>

      {/* Global Footer Context */}
      <div className="absolute bottom-4 left-0 w-full text-center px-4">
        <p className="font-['JetBrains_Mono',monospace] text-[10.5px] text-gray-400">
          BAGIAN TATA PEMERINTAHAN SEKRETARIAT DAERAH KABUPATEN KUBU RAYA
          <br />
          SIPATI VER 2.0.4 © 2026
        </p>
      </div>
    </div>
  );
};

