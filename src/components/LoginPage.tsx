import React, { useState, useEffect } from 'react';
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
  const [showAccountsInfo, setShowAccountsInfo] = useState(true);

  // Available default accounts
  const defaultOfficer = {
    nama: 'Drs. H. Mulyadi, M.Si',
    nip: '19780512 200312 1 002',
    username: '197805122003121002',
    password: 'admin123',
    role: 'Officer / Administrator',
  };

  const fillOfficerCredentials = () => {
    setUsername('197805122003121002');
    setPassword('admin123');
    setErrorMsg('');
  };

  const fillStaffCredentials = () => {
    setUsername('siti.rahma');
    setPassword('user123');
    setErrorMsg('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      fillOfficerCredentials();
    }
    setErrorMsg('');
    onLoginSuccess();
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
      <div className="relative z-10 w-full max-w-[440px] bg-[#FFFDF8] border border-[#E4DCC8] rounded-lg p-6 sm:p-8 shadow-sm overflow-hidden space-y-6">
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
          <p className="font-['Inter',sans-serif] text-[13px] text-[#6E6A61]">
            Bagian Tata Pemerintahan Sekretariat Daerah Kabupaten Kubu Raya
          </p>
        </div>

        {/* PETUNJUK KREDENSIAL AKUN OFFICER */}
        <div className="bg-[#fdfaf2] border border-[#E4DCC8] rounded-lg p-3.5 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-[#57000f] flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <span className="material-symbols-outlined text-sm">key</span>
              Petunjuk Akun Login Officer / Staf
            </span>
            <button
              type="button"
              onClick={() => setShowAccountsInfo(!showAccountsInfo)}
              className="text-[#b62230] font-semibold text-[11px] underline cursor-pointer"
            >
              {showAccountsInfo ? 'Sembunyikan' : 'Lihat Akun'}
            </button>
          </div>

          {showAccountsInfo && (
            <div className="space-y-2 pt-1 border-t border-[#E4DCC8]/60 text-[#20201D]">
              <div className="p-2 bg-white border border-[#E4DCC8] rounded text-[11px] space-y-1">
                <div className="font-bold text-[#57000f]">Akun Officer / Kabag Tata Pemerintahan:</div>
                <div className="font-mono text-[#6E6A61]">Username / NIP: <strong className="text-[#1c1c16]">197805122003121002</strong></div>
                <div className="font-mono text-[#6E6A61]">Password: <strong className="text-[#1c1c16]">admin123</strong></div>
                <button
                  type="button"
                  onClick={fillOfficerCredentials}
                  className="mt-1 w-full py-1 px-2 bg-[#b62230] text-white rounded font-bold text-[10.5px] uppercase tracking-wider hover:bg-[#881d29] transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">touch_app</span>
                  <span>Gunakan Akun Officer Ini (Isi Otomatis)</span>
                </button>
              </div>

              <div className="p-2 bg-white border border-[#E4DCC8] rounded text-[11px] space-y-1">
                <div className="font-bold text-[#20201D]">Akun Staf Analis Kebijakan:</div>
                <div className="font-mono text-[#6E6A61]">Username: <strong className="text-[#1c1c16]">siti.rahma</strong> | Password: <strong className="text-[#1c1c16]">user123</strong></div>
                <button
                  type="button"
                  onClick={fillStaffCredentials}
                  className="mt-1 text-[#b62230] hover:underline font-bold text-[10.5px] cursor-pointer"
                >
                  Isi Akun Staf Siti Rahma
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-[#ffdad6] text-[#ba1a1a] text-xs rounded border border-[#ba1a1a]/20">
              {errorMsg}
            </div>
          )}

          {/* Username Input */}
          <div>
            <label
              htmlFor="username"
              className="block font-['Inter',sans-serif] font-semibold text-[11px] tracking-wider uppercase text-[#1c1c16] mb-1"
            >
              Username / NIP Pengguna
            </label>
            <div className="relative">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6A61] text-[18px] pointer-events-none"
              >
                person
              </span>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="197805122003121002 atau siti.rahma"
                className="w-full pl-9 pr-4 py-2 bg-[#ffffff] border border-[#E4DCC8] rounded font-mono text-[13px] text-[#20201D] focus:outline-none focus:border-[#b62230]"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="password"
                className="block font-['Inter',sans-serif] font-semibold text-[11px] tracking-wider uppercase text-[#1c1c16]"
              >
                Kata Sandi (Password)
              </label>
              <button
                type="button"
                onClick={() => alert('Password default officer adalah "admin123". Anda dapat mengubahnya di menu Pengaturan.')}
                className="font-['Inter',sans-serif] font-semibold text-[11px] text-[#b62230] hover:text-[#881d29] transition-colors cursor-pointer"
              >
                Lupa Password?
              </button>
            </div>
            <div className="relative">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6A61] text-[18px] pointer-events-none"
              >
                lock
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2 bg-[#ffffff] border border-[#E4DCC8] rounded font-mono text-[13px] text-[#20201D] focus:outline-none focus:border-[#b62230]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E6A61] hover:text-[#574141] cursor-pointer"
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
              className="w-full bg-[#b62230] text-white font-['Inter',sans-serif] font-bold text-[11.5px] tracking-wider uppercase py-3 px-4 rounded hover:bg-[#881d29] transition-colors flex justify-center items-center gap-2 shadow-sm cursor-pointer active:scale-95"
            >
              <span>Masuk Ke Sistem Aplikasi</span>
              <span className="material-symbols-outlined text-[18px]">
                login
              </span>
            </button>
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

