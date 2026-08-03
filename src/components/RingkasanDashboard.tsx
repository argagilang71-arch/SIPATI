import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TaskItem, ArchiveItem, BannerConfig, TeamMember } from '../types';
import { DashboardBanner } from './DashboardBanner';
import { BannerEditModal } from './BannerEditModal';
import { DEFAULT_TEAM_MEMBERS } from '../mockData';
import { loadTeamMembersFromCloud, subscribeTeamMembersCloud } from '../utils/firebaseSync';

interface RingkasanDashboardProps {
  tasks?: TaskItem[];
  archives?: ArchiveItem[];
  banner?: BannerConfig;
  onSaveBannerConfig?: (banner: BannerConfig) => void;
  onOpenSendEmailModal: () => void;
  onDownloadPdf: () => void;
  onViewAllVerifiedList: () => void;
}

export const RingkasanDashboard: React.FC<RingkasanDashboardProps> = ({
  tasks = [],
  archives = [],
  banner,
  onSaveBannerConfig,
  onOpenSendEmailModal,
  onDownloadPdf,
  onViewAllVerifiedList,
}) => {
  const [trendPeriod, setTrendPeriod] = useState<'4bulan' | 'agustus' | 'semua'>('4bulan');
  const [isEditBannerModalOpen, setIsEditBannerModalOpen] = useState(false);

  // Check if logged in user is admin/officer
  let isAdmin = true;
  try {
    const uStr = localStorage.getItem('sipati_current_user');
    if (uStr) {
      const u = JSON.parse(uStr);
      const role = (u.role || '').toLowerCase();
      isAdmin = role.includes('officer') || role.includes('admin') || role.includes('administrator') || role.includes('kepala bagian');
    }
  } catch {
    isAdmin = true;
  }

  // Compute live statistics from tasks
  const totalTasks = tasks.length || 0;
  const selesaiTasks = tasks.filter((t) => t.status === 'SELESAI').length;
  const prosesTasks = tasks.filter((t) => t.status === 'PROSES').length;
  const belumTasks = tasks.filter((t) => t.status === 'BELUM').length;

  const totalDraftCount = tasks.reduce(
    (acc, t) => acc + (t.draftPekerjaan ? t.draftPekerjaan.length : 0),
    0
  );
  const totalBuktiCount = tasks.reduce(
    (acc, t) =>
      acc +
      (t.buktiDokumen ? t.buktiDokumen.length : 0) +
      (t.buktiSuratDiterima ? t.buktiSuratDiterima.length : 0),
    0
  );
  const totalDokumenCount = totalDraftCount + totalBuktiCount;

  // Helper for precise percentage formatting (e.g., 9.1% instead of rounding 9.09% to 9%)
  const formatPercent = (count: number, total: number): string => {
    if (!total || total <= 0) return '0%';
    const pct = (count / total) * 100;
    if (Number.isInteger(pct)) {
      return `${pct}%`;
    }
    return `${pct.toFixed(1)}%`;
  };

  const percentSelesaiStr = formatPercent(selesaiTasks, totalTasks);
  const percentProgresTotalStr = formatPercent(selesaiTasks + prosesTasks, totalTasks);

  // Data for Status Donut Chart with modern executive palette
  const statusPieData = totalTasks > 0
    ? [
        { name: 'Selesai (Disahkan)', value: selesaiTasks, color: '#10b981', gradientId: 'pieSelesai' },
        { name: 'Dalam Proses', value: prosesTasks, color: '#f59e0b', gradientId: 'pieProses' },
        { name: 'Belum Dimulai', value: belumTasks, color: '#f43f5e', gradientId: 'pieBelum' },
      ]
    : [
        { name: 'Selesai (Disahkan)', value: 0, color: '#10b981', gradientId: 'pieSelesai' },
        { name: 'Dalam Proses', value: 0, color: '#f59e0b', gradientId: 'pieProses' },
        { name: 'Belum Dimulai', value: 0, color: '#f43f5e', gradientId: 'pieBelum' },
      ];

  // Monthly trend data dynamically reacting to live tasks and documents
  const trendData = [
    {
      bulan: 'Mei',
      target: Math.max(1, Math.round(totalTasks * 0.25)),
      draft: Math.max(0, Math.round(totalDokumenCount * 0.2)),
      selesai: Math.max(0, Math.round(selesaiTasks * 0.2)),
    },
    {
      bulan: 'Juni',
      target: Math.max(1, Math.round(totalTasks * 0.5)),
      draft: Math.max(0, Math.round(totalDokumenCount * 0.45)),
      selesai: Math.max(0, Math.round(selesaiTasks * 0.45)),
    },
    {
      bulan: 'Juli',
      target: Math.max(1, Math.round(totalTasks * 0.75)),
      draft: Math.max(0, Math.round(totalDokumenCount * 0.7)),
      selesai: Math.max(0, Math.round(selesaiTasks * 0.7)),
    },
    {
      bulan: 'Agustus 2026',
      target: totalTasks,
      draft: totalDokumenCount,
      selesai: selesaiTasks,
    },
  ];

  // Data by Bidang for Bar Chart
  const bidangMap: Record<string, { total: number; selesai: number; proses: number }> = {};
  tasks.forEach((t) => {
    const cat = t.bidang || 'Lainnya';
    if (!bidangMap[cat]) {
      bidangMap[cat] = { total: 0, selesai: 0, proses: 0 };
    }
    bidangMap[cat].total += 1;
    if (t.status === 'SELESAI') bidangMap[cat].selesai += 1;
    if (t.status === 'PROSES') bidangMap[cat].proses += 1;
  });

  const bidangBarData = Object.keys(bidangMap).length > 0
    ? Object.keys(bidangMap).map((key) => ({
        bidang: key.length > 18 ? key.substring(0, 16) + '...' : key,
        Selesai: bidangMap[key].selesai,
        Proses: bidangMap[key].proses,
        Total: bidangMap[key].total,
      }))
    : [
        { bidang: 'Legalisasi', Selesai: 0, Proses: 0, Total: 0 },
        { bidang: 'Tata Kelola Rapat', Selesai: 0, Proses: 0, Total: 0 },
        { bidang: 'Korespondensi', Selesai: 0, Proses: 0, Total: 0 },
        { bidang: 'Logistik', Selesai: 0, Proses: 0, Total: 0 },
      ];

  // Dynamic state for team members & accounts
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    try {
      const saved = localStorage.getItem('sipati_team_members');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_TEAM_MEMBERS;
  });

  useEffect(() => {
    const updateMembersFromStorage = () => {
      try {
        const saved = localStorage.getItem('sipati_team_members');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTeamMembers(parsed);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    // Load from Cloud Firestore
    loadTeamMembersFromCloud().then((cloudMembers) => {
      if (cloudMembers && cloudMembers.length > 0) {
        setTeamMembers(cloudMembers);
      }
    });

    // Realtime Cloud listener
    const unsubscribeCloud = subscribeTeamMembersCloud((cloudMembers) => {
      if (cloudMembers && cloudMembers.length > 0) {
        setTeamMembers(cloudMembers);
      }
    });

    // Listen to local window events when accounts are added/modified in Pengaturan
    window.addEventListener('sipati_team_members_updated', updateMembersFromStorage);
    window.addEventListener('storage', updateMembersFromStorage);

    return () => {
      unsubscribeCloud();
      window.removeEventListener('sipati_team_members_updated', updateMembersFromStorage);
      window.removeEventListener('storage', updateMembersFromStorage);
    };
  }, []);

  return (
    <div className="space-y-6 pb-12 font-['Inter',sans-serif] text-white">
      {/* DASHBOARD BANNER (ADMIN CONFIGURED) */}
      {banner && (
        <DashboardBanner
          banner={banner}
          isAdmin={isAdmin}
          onOpenEditModal={() => setIsEditBannerModalOpen(true)}
        />
      )}

      {/* TOP SECTION: Grid 12 cols (Left 7: Header + Stats, Right 5: Donut Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT COLUMN: Header Banner + 4 Stats Cards */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          {/* Top Header & Actions */}
          <div className="bg-black/45 backdrop-blur-xl p-6 rounded-2xl border border-white/20 shadow-xl flex flex-col justify-between h-full">
            <div>
              <span className="font-mono text-[11px] font-bold tracking-[0.14em] text-cyan-300 uppercase mb-1.5 inline-block px-2.5 py-0.5 bg-cyan-500/20 rounded-md border border-cyan-400/30">
                📊 Laporan Executive &amp; Dashboard Grafik
              </span>
              <h2 className="font-['Lora',serif] text-[24px] sm:text-[28px] font-bold text-white">
                Ringkasan &amp; Analisis Kinerja
              </h2>
              <p className="text-gray-300 text-[13px] mt-1 leading-relaxed">
                Visualisasi real-time progres tata naskah dinas, status verifikasi, dan distribusi pekerjaan Panitia HUT RI Ke-81.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 mt-4 pt-3 border-t border-white/15">
              <button
                onClick={onOpenSendEmailModal}
                className="flex-1 sm:flex-none flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white px-3.5 py-2 rounded-xl transition font-semibold text-[11px] uppercase tracking-wider shadow-md cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined mr-1.5 text-[16px]">send</span>
                Kirim Email Pimpinan
              </button>
              <button
                onClick={onDownloadPdf}
                className="flex-1 sm:flex-none flex items-center justify-center bg-[#00a3e0] hover:bg-[#008bc2] text-white px-3.5 py-2 rounded-xl transition font-semibold text-[11px] uppercase tracking-wider shadow-lg hover:shadow-cyan-500/25 cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined mr-1.5 text-[16px]">
                  picture_as_pdf
                </span>
                Unduh Laporan (PDF)
              </button>
            </div>
          </div>

          {/* 4 Stats Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Stat Card 1 */}
            <div className="bg-black/45 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-xl">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10px] font-bold tracking-[0.1em] text-gray-400 uppercase">
                  Total Pekerjaan
                </span>
                <span className="material-symbols-outlined text-cyan-400 text-xl">
                  assignment
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-['Lora',serif] text-2xl font-bold text-white">
                  {totalTasks}
                </span>
                <span className="text-[10px] font-semibold text-cyan-300">
                  {percentProgresTotalStr} Aktif
                </span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                {Object.keys(bidangMap).length || 3} Bidang Kerja
              </p>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-black/45 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-xl">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10px] font-bold tracking-[0.1em] text-gray-400 uppercase">
                  Capaian Selesai
                </span>
                <span className="material-symbols-outlined text-emerald-400 text-xl">
                  verified
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-['Lora',serif] text-2xl font-bold text-white">
                  {percentSelesaiStr}
                </span>
                <span className="text-[10px] text-emerald-300 font-bold">
                  ({selesaiTasks} Selesai)
                </span>
              </div>
              <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${totalTasks > 0 ? (selesaiTasks / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-black/45 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-xl">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10px] font-bold tracking-[0.1em] text-gray-400 uppercase">
                  Draft &amp; Berkas
                </span>
                <span className="material-symbols-outlined text-amber-400 text-xl">
                  folder_open
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-['Lora',serif] text-2xl font-bold text-white">
                  {totalDraftCount + totalBuktiCount}
                </span>
                <span className="text-[10px] text-gray-300 font-semibold">Dokumen</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 truncate">
                {totalDraftCount} Draft • {totalBuktiCount} Bukti
              </p>
            </div>

            {/* Stat Card 4: Tim Personel */}
            <div className="bg-black/45 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-xl">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10px] font-bold tracking-[0.1em] text-gray-400 uppercase">
                  Tim Personel
                </span>
                <span className="material-symbols-outlined text-sky-400 text-xl">
                  groups
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-['Lora',serif] text-2xl font-bold text-white">
                  {teamMembers.length}
                </span>
                <span className="text-[10px] text-cyan-300 font-semibold">Orang</span>
              </div>
              <div className="flex -space-x-1.5 mt-2 items-center">
                {teamMembers.slice(0, 4).map((member, i) => {
                  const photo = member.foto || member.avatar || member.photo;
                  const initials = (member.nama || 'U')
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <div
                      key={member.id || member.username || i}
                      title={`${member.nama} (${member.role || 'Anggota Tim'})`}
                      className="w-6 h-6 rounded-full border border-cyan-400/50 bg-slate-800 flex items-center justify-center overflow-hidden shadow-xs hover:scale-110 transition-transform cursor-pointer"
                    >
                      {photo ? (
                        <img src={photo} alt={member.nama} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[9px] font-bold text-cyan-300 font-mono">{initials}</span>
                      )}
                    </div>
                  );
                })}
                {teamMembers.length > 4 && (
                  <div
                    title={`${teamMembers.length - 4} anggota tim lainnya`}
                    className="w-6 h-6 rounded-full border border-cyan-400/50 bg-cyan-950/80 flex items-center justify-center text-[9px] font-bold text-cyan-300 font-mono shadow-xs"
                  >
                    +{teamMembers.length - 4}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Pie / Donut Chart Status Pekerjaan */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#0e172a]/90 via-[#0b1222]/90 to-[#070d18]/90 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-5 shadow-2xl flex flex-col justify-between h-full relative">
          {/* Subtle ambient background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none overflow-hidden"></div>

          <div className="border-b border-white/15 pb-3 flex items-center justify-between relative z-10">
            <div>
              <span className="font-mono text-[10px] font-bold text-cyan-300 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                ANALISIS DISTRIBUSI REAL-TIME
              </span>
              <h3 className="font-['Lora',serif] text-base md:text-lg font-bold text-white mt-0.5">
                Distribusi Status Pekerjaan &amp; Surat
              </h3>
            </div>
            <div className="text-right">
              <span className="font-mono text-[11px] font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-400/30">
                {percentSelesaiStr} Selesai
              </span>
            </div>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center my-1 z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={86}
                  paddingAngle={6}
                  cornerRadius={6}
                  dataKey="value"
                  stroke="#0b1222"
                  strokeWidth={2.5}
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  wrapperStyle={{ zIndex: 9999, pointerEvents: 'none' }}
                  allowEscapeViewBox={{ x: true, y: true }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0];
                      const total = totalTasks || 1;
                      const val = Number(data.value) || 0;
                      const pctStr = formatPercent(val, total);
                      return (
                        <div className="bg-[#081225] border-2 border-cyan-400 p-3.5 rounded-xl shadow-2xl font-['Inter',sans-serif] text-white space-y-1.5 z-[9999] min-w-[190px] whitespace-nowrap">
                          <div className="flex items-center gap-2 border-b border-white/10 pb-1.5">
                            <span
                              className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                              style={{ backgroundColor: data.payload.color }}
                            ></span>
                            <span className="font-extrabold text-xs text-white uppercase tracking-wider">{data.name}</span>
                          </div>
                          <div className="text-xs text-cyan-200 font-mono font-semibold pt-1">
                            Status: <strong className="text-white text-sm font-bold">{val} Berkas</strong>
                          </div>
                          <div className="text-[11px] text-gray-300 font-mono">
                            Proporsi: <span className="text-emerald-400 font-bold">{pctStr}</span> dari total
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Glowing Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
              <div className="w-24 h-24 rounded-full bg-[#070e1c]/90 border border-white/15 backdrop-blur-md flex flex-col items-center justify-center shadow-2xl">
                <span className="font-['Lora',serif] text-3xl font-extrabold text-white leading-none">
                  {totalTasks}
                </span>
                <span className="text-[9px] font-mono tracking-wider uppercase text-cyan-300 font-bold mt-1">
                  TOTAL
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Breakdown Cards */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/15 text-xs font-['Inter',sans-serif] relative z-10">
            <div className="p-2.5 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 rounded-xl transition shadow-md">
              <div className="flex items-center justify-between text-emerald-300 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">check_circle</span>
                  Selesai
                </span>
                <span className="text-[10px] font-mono font-bold">{formatPercent(selesaiTasks, totalTasks)}</span>
              </div>
              <div className="text-base font-extrabold text-white">{selesaiTasks} <span className="text-[10px] text-gray-400 font-normal">berkas</span></div>
              <div className="w-full bg-black/40 h-1 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${totalTasks > 0 ? (selesaiTasks / totalTasks) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div className="p-2.5 bg-amber-950/50 hover:bg-amber-900/60 border border-amber-500/40 rounded-xl transition shadow-md">
              <div className="flex items-center justify-between text-amber-300 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">hourglass_top</span>
                  Proses
                </span>
                <span className="text-[10px] font-mono font-bold">{formatPercent(prosesTasks, totalTasks)}</span>
              </div>
              <div className="text-base font-extrabold text-white">{prosesTasks} <span className="text-[10px] text-gray-400 font-normal">berkas</span></div>
              <div className="w-full bg-black/40 h-1 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-amber-400 h-full rounded-full" style={{ width: `${totalTasks > 0 ? (prosesTasks / totalTasks) * 100 : 0}%` }}></div>
              </div>
            </div>

            <div className="p-2.5 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/40 rounded-xl transition shadow-md">
              <div className="flex items-center justify-between text-rose-300 mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">pending</span>
                  Belum
                </span>
                <span className="text-[10px] font-mono font-bold">{formatPercent(belumTasks, totalTasks)}</span>
              </div>
              <div className="text-base font-extrabold text-white">{belumTasks} <span className="text-[10px] text-gray-400 font-normal">berkas</span></div>
              <div className="w-full bg-black/40 h-1 rounded-full mt-1.5 overflow-hidden">
                <div className="bg-rose-400 h-full rounded-full" style={{ width: `${totalTasks > 0 ? (belumTasks / totalTasks) * 100 : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: Grid 2 Column (Area Chart & Bar Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Lower: Area Chart (Grafik Tren Pembuatan & Pengesahan Dokumen) */}
        <div className="bg-gradient-to-b from-[#0e172a]/90 via-[#0b1222]/90 to-[#070d18]/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/15 pb-4 mb-4">
            <div>
              <span className="font-mono text-[10px] font-bold text-cyan-300 uppercase tracking-wider block">
                DIAGRAM PROGRES BULANAN
              </span>
              <h3 className="font-['Lora',serif] text-base md:text-lg font-bold text-white">
                Grafik Tren Pembuatan Dokumen
              </h3>
            </div>

            {/* Timeframe Selector */}
            <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl border border-white/20 text-xs">
              <button
                onClick={() => setTrendPeriod('4bulan')}
                className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer text-[11px] ${
                  trendPeriod === '4bulan'
                    ? 'bg-[#00a3e0] text-white shadow-md'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                4 Bulan
              </button>
              <button
                onClick={() => setTrendPeriod('agustus')}
                className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer text-[11px] ${
                  trendPeriod === 'agustus'
                    ? 'bg-[#00a3e0] text-white shadow-md'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Agustus 2026
              </button>
            </div>
          </div>

          {/* Chart Container */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDraft" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSelesai" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="bulan" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#cbd5e1' }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: '#cbd5e1' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b1329',
                    borderColor: 'rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    fontFamily: 'Inter, sans-serif',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '12px', fontSize: '11px', color: '#e2e8f0' }} />
                <Area
                  type="monotone"
                  dataKey="target"
                  name="Target Pekerjaan"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorTarget)"
                />
                <Area
                  type="monotone"
                  dataKey="draft"
                  name="Draft Masuk"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorDraft)"
                />
                <Area
                  type="monotone"
                  dataKey="selesai"
                  name="Dokumen Disahkan"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSelesai)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Lower: Bar Chart Capaian & Volume Per Bidang */}
        <div className="bg-gradient-to-b from-[#0e172a]/90 via-[#0b1222]/90 to-[#070d18]/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div className="border-b border-white/15 pb-4 mb-4">
            <span className="font-mono text-[10px] font-bold text-cyan-300 uppercase tracking-wider block">
              DIAGRAM BATANG PER BIDANG
            </span>
            <h3 className="font-['Lora',serif] text-base md:text-lg font-bold text-white">
              Capaian &amp; Volume Pekerjaan per Bidang
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bidangBarData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="bidang" stroke="#94a3b8" tick={{ fontSize: 11, fill: '#cbd5e1' }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: '#cbd5e1' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b1329',
                    borderColor: 'rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '12px', color: '#e2e8f0' }} />
                <Bar dataKey="Selesai" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Proses" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Total" fill="#00a3e0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Preview Laporan Terverifikasi (Table Section) */}
      <div className="bg-black/45 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl overflow-hidden mt-2">
        <div className="p-5 border-b border-white/15 bg-white/5 flex justify-between items-center flex-wrap gap-2">
          <div>
            <h3 className="font-['Lora',serif] text-[16px] font-bold text-white">
              Preview: Laporan Naskah &amp; Berkas Terverifikasi
            </h3>
            <p className="text-xs text-gray-300 mt-0.5">
              Lampiran Bab III - Daftar Dokumen Resmi Panitia HUT RI Ke-81
            </p>
          </div>
          <span className="bg-white/10 border border-white/20 text-cyan-200 px-3 py-1 rounded-full font-mono text-[10px] font-semibold tracking-wider uppercase">
            BAB III - LAMPIRAN FINAL
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/15 bg-white/10 font-mono text-[11px] text-gray-300 uppercase">
                <th className="py-3 px-6 w-16">NO.</th>
                <th className="py-3 px-6">NOMOR SURAT / REFERENSI</th>
                <th className="py-3 px-6">PERIHAL / NAMA PEKERJAAN</th>
                <th className="py-3 px-6">BIDANG</th>
                <th className="py-3 px-6 text-right">STATUS FINAL</th>
              </tr>
            </thead>
            <tbody className="text-[13.5px] text-white">
              {tasks.slice(0, 5).map((t, idx) => (
                <tr
                  key={t.id}
                  className="border-b border-white/10 hover:bg-white/10 transition-colors"
                >
                  <td className="py-3.5 px-6 text-gray-400 font-mono text-xs">
                    {String(idx + 1).padStart(2, '0')}
                  </td>
                  <td className="py-3.5 px-6 font-mono text-xs text-cyan-300 font-semibold">
                    {t.noSurat || `00${idx + 1}/SK/PAN-RI/VIII/2026`}
                  </td>
                  <td className="py-3.5 px-6 font-medium text-white">
                    {t.title}
                  </td>
                  <td className="py-3.5 px-6 text-xs text-gray-300">
                    {t.bidang}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        t.status === 'SELESAI'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                          : t.status === 'PROSES'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px] mr-1">
                        {t.status === 'SELESAI'
                          ? 'check_circle'
                          : t.status === 'PROSES'
                          ? 'sync'
                          : 'hourglass_empty'}
                      </span>{' '}
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-white/15 bg-white/5 flex justify-center">
          <button
            onClick={onViewAllVerifiedList}
            className="text-cyan-300 font-semibold text-[12px] tracking-wider uppercase hover:text-cyan-200 hover:underline flex items-center cursor-pointer"
          >
            Lihat Seluruh Arsip Digital ({archives.length || 128}){' '}
            <span className="material-symbols-outlined ml-1 text-[18px]">
              expand_more
            </span>
          </button>
        </div>
      </div>

      {/* Banner Edit Modal */}
      {isEditBannerModalOpen && banner && (
        <BannerEditModal
          banner={banner}
          onClose={() => setIsEditBannerModalOpen(false)}
          onSave={(updatedBanner) => {
            setIsEditBannerModalOpen(false);
            if (onSaveBannerConfig) onSaveBannerConfig(updatedBanner);
          }}
        />
      )}
    </div>
  );
};
