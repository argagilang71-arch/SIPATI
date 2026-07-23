import React, { useState } from 'react';
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
import { TaskItem, ArchiveItem } from '../types';

interface RingkasanDashboardProps {
  tasks?: TaskItem[];
  archives?: ArchiveItem[];
  onOpenSendEmailModal: () => void;
  onDownloadPdf: () => void;
  onViewAllVerifiedList: () => void;
}

export const RingkasanDashboard: React.FC<RingkasanDashboardProps> = ({
  tasks = [],
  archives = [],
  onOpenSendEmailModal,
  onDownloadPdf,
  onViewAllVerifiedList,
}) => {
  const [trendPeriod, setTrendPeriod] = useState<'4bulan' | 'agustus' | 'semua'>('4bulan');

  // Compute live statistics from tasks
  const totalTasks = tasks.length || 10;
  const selesaiTasks = tasks.filter((t) => t.status === 'SELESAI').length;
  const prosesTasks = tasks.filter((t) => t.status === 'PROSES').length;
  const belumTasks = tasks.filter((t) => t.status === 'BELUM').length;

  const totalDraftCount = tasks.reduce(
    (acc, t) => acc + (t.draftPekerjaan ? t.draftPekerjaan.length : 0),
    0
  );
  const totalBuktiCount = tasks.reduce(
    (acc, t) => acc + (t.buktiDokumen ? t.buktiDokumen.length : 0),
    0
  );

  const percentSelesai = totalTasks > 0 ? Math.round((selesaiTasks / totalTasks) * 100) : 0;

  // Data for Status Donut Chart
  const statusPieData = [
    { name: 'Selesai (Disahkan)', value: selesaiTasks || 1, color: '#2F6B44' },
    { name: 'Dalam Proses', value: prosesTasks || 4, color: '#d97706' },
    { name: 'Belum Dimulai', value: belumTasks || 5, color: '#b62230' },
  ];

  // Monthly trend data
  const trendData = [
    { bulan: 'Mei', target: 4, draft: 2, selesai: 1 },
    { bulan: 'Juni', target: 7, draft: 5, selesai: 3 },
    { bulan: 'Juli', target: 9, draft: 8, selesai: 5 },
    { bulan: 'Agustus', target: totalTasks, draft: totalDraftCount || 10, selesai: selesaiTasks || 2 },
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
        { bidang: 'Legalisasi', Selesai: 1, Proses: 0, Total: 2 },
        { bidang: 'Tata Kelola Rapat', Selesai: 0, Proses: 2, Total: 3 },
        { bidang: 'Korespondensi', Selesai: 1, Proses: 2, Total: 5 },
        { bidang: 'Logistik', Selesai: 0, Proses: 1, Total: 2 },
      ];

  const avatarList = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuClPf_SYvijtKCMAma7NuPbBr_8fmCn8dFCgIddjToVidEJxvyTdsC7TtT5eS8j21zE_gMPYJ44fVGZTWvKky6kHUzutZzGK0X9tmmksgrsCExDw4YM_Qw49WNJGIZVTUtK6Guv8xF7U1KWbZJ6aScWkZhLJyWcAIC4cBpglWq4kOx4zoZWsFHif6oX410C3MAruGfC0s0XjSFk1TlQ-csMmJPOt-v1A3HFbzWSe9KkBTJ8iK-YmzrV5If1s_FbmZ6NLitAt3YxYj8',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAg6dT6a46e2ono4Y-8JgcARquGClhQX3gVIo3vReZ6uGWf_vW28q-qM5M2LSVKptXyz6tYDwHq3JHRU2Vjy4upsGkvWyAtX5a4YGmeGnLAnLQWodm8Yi1usCk660l9nchuf0aWO1WEHWeL8ulNH6d0Mj7FGnufVqgto7rMxav-wUguTXjVEn3ScODku1nCwOrgrzzO-dXuJ9fjCAcy6PJU1WnkvN-bIqBRG1nEBNYqkYN5kHsVIOt-ib3n1TN5lLL6SYBxzDHLqFE',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA3Ih-tvmajxtUcLH8Npr_GlpCfA1LCev9VIxNDfYTVpJHvH4X_J_sGGS32heLBBemLi5lmCD-DgLAQJ2e2i05Cm_4VDmEexXRtS1vzu33SELXjAMiMFJ_T4YmNH3jrStOWZSDaF6c90w0zLZeBsnH1dVHjNqxyzBTlnjbT_vdSDZadzbASyOdvxLQ7agzd4dCXzKP8CzoJxxsJJzHPw5OhwQ9DQUGfebWNU1ENIgM1u_qXvSXSD3fqfJ0Tx6gp_JbcFqc2QTnQjYQ',
  ];

  return (
    <div className="space-y-6 pb-12 font-['Inter',sans-serif]">
      {/* TOP SECTION: Grid 12 cols (Left 7: Header + Stats, Right 5: Donut Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT COLUMN: Header Banner + 4 Stats Cards */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          {/* Top Header & Actions */}
          <div className="bg-[#FFFDF8] p-6 rounded-2xl border border-[#E4DCC8] shadow-2xs flex flex-col justify-between h-full">
            <div>
              <span className="font-mono text-[11px] font-bold tracking-[0.14em] text-[#57000f] uppercase mb-1.5 inline-block px-2.5 py-0.5 bg-[#57000f]/10 rounded">
                📊 Laporan Executive &amp; Dashboard Grafik
              </span>
              <h2 className="font-['Lora',serif] text-[24px] sm:text-[28px] font-bold text-[#57000f]">
                Ringkasan &amp; Analisis Kinerja
              </h2>
              <p className="text-[#6E6A61] text-[13px] mt-1 leading-relaxed">
                Visualisasi real-time progres tata naskah dinas, status verifikasi, dan distribusi pekerjaan Panitia HUT RI Ke-81.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5 mt-4 pt-3 border-t border-[#E4DCC8]/60">
              <button
                onClick={onOpenSendEmailModal}
                className="flex-1 sm:flex-none flex items-center justify-center bg-[#FFFDF8] border border-[#E4DCC8] text-[#20201D] px-3.5 py-2 rounded-xl hover:bg-[#dddad1] transition font-semibold text-[11px] uppercase tracking-wider shadow-2xs cursor-pointer active:scale-95"
              >
                <span className="material-symbols-outlined mr-1.5 text-[16px]">send</span>
                Kirim Email Pimpinan
              </button>
              <button
                onClick={onDownloadPdf}
                className="flex-1 sm:flex-none flex items-center justify-center bg-[#57000f] text-white px-3.5 py-2 rounded-xl hover:bg-[#7a1220] transition font-semibold text-[11px] uppercase tracking-wider shadow-2xs cursor-pointer active:scale-95"
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
            <div className="bg-[#FFFDF8] border border-[#E4DCC8] rounded-xl p-4 shadow-2xs">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10px] font-bold tracking-[0.1em] text-[#6E6A61] uppercase">
                  Total Pekerjaan
                </span>
                <span className="material-symbols-outlined text-[#57000f] text-xl">
                  assignment
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-['Lora',serif] text-2xl font-bold text-[#57000f]">
                  {totalTasks}
                </span>
                <span className="text-[10px] font-semibold text-[#2F6B44]">
                  +100%
                </span>
              </div>
              <p className="text-[10px] text-[#8e8d8a] mt-1">
                {Object.keys(bidangMap).length || 3} Bidang Kerja
              </p>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-[#FFFDF8] border border-[#E4DCC8] rounded-xl p-4 shadow-2xs">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10px] font-bold tracking-[0.1em] text-[#6E6A61] uppercase">
                  Capaian Selesai
                </span>
                <span className="material-symbols-outlined text-emerald-700 text-xl">
                  verified
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-['Lora',serif] text-2xl font-bold text-[#20201D]">
                  {percentSelesai}%
                </span>
                <span className="text-[10px] text-[#2F6B44] font-bold">
                  ({selesaiTasks} Selesai)
                </span>
              </div>
              <div className="w-full bg-[#e6e2d9] h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-[#2F6B44] h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.max(percentSelesai, 5)}%` }}
                />
              </div>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-[#FFFDF8] border border-[#E4DCC8] rounded-xl p-4 shadow-2xs">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10px] font-bold tracking-[0.1em] text-[#6E6A61] uppercase">
                  Draft &amp; Berkas
                </span>
                <span className="material-symbols-outlined text-amber-700 text-xl">
                  folder_open
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-['Lora',serif] text-2xl font-bold text-[#20201D]">
                  {totalDraftCount + totalBuktiCount}
                </span>
                <span className="text-[10px] text-[#574141] font-semibold">Dokumen</span>
              </div>
              <p className="text-[10px] text-[#8e8d8a] mt-1 truncate">
                {totalDraftCount} Draft • {totalBuktiCount} Bukti
              </p>
            </div>

            {/* Stat Card 4 */}
            <div className="bg-[#FFFDF8] border border-[#E4DCC8] rounded-xl p-4 shadow-2xs">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[10px] font-bold tracking-[0.1em] text-[#6E6A61] uppercase">
                  Tim Personel
                </span>
                <span className="material-symbols-outlined text-blue-800 text-xl">
                  groups
                </span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-['Lora',serif] text-2xl font-bold text-[#20201D]">
                  342
                </span>
                <span className="text-[10px] text-[#6E6A61] font-medium">Orang</span>
              </div>
              <div className="flex -space-x-1.5 mt-1.5">
                {avatarList.map((url, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-full border border-[#FFFDF8] bg-[#E4DCC8] overflow-hidden"
                  >
                    <img src={url} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-5 h-5 rounded-full border border-[#FFFDF8] bg-[#e6e2d9] flex items-center justify-center text-[8px] font-bold text-[#6E6A61]">
                  +15
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Pie / Donut Chart Status Pekerjaan (Placed in Top Right!) */}
        <div className="lg:col-span-5 bg-[#FFFDF8] border border-[#E4DCC8] rounded-2xl p-5 shadow-2xs flex flex-col justify-between h-full">
          <div className="border-b border-[#E4DCC8] pb-3">
            <span className="font-mono text-[10px] font-bold text-[#57000f] uppercase tracking-wider block">
              DIAGRAM LINGKARAN STATUS (REAL-TIME)
            </span>
            <h3 className="font-['Lora',serif] text-base md:text-lg font-bold text-[#57000f]">
              Distribusi Status Pekerjaan &amp; Surat
            </h3>
          </div>

          <div className="h-52 w-full relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFDF8',
                    borderColor: '#E4DCC8',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
              </PieChart>
            </ResponsiveContainer>

            {/* Total indicator in center of donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
              <span className="font-['Lora',serif] text-2xl font-bold text-[#1c1c16]">
                {totalTasks}
              </span>
              <span className="text-[9px] font-mono uppercase text-[#8e8d8a]">
                Total Pekerjaan
              </span>
            </div>
          </div>

          {/* Breakdown cards under donut */}
          <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-[#E4DCC8]/60 text-center text-xs font-['Inter',sans-serif]">
            <div className="p-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
              <span className="block text-[9px] font-bold text-emerald-800 uppercase">
                SELESAI
              </span>
              <span className="text-sm font-bold text-emerald-900">
                {selesaiTasks}
              </span>
            </div>
            <div className="p-1.5 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="block text-[9px] font-bold text-amber-800 uppercase">
                PROSES
              </span>
              <span className="text-sm font-bold text-amber-900">
                {prosesTasks}
              </span>
            </div>
            <div className="p-1.5 bg-rose-50 border border-rose-200 rounded-lg">
              <span className="block text-[9px] font-bold text-rose-800 uppercase">
                BELUM
              </span>
              <span className="text-sm font-bold text-rose-900">
                {belumTasks}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: Grid 2 Column (Area Chart & Bar Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Lower: Area Chart (Grafik Tren Pembuatan & Pengesahan Dokumen) */}
        <div className="bg-[#FFFDF8] border border-[#E4DCC8] rounded-xl p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#E4DCC8] pb-4 mb-4">
            <div>
              <span className="font-mono text-[10px] font-bold text-[#57000f] uppercase tracking-wider block">
                DIAGRAM PROGRES BULANAN
              </span>
              <h3 className="font-['Lora',serif] text-base md:text-lg font-bold text-[#57000f]">
                Grafik Tren Pembuatan Dokumen
              </h3>
            </div>

            {/* Timeframe Selector */}
            <div className="flex items-center gap-1 bg-[#f7f3ea] p-1 rounded-lg border border-[#E4DCC8] text-xs">
              <button
                onClick={() => setTrendPeriod('4bulan')}
                className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer text-[11px] ${
                  trendPeriod === '4bulan'
                    ? 'bg-[#57000f] text-white shadow-2xs'
                    : 'text-[#6E6A61] hover:text-[#1c1c16]'
                }`}
              >
                4 Bulan
              </button>
              <button
                onClick={() => setTrendPeriod('agustus')}
                className={`px-2.5 py-1 rounded-md font-semibold transition cursor-pointer text-[11px] ${
                  trendPeriod === 'agustus'
                    ? 'bg-[#57000f] text-white shadow-2xs'
                    : 'text-[#6E6A61] hover:text-[#1c1c16]'
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
                    <stop offset="5%" stopColor="#b62230" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#b62230" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDraft" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSelesai" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2F6B44" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#2F6B44" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E4DCC8" vertical={false} />
                <XAxis dataKey="bulan" stroke="#6E6A61" tick={{ fontSize: 11, fill: '#6E6A61' }} />
                <YAxis stroke="#6E6A61" tick={{ fontSize: 11, fill: '#6E6A61' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFDF8',
                    borderColor: '#E4DCC8',
                    borderRadius: '8px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} />
                <Area
                  type="monotone"
                  dataKey="target"
                  name="Target Pekerjaan"
                  stroke="#b62230"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTarget)"
                />
                <Area
                  type="monotone"
                  dataKey="draft"
                  name="Draft Masuk"
                  stroke="#d97706"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorDraft)"
                />
                <Area
                  type="monotone"
                  dataKey="selesai"
                  name="Dokumen Disahkan"
                  stroke="#2F6B44"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorSelesai)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Lower: Bar Chart Capaian & Volume Per Bidang */}
        <div className="bg-[#FFFDF8] border border-[#E4DCC8] rounded-xl p-6 shadow-2xs flex flex-col justify-between">
          <div className="border-b border-[#E4DCC8] pb-4 mb-4">
            <span className="font-mono text-[10px] font-bold text-[#57000f] uppercase tracking-wider block">
              DIAGRAM BATANG PER BIDANG
            </span>
            <h3 className="font-['Lora',serif] text-base md:text-lg font-bold text-[#57000f]">
              Capaian &amp; Volume Pekerjaan per Bidang
            </h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bidangBarData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E4DCC8" vertical={false} />
                <XAxis dataKey="bidang" stroke="#6E6A61" tick={{ fontSize: 11, fill: '#6E6A61' }} />
                <YAxis stroke="#6E6A61" tick={{ fontSize: 11, fill: '#6E6A61' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFDF8',
                    borderColor: '#E4DCC8',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Selesai" fill="#2F6B44" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Proses" fill="#d97706" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Total" fill="#57000f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Preview Laporan Terverifikasi (Table Section) */}
      <div className="bg-[#FFFDF8] border border-[#E4DCC8] rounded-xl shadow-2xs overflow-hidden mt-2">
        <div className="p-5 border-b border-[#E4DCC8] bg-[#fdf9f0] flex justify-between items-center flex-wrap gap-2">
          <div>
            <h3 className="font-['Lora',serif] text-[16px] font-bold text-[#57000f]">
              Preview: Laporan Naskah &amp; Berkas Terverifikasi
            </h3>
            <p className="text-xs text-[#574141] mt-0.5">
              Lampiran Bab III - Daftar Dokumen Resmi Panitia HUT RI Ke-81
            </p>
          </div>
          <span className="bg-[#e6e2d9] text-[#20201D] px-3 py-1 rounded-full font-mono text-[10px] font-semibold tracking-wider uppercase">
            BAB III - LAMPIRAN FINAL
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E4DCC8] bg-[#f7f3ea] font-mono text-[11px] text-[#6E6A61] uppercase">
                <th className="py-3 px-6 w-16">NO.</th>
                <th className="py-3 px-6">NOMOR SURAT / REFERENSI</th>
                <th className="py-3 px-6">PERIHAL / NAMA PEKERJAAN</th>
                <th className="py-3 px-6">BIDANG</th>
                <th className="py-3 px-6 text-right">STATUS FINAL</th>
              </tr>
            </thead>
            <tbody className="text-[13.5px] text-[#20201D]">
              {tasks.slice(0, 5).map((t, idx) => (
                <tr
                  key={t.id}
                  className="border-b border-[#E4DCC8] hover:bg-[#fcf8ee] transition-colors"
                >
                  <td className="py-3.5 px-6 text-[#6E6A61] font-mono text-xs">
                    {String(idx + 1).padStart(2, '0')}
                  </td>
                  <td className="py-3.5 px-6 font-mono text-xs text-[#57000f] font-semibold">
                    {t.noSurat || `00${idx + 1}/SK/PAN-RI/VIII/2026`}
                  </td>
                  <td className="py-3.5 px-6 font-medium text-[#1c1c16]">
                    {t.title}
                  </td>
                  <td className="py-3.5 px-6 text-xs text-[#574141]">
                    {t.bidang}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        t.status === 'SELESAI'
                          ? 'bg-[#e6e2d9] text-[#2F6B44] border-[#2F6B44]/20'
                          : t.status === 'PROSES'
                          ? 'bg-amber-100/60 text-amber-800 border-amber-300'
                          : 'bg-rose-100/60 text-rose-800 border-rose-300'
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

        <div className="p-4 border-t border-[#E4DCC8] bg-[#fdf9f0] flex justify-center">
          <button
            onClick={onViewAllVerifiedList}
            className="text-[#57000f] font-semibold text-[12px] tracking-wider uppercase hover:underline flex items-center cursor-pointer"
          >
            Lihat Seluruh Arsip Digital ({archives.length || 128}){' '}
            <span className="material-symbols-outlined ml-1 text-[18px]">
              expand_more
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
