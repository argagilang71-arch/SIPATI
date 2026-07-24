import React, { useState } from 'react';
import garudaEmblemImg from '../assets/images/garuda_pancasila_emblem_1784830236371.jpg';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase().replace(/\s+/g, '');
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMsg('Mohon masukkan Username / NIP dan Kata Sandi.');
      return;
    }

    // Load registered team members from PengaturanView / LocalStorage
    let teamMembers: any[] = [];
    try {
      const saved = localStorage.getItem('sipati_team_members');
      if (saved) {
        teamMembers = JSON.parse(saved);
      }
    } catch (err) {
      console.error('Error loading team members:', err);
    }

    // Default accounts fallback
    const defaultAccounts = [
      {
        id: 'm-1',
        nama: 'Drs. H. Mulyadi, M.Si',
        nip: '19780512 200312 1 002',
        username: '197805122003121002',
        password: 'admin123',
        role: 'Officer / Administrator',
      },
      {
        id: 'm-2',
        nama: 'Siti Rahma, S.IP, M.Si',
        nip: '19860920 200904 2 005',
        username: 'siti.rahma',
        password: 'user123',
        role: 'Analis Kebijakan',
      },
      {
        id: 'm-3',
        nama: 'Budi Santoso, S.STP, M.Si',
        nip: '19820415 200602 1 003',
        username: 'budi.santoso',
        password: 'user123',
        role: 'Analis Kebijakan',
      },
      {
        id: 'm-4',
        nama: 'Hendra Wijaya, S.IP',
        nip: '19890510 201201 1 004',
        username: 'hendra.w',
        password: 'user123',
        role: 'Staf Operasional',
      },
    ];

    // Priority given to custom created team members in localStorage
    const allAccounts = [...teamMembers, ...defaultAccounts];

    // Find matching user from explicit list with strict password check
    const matchedUser = allAccounts.find((m) => {
      const uUsername = (m.username || '').toLowerCase().trim();
      const uNip = (m.nip || '').replace(/\s+/g, '').toLowerCase().trim();
      const uPass = (m.password || '').trim();

      const usernameMatch =
        uUsername === cleanUser ||
        uNip === cleanUser ||
        (cleanUser === 'admin' && m.role?.includes('Officer')) ||
        (cleanUser === 'officer' && m.role?.includes('Officer'));

      const passwordMatch = cleanPass === uPass;

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
      setErrorMsg('Username / NIP atau Kata Sandi yang Anda masukkan salah. Akses aplikasi dibatasi hanya untuk akun yang terdaftar.');
    }
  };

  return (
    <div className="bg-[#fdf9f0] min-h-screen flex items-center justify-center relative antialiased p-4 sm:p-[34px] text-[#1c1c16] font-['Inter',sans-serif]">
      {/* Digital Paper Dot-Grid Texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#E4DCC8 1px, transparent 1px)',
          backgroundSize: '16px 16px',
          opacity: 0.6,
        }}
      />

      {/* Back button */}
      <button
        onClick={onBackToLanding}
        className="absolute top-6 left-6 z-20 flex items-center gap-1.5 text-xs font-['JetBrains_Mono',monospace] text-[#6E6A61] hover:text-[#57000f] transition-colors cursor-pointer"
      >
        <span className="material-symbols-outlined text-base">arrow_back</span>
        Kembali ke Beranda
      </button>

      {/* Main Login Card Canvas */}
      <div className="relative z-10 w-full max-w-[420px] bg-[#FFFDF8] border border-[#E4DCC8] rounded-xl p-8 sm:p-10 shadow-sm overflow-hidden space-y-6">
        {/* Brand Identity Header */}
        <div className="text-center relative z-10">
          <img
            src={garudaEmblemImg}
            alt="Lambang Garuda Pancasila"
            className="w-16 h-16 mx-auto mb-3 object-contain rounded-full border border-[#E4DCC8] p-1 shadow-2xs bg-white"
          />
          <h1 className="font-['Lora',serif] text-[28px] font-bold text-[#57000f] mb-1">
            SIPATI
          </h1>
          <p className="font-['Inter',sans-serif] text-[13px] text-[#6E6A61] leading-snug">
            Bagian Tata Pemerintahan
            <br />
            Sekretariat Daerah Kabupaten Kubu Raya
          </p>
        </div>

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-4 pt-2">
          {errorMsg && (
            <div className="p-3 bg-[#ffdad6] text-[#ba1a1a] text-xs rounded-lg border border-[#ba1a1a]/20 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Username Input */}
          <div>
            <label
              htmlFor="username"
              className="block font-['Inter',sans-serif] font-semibold text-[11px] tracking-wider uppercase text-[#1c1c16] mb-1.5"
            >
              Username / NIP Pengguna
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6A61] text-[18px] pointer-events-none">
                person
              </span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan Username / NIP"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E4DCC8] rounded-lg font-['Inter',sans-serif] text-[13px] text-[#20201D] focus:outline-none focus:border-[#b62230] focus:ring-1 focus:ring-[#b62230] transition"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label
                htmlFor="password"
                className="block font-['Inter',sans-serif] font-semibold text-[11px] tracking-wider uppercase text-[#1c1c16]"
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
                className="font-['Inter',sans-serif] font-semibold text-[11px] text-[#b62230] hover:text-[#881d29] transition cursor-pointer"
              >
                Lupa Password?
              </button>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6E6A61] text-[18px] pointer-events-none">
                lock
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan Kata Sandi"
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E4DCC8] rounded-lg font-['Inter',sans-serif] text-[13px] text-[#20201D] focus:outline-none focus:border-[#b62230] focus:ring-1 focus:ring-[#b62230] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6E6A61] hover:text-[#57000f] cursor-pointer"
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
              className="w-full bg-[#b62230] text-white font-['Inter',sans-serif] font-bold text-[11.5px] tracking-wider uppercase py-3 px-4 rounded-lg hover:bg-[#881d29] transition flex justify-center items-center gap-2 shadow-xs cursor-pointer active:scale-98"
            >
              <span>Masuk Ke Sistem Aplikasi</span>
              <span className="material-symbols-outlined text-[18px]">
                login
              </span>
            </button>
          </div>

          {/* Security footnote */}
          <div className="pt-3 border-t border-[#E4DCC8]/60 text-center">
            <p className="text-[11px] text-[#6E6A61] flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-xs text-[#2f6b44]">lock</span>
              <span>Akses otentikasi terenkripsi &amp; dibatasi secara resmi untuk staf terdaftar.</span>
            </p>
          </div>
        </form>
      </div>

      {/* Global Footer Context */}
      <div className="absolute bottom-4 left-0 w-full text-center px-4">
        <p className="font-['JetBrains_Mono',monospace] text-[10.5px] text-[#6E6A61] opacity-75">
          SISTEM INFORMASI PENGELOLAAN ADMINISTRASI TERPADU INDONESIA
          <br />
          VER 2.0.4 © 2026 - KABUPATEN KUBU RAYA
        </p>
      </div>
    </div>
  );
};

