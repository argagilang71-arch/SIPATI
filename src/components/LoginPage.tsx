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

  const emblemUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuAch2ncE5P9SzlZn_0-xyCdmHxodaW93EoxAKoAWPGKsbhumzMfOGxJt13-9Z62aWZqypz1GUdBqTTtEWPofFuva7zLZwycw-foVKgHmXMqmTgrz1kBY-HoacBNljmrH1baPVJbPGg1L9790xezHadLLbj6vKdThqgDme7P--JlFXqURBlp7RdnW-4gSkbzE2r011N8-C9yTlwcs_p0PxX9-Dxfg_CwEWximdjzM3ndPOHJPX7xHbg8KcFKmyVSqM6z4CEM7CqbyVc";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      // Demo fallback fill
      setUsername('admin.sipati');
      setPassword('••••••••');
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
      <div className="relative z-10 w-full max-w-[420px] bg-[#FFFDF8] border border-[#E4DCC8] rounded-lg p-8 sm:p-10 shadow-sm overflow-hidden">
        {/* Decorative Tactical Stempel (Stamp) */}
        <div className="absolute -top-10 -right-10 w-32 h-32 border-[3px] border-dashed border-[#57000f]/15 rounded-full pointer-events-none mix-blend-multiply flex items-center justify-center transform rotate-12 opacity-80">
          <span className="font-['JetBrains_Mono',monospace] text-[10.5px] font-bold text-[#57000f]/30 uppercase tracking-widest text-center leading-tight">
            Otentikasi
            <br />
            Resmi
          </span>
        </div>

        {/* Brand Identity Header */}
        <div className="text-center mb-8 relative z-10">
          <img
            src={garudaEmblemImg}
            alt="Lambang Garuda Pancasila"
            className="w-16 h-16 mx-auto mb-4 object-contain rounded-full border border-[#E4DCC8] p-1 shadow-2xs bg-white"
          />
          <h1 className="font-['Lora',serif] text-[30px] font-bold text-[#57000f] mb-1">
            SIPATI
          </h1>
          <p className="font-['Inter',sans-serif] text-[13.5px] text-[#6E6A61]">
            Bagian Tata Pemerintahan Kubu Raya
          </p>
        </div>

        {/* Authentication Form */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-[#ffdad6] text-[#ba1a1a] text-xs rounded border border-[#ba1a1a]/20">
              {errorMsg}
            </div>
          )}

          {/* Username Input */}
          <div>
            <label
              htmlFor="username"
              className="block font-['Inter',sans-serif] font-semibold text-[11.5px] tracking-wider uppercase text-[#1c1c16] mb-1.5"
            >
              Username / NIP
            </label>
            <div className="relative">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6A61] text-[20px] pointer-events-none"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                person
              </span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan ID Pengguna / NIP"
                className="w-full pl-10 pr-4 py-2.5 bg-[#ffffff] border border-[#E4DCC8] rounded font-['Inter',sans-serif] text-[13.5px] text-[#20201D] focus:outline-none focus:border-[#b62230] focus:ring-1 focus:ring-[#b62230] transition-colors"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label
                htmlFor="password"
                className="block font-['Inter',sans-serif] font-semibold text-[11.5px] tracking-wider uppercase text-[#1c1c16]"
              >
                Kata Sandi
              </label>
              <button
                type="button"
                onClick={() => alert('Fitur reset password telah dikirim ke admin sistem SIPATI.')}
                className="font-['Inter',sans-serif] font-semibold text-[11.5px] text-[#b62230] hover:text-[#881d29] transition-colors focus:outline-none focus:underline cursor-pointer"
              >
                Lupa Password?
              </button>
            </div>
            <div className="relative">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6A61] text-[20px] pointer-events-none"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                lock
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan Kata Sandi"
                className="w-full pl-10 pr-12 py-2.5 bg-[#ffffff] border border-[#E4DCC8] rounded font-['Inter',sans-serif] text-[13.5px] text-[#20201D] focus:outline-none focus:border-[#b62230] focus:ring-1 focus:ring-[#b62230] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E6A61] hover:text-[#574141] focus:outline-none transition-colors cursor-pointer"
                aria-label="Toggle password visibility"
              >
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 0" }}
                >
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Submission Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#b62230] text-white font-['Inter',sans-serif] font-semibold text-[11.5px] tracking-wider uppercase py-3 px-4 rounded hover:bg-[#881d29] transition-colors flex justify-center items-center gap-2 shadow-sm cursor-pointer active:scale-95"
            >
              <span>Masuk</span>
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: "'FILL' 0" }}
              >
                login
              </span>
            </button>
          </div>
        </form>
      </div>

      {/* Global Footer Context */}
      <div className="absolute bottom-6 left-0 w-full text-center px-4">
        <p className="font-['JetBrains_Mono',monospace] text-[11px] text-[#6E6A61] opacity-75 leading-relaxed">
          SISTEM INFORMASI PENGELOLAAN ADMINISTRASI TERPADU INDONESIA
          <br />
          VER 2.0.4 © 2026
        </p>
      </div>
    </div>
  );
};
