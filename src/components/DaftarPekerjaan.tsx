import React, { useState } from 'react';
import { TaskItem, TaskStatus } from '../types';

interface DaftarPekerjaanProps {
  tasks: TaskItem[];
  onOpenTaskDetail: (task: TaskItem) => void;
  onAddTask: () => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
  onDeleteTask?: (taskId: string) => void;
}

export const DaftarPekerjaan: React.FC<DaftarPekerjaanProps> = ({
  tasks,
  onOpenTaskDetail,
  onAddTask,
  onUpdateStatus,
  onDeleteTask,
}) => {
  const [selectedBidang, setSelectedBidang] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Base default categories
  const baseCategories = [
    { name: 'Legalisasi Operasional', icon: 'description' },
    { name: 'Tata Kelola Rapat', icon: 'groups' },
    { name: 'Manajemen Korespondensi', icon: 'mail' },
  ];

  // Dynamically include any custom bidang defined in tasks
  const customBidangList = Array.from(new Set(tasks.map((t) => t.bidang)))
    .filter((b) => b && !baseCategories.some((c) => c.name === b));

  const allCategories = [
    ...baseCategories,
    ...customBidangList.map((b) => ({ name: b, icon: 'folder' })),
  ];

  // Filter tasks based on filters
  const filteredTasks = tasks.filter((task) => {
    const matchesBidang =
      selectedBidang === 'Semua' || task.bidang === selectedBidang;
    const matchesStatus =
      selectedStatus === 'Semua' || task.status === selectedStatus;
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.pj.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.noSurat && task.noSurat.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesBidang && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-black/45 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-4 text-white">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Bidang Select */}
          <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3.5 py-2 border border-white/20">
            <span className="font-['JetBrains_Mono',monospace] text-[10px] uppercase font-bold text-gray-300">
              Bidang:
            </span>
            <select
              value={selectedBidang}
              onChange={(e) => setSelectedBidang(e.target.value)}
              className="bg-slate-900 text-white border-none focus:outline-none text-[13px] font-medium p-1 rounded-md cursor-pointer"
            >
              <option value="Semua">Semua Bidang</option>
              {allCategories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Select */}
          <div className="flex items-center gap-1.5 bg-white/10 rounded-xl px-3.5 py-2 border border-white/20">
            <span className="font-['JetBrains_Mono',monospace] text-[10px] uppercase font-bold text-gray-300">
              Status:
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-900 text-white border-none focus:outline-none text-[13px] font-medium p-1 rounded-md cursor-pointer"
            >
              <option value="Semua">Semua Status</option>
              <option value="BELUM">BELUM</option>
              <option value="PROSES">PROSES</option>
              <option value="SELESAI">SELESAI</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="flex-1 min-w-[200px] flex items-center bg-white/10 border border-white/20 rounded-xl px-3.5 py-2">
            <span className="material-symbols-outlined text-gray-300 text-sm mr-2">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama pekerjaan..."
              className="w-full bg-transparent border-none focus:outline-none text-[13px] text-white placeholder-gray-400 p-0"
            />
          </div>
        </div>

        {/* Add Task Button */}
        <button
          onClick={onAddTask}
          className="bg-[#00a3e0] hover:bg-[#008bc2] text-white font-['Inter',sans-serif] font-bold text-[11.5px] uppercase tracking-wider px-4 py-2.5 rounded-xl shadow-lg hover:shadow-cyan-500/25 flex items-center gap-2 transition-all cursor-pointer active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined text-sm font-bold">add</span>
          Tambah Pekerjaan
        </button>
      </div>

      {/* Task Sections Grouped by Category */}
      <div className="space-y-6">
        {allCategories.map((cat) => {
          const categoryTasks = filteredTasks.filter((t) => t.bidang === cat.name);

          // Calculate completed counter
          const totalCatTasks = tasks.filter((t) => t.bidang === cat.name).length;
          const completedCatTasks = tasks.filter(
            (t) => t.bidang === cat.name && t.status === 'SELESAI'
          ).length;

          if (selectedBidang !== 'Semua' && selectedBidang !== cat.name) {
            return null;
          }

          if (categoryTasks.length === 0 && selectedBidang === 'Semua' && searchQuery) {
            return null;
          }

          return (
            <div
              key={cat.name}
              className="bg-black/45 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden shadow-xl"
            >
              {/* Category Header Banner with deep blue theme */}
              <div className="bg-gradient-to-r from-[#003b5c]/90 via-[#005f8e]/90 to-[#003b5c]/90 border-b border-cyan-500/30 text-white px-6 py-4 flex justify-between items-center backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-xl text-cyan-300">
                    {cat.icon}
                  </span>
                  <h3 className="font-['Lora',serif] text-[17px] font-bold tracking-tight text-white">
                    {cat.name}
                  </h3>
                </div>
                <div className="bg-cyan-950/60 border border-cyan-400/40 px-3.5 py-1 rounded-full font-['JetBrains_Mono',monospace] text-[10.5px] font-bold text-cyan-200 tracking-wider">
                  {completedCatTasks}/{totalCatTasks} selesai
                </div>
              </div>

              {/* Task Items */}
              {categoryTasks.length === 0 ? (
                <div className="p-6 text-center text-gray-300 text-xs font-['Inter',sans-serif]">
                  Belum ada pekerjaan di bidang ini.
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {categoryTasks.map((task) => (
                    <div
                      key={task.id}
                      className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white/10 transition-colors group"
                    >
                      {/* Left: Title */}
                      <div
                        onClick={() => onOpenTaskDetail(task)}
                        className="flex-1 cursor-pointer pr-4"
                      >
                        <h4 className="font-['Inter',sans-serif] text-[14.5px] font-medium text-white group-hover:text-cyan-300 transition-colors leading-snug">
                          {task.title}
                        </h4>
                      </div>

                      {/* Middle: PJ */}
                      <div className="flex items-center gap-4 sm:gap-8 flex-shrink-0">
                        <div className="font-['JetBrains_Mono',monospace] text-[12px] text-gray-400 min-w-[90px]">
                          PJ: <span className="text-cyan-200 font-semibold">{task.pj || '-'}</span>
                        </div>

                        {/* Right: Interactive Badge Button matching theme */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onOpenTaskDetail(task)}
                            className={`px-4 py-1.5 rounded-full border-2 border-dashed font-['JetBrains_Mono',monospace] text-[10.5px] font-bold tracking-widest uppercase transition-all cursor-pointer ${
                              task.status === 'SELESAI'
                                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 hover:bg-emerald-500/30'
                                : task.status === 'PROSES'
                                ? 'bg-amber-500/20 border-amber-400 text-amber-200 hover:bg-amber-500/30'
                                : 'bg-white/10 border-gray-400 text-gray-300 hover:bg-white/20'
                            }`}
                          >
                            {task.status}
                          </button>
                          {onDeleteTask && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteTask(task.id);
                              }}
                              className="p-1.5 text-rose-300 hover:text-white hover:bg-rose-900/60 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Pekerjaan"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                delete
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
