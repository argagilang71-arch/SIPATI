import React, { useState } from 'react';
import { TaskItem, TaskStatus } from '../types';

interface DaftarPekerjaanProps {
  tasks: TaskItem[];
  onOpenTaskDetail: (task: TaskItem) => void;
  onAddTask: () => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
}

export const DaftarPekerjaan: React.FC<DaftarPekerjaanProps> = ({
  tasks,
  onOpenTaskDetail,
  onAddTask,
  onUpdateStatus,
}) => {
  const [selectedBidang, setSelectedBidang] = useState<string>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Default categories matching exact image layout
  const defaultCategories = [
    { name: 'Legalisasi Operasional', icon: 'description' },
    { name: 'Tata Kelola Rapat', icon: 'groups' },
    { name: 'Manajemen Korespondensi', icon: 'mail' },
    { name: 'Logistik & Perlengkapan', icon: 'inventory_2' },
    { name: 'Keuangan & Audit', icon: 'payments' },
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
      <div className="bg-[#FFFDF8] border border-[#E4DCC8] rounded-xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          {/* Bidang Select */}
          <div className="flex items-center gap-1.5 bg-[#f1eee5] rounded-md px-3 py-1.5 border border-[#E4DCC8]">
            <span className="font-['JetBrains_Mono',monospace] text-[10px] uppercase font-bold text-[#6E6A61]">
              Bidang:
            </span>
            <select
              value={selectedBidang}
              onChange={(e) => setSelectedBidang(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-[13px] text-[#20201D] font-medium p-0"
            >
              <option value="Semua">Semua Bidang</option>
              <option value="Legalisasi Operasional">Legalisasi Operasional</option>
              <option value="Tata Kelola Rapat">Tata Kelola Rapat</option>
              <option value="Manajemen Korespondensi">Manajemen Korespondensi</option>
              <option value="Logistik & Perlengkapan">Logistik & Perlengkapan</option>
              <option value="Keuangan & Audit">Keuangan & Audit</option>
            </select>
          </div>

          {/* Status Select */}
          <div className="flex items-center gap-1.5 bg-[#f1eee5] rounded-md px-3 py-1.5 border border-[#E4DCC8]">
            <span className="font-['JetBrains_Mono',monospace] text-[10px] uppercase font-bold text-[#6E6A61]">
              Status:
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-[13px] text-[#20201D] font-medium p-0"
            >
              <option value="Semua">Semua Status</option>
              <option value="BELUM">BELUM</option>
              <option value="PROSES">PROSES</option>
              <option value="SELESAI">SELESAI</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="flex-1 min-w-[200px] flex items-center bg-[#ffffff] border border-[#E4DCC8] rounded-md px-3 py-1.5">
            <span className="material-symbols-outlined text-[#6E6A61] text-sm mr-2">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama pekerjaan..."
              className="w-full bg-transparent border-none focus:outline-none text-[13px] text-[#20201D] p-0"
            />
          </div>
        </div>

        {/* Add Task Button */}
        <button
          onClick={onAddTask}
          className="bg-[#b62230] hover:bg-[#57000f] text-white font-['Inter',sans-serif] font-semibold text-[11.5px] uppercase tracking-wider px-4 py-2 rounded-md shadow-2xs flex items-center gap-2 transition-all cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Tambah Pekerjaan
        </button>
      </div>

      {/* Task Sections Grouped by Category */}
      <div className="space-y-6">
        {defaultCategories.map((cat) => {
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
              className="bg-[#FFFDF8] border border-[#E4DCC8] rounded-xl overflow-hidden shadow-2xs"
            >
              {/* Category Header Banner matching Image 1 */}
              <div className="bg-[#7a1220] text-white px-6 py-3.5 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-lg">
                    {cat.icon}
                  </span>
                  <h3 className="font-['Lora',serif] text-[16px] font-bold tracking-tight">
                    {cat.name}
                  </h3>
                </div>
                <div className="bg-[#57000f]/60 px-3 py-1 rounded-full font-['JetBrains_Mono',monospace] text-[10.5px] font-bold text-white tracking-wider">
                  {completedCatTasks}/{totalCatTasks} selesai
                </div>
              </div>

              {/* Task Items */}
              {categoryTasks.length === 0 ? (
                <div className="p-6 text-center text-[#6E6A61] text-xs font-['Inter',sans-serif]">
                  Belum ada pekerjaan di bidang ini.
                </div>
              ) : (
                <div className="divide-y divide-[#E4DCC8]/60">
                  {categoryTasks.map((task) => (
                    <div
                      key={task.id}
                      className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#f7f3ea]/60 transition-colors group"
                    >
                      {/* Left: Title */}
                      <div
                        onClick={() => onOpenTaskDetail(task)}
                        className="flex-1 cursor-pointer pr-4"
                      >
                        <h4 className="font-['Inter',sans-serif] text-[14px] font-medium text-[#20201D] group-hover:text-[#b62230] transition-colors leading-snug">
                          {task.title}
                        </h4>
                      </div>

                      {/* Middle: PJ */}
                      <div className="flex items-center gap-4 sm:gap-8 flex-shrink-0">
                        <div className="font-['JetBrains_Mono',monospace] text-[12px] text-[#6E6A61] min-w-[90px]">
                          PJ: <span className="text-[#20201D]">{task.pj}</span>
                        </div>

                        {/* Right: Interactive Badge Button matching Image 1 */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onOpenTaskDetail(task)}
                            className={`px-4 py-1.5 rounded-full border-2 border-dashed font-['JetBrains_Mono',monospace] text-[10.5px] font-bold tracking-widest uppercase transition-all cursor-pointer ${
                              task.status === 'SELESAI'
                                ? 'bg-[#2F6B44]/10 border-[#2F6B44] text-[#2F6B44] hover:bg-[#2F6B44]/20'
                                : task.status === 'PROSES'
                                ? 'bg-[#ffddb3]/30 border-[#563700] text-[#392300] hover:bg-[#ffddb3]/60'
                                : 'bg-[#f1eee5] border-[#8b7170] text-[#6E6A61] hover:bg-[#ece8df]'
                            }`}
                          >
                            {task.status}
                          </button>
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
