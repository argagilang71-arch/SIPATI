import React, { useState } from 'react';
import garudaEmblemImg from '../assets/images/garuda_pancasila_emblem_1784830236371.jpg';

interface TeamMember {
  id: string;
  nama: string;
  nip: string;
  jabatan: string;
  subBagian: string;
}

export const PengaturanView: React.FC = () => {
  const [namaInstansi, setNamaInstansi] = useState(
    'Bagian Tata Pemerintahan Sekretariat Daerah Kabupaten Kubu Raya'
  );
  const [namaAdmin, setNamaAdmin] = useState('Drs. H. Mulyadi, M.Si');
  const [nipAdmin, setNipAdmin] = useState('19780512 200312 1 002');
  const [emailNotif, setEmailNotif] = useState('tatapemerintahan@kuburayakab.go.id');
  const [autoArchive, setAutoArchive] = useState(true);
  const [saved, setSaved] = useState(false);

  // Daftar Anggota & NIP
  const [anggotaList, setAnggotaList] = useState<TeamMember[]>([
    {
      id: 'm-1',
      nama: 'Drs. H. Mulyadi, M.Si',
      nip: '19780512 200312 1 002',
      jabatan: 'Kepala Bagian Tata Pemerintahan',
      subBagian: 'Kepala Bagian Tata Pemerintahan',
    },
    {
      id: 'm-2',
      nama: 'Siti Rahma, S.IP, M.Si',
      nip: '19860920 200904 2 005',
      jabatan: 'Analis Kebijakan Ahli Muda',
      subBagian: 'Analis Kebijakan Ahli Muda',
    },
    {
      id: 'm-3',
      nama: 'Budi Santoso, S.STP, M.Si',
      nip: '19820415 200602 1 003',
      jabatan: 'Analis Kebijakan Ahli Pertama',
      subBagian: 'Analis Kebijakan Ahli Pertama',
    },
    {
      id: 'm-4',
      nama: 'Hendra Wijaya, S.IP',
      nip: '19890510 201201 1 004',
      jabatan: 'Penelaah Teknis Kebijakan',
      subBagian: 'Penelaah Teknis Kebijakan',
    },
    {
      id: 'm-5',
      nama: 'Ahmad Subagyo, S.E.',
      nip: '19910314 201503 1 002',
      jabatan: 'Analis Kewilayahan',
      subBagian: 'Analis Kewilayahan',
    },
    {
      id: 'm-6',
      nama: 'Drs. Suparna',
      nip: '19720310 199803 1 004',
      jabatan: 'Pengadministrasi Umum',
      subBagian: 'Pengadministrasi Umum',
    },
    {
      id: 'm-7',
      nama: 'Rina Kartika, A.Md',
      nip: '19941108 201801 2 001',
      jabatan: 'Pengelola Layanan Operasional',
      subBagian: 'Pengelola Layanan Operasional',
    },
    {
      id: 'm-8',
      nama: 'Aris Munandar',
      nip: 'TENAGA KONTRAK / NON-ASN',
      jabatan: 'Tenaga Pendukung Teknis (Outsourcing)',
      subBagian: 'Tenaga Pendukung Teknis (Outsourcing)',
    },
  ]);

  // Modal State untuk Tambah/Edit Anggota
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState<Omit<TeamMember, 'id'>>({
    nama: '',
    nip: '',
    jabatan: '',
    subBagian: 'Analis Kebijakan Ahli Muda',
  });

  const handleOpenAddMember = () => {
    setEditingMemberId(null);
    setMemberForm({
      nama: '',
      nip: '',
      jabatan: '',
      subBagian: 'Analis Kebijakan Ahli Muda',
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
    });
    setIsMemberModalOpen(true);
  };

  const handleDeleteMember = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus anggota ini dari daftar?')) {
      setAnggotaList(anggotaList.filter((m) => m.id !== id));
    }
  };

  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberForm.nama.trim() || !memberForm.nip.trim()) {
      alert('Nama dan NIP wajib diisi.');
      return;
    }

    if (editingMemberId) {
      setAnggotaList(
        anggotaList.map((m) =>
          m.id === editingMemberId ? { id: editingMemberId, ...memberForm } : m
        )
      );
    } else {
      const newMember: TeamMember = {
        id: `m-${Date.now()}`,
        ...memberForm,
      };
      setAnggotaList([...anggotaList, newMember]);
    }
    setIsMemberModalOpen(false);
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl pb-12">
      {/* Title */}
      <div>
        <h2 className="font-['Lora',serif] text-[22px] sm:text-[26px] font-bold text-[#57000f] mb-1">
          Pengaturan Sistem &amp; Profil Staff
        </h2>
        <p className="text-[#574141] font-['Inter',sans-serif] text-[13.5px]">
          Kelola identitas instansi, daftar anggota &amp; NIP Bagian Tata Pemerintahan Kubu Raya, serta preferensi pelaporan otomatis.
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-[#2F6B44]/15 border border-[#2F6B44] text-[#2F6B44] rounded-lg text-xs font-['Inter',sans-serif] font-semibold flex items-center gap-2 animate-fadeIn">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          Seluruh konfigurasi dan daftar anggota berhasil disimpan!
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

        {/* DAFTAR ANGGOTA & NIP (BAGIAN TATA PEMERINTAHAN) */}
        <div className="bg-[#FFFDF8] border border-[#E4DCC8] rounded-xl p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4DCC8] pb-3">
            <div>
              <h3 className="font-['Lora',serif] text-[16px] font-bold text-[#57000f] flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">badge</span>
                Daftar Anggota &amp; NIP Staff Bagian
              </h3>
              <p className="text-xs text-[#6E6A61] mt-0.5">
                Kelola daftar nama pegawai, NIP, dan jabatan pelaksana tata naskah dinas di lingkungan Bagian Tata Pemerintahan.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenAddMember}
              className="px-3.5 py-2 bg-[#b62230] hover:bg-[#57000f] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 self-start sm:self-auto shadow-2xs active:scale-95"
            >
              <span className="material-symbols-outlined text-sm">person_add</span>
              <span>Tambah Anggota</span>
            </button>
          </div>

          {/* Table / List of Members */}
          <div className="overflow-x-auto rounded-lg border border-[#E4DCC8]">
            <table className="w-full text-left text-xs font-['Inter',sans-serif]">
              <thead className="bg-[#fcf8ee] border-b border-[#E4DCC8] font-bold uppercase text-[#6E6A61]">
                <tr>
                  <th className="p-3">Nama Anggota</th>
                  <th className="p-3">NIP / Nomor Pegawai</th>
                  <th className="p-3">Jabatan / Peran</th>
                  <th className="p-3">Sub-Bagian</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4DCC8]/60 text-[#1c1c16]">
                {anggotaList.map((member) => (
                  <tr key={member.id} className="hover:bg-[#fdfaf2] transition">
                    <td className="p-3 font-semibold text-[#1c1c16]">
                      {member.nama}
                    </td>
                    <td className="p-3 font-mono font-medium text-[#57000f]">
                      {member.nip}
                    </td>
                    <td className="p-3 text-[#574141]">{member.jabatan}</td>
                    <td className="p-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#57000f]/10 text-[#57000f] border border-[#57000f]/20">
                        {member.subBagian}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditMember(member)}
                          className="p-1.5 text-slate-600 hover:text-[#b62230] hover:bg-slate-100 rounded transition cursor-pointer"
                          title="Edit Anggota"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(member.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition cursor-pointer"
                          title="Hapus Anggota"
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
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#b62230] hover:bg-[#57000f] text-white font-['Inter',sans-serif] font-semibold text-[12px] uppercase tracking-wider px-6 py-3 rounded-lg shadow-2xs transition-all cursor-pointer active:scale-95"
          >
            Simpan Seluruh Pengaturan
          </button>
        </div>
      </form>

      {/* MODAL TAMBAH / EDIT ANGGOTA */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-[#FFFDF8] rounded-xl border border-[#E4DCC8] shadow-2xl max-w-md w-full overflow-hidden flex flex-col font-['Inter',sans-serif]">
            {/* Header */}
            <div className="bg-[#57000f] text-white px-5 py-3.5 flex items-center justify-between">
              <h4 className="font-['Lora',serif] font-bold text-base text-white">
                {editingMemberId ? 'Edit Data Anggota' : 'Tambah Anggota Baru'}
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

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6A61] mb-1">
                  JABATAN / PERAN TUGAS
                </label>
                <input
                  type="text"
                  required
                  value={memberForm.jabatan}
                  onChange={(e) => setMemberForm({ ...memberForm, jabatan: e.target.value })}
                  placeholder="Contoh: Analis Kebijakan Ahli Muda"
                  className="w-full px-3.5 py-2 bg-white border border-[#E4DCC8] rounded-md text-xs text-[#1c1c16] font-medium focus:border-[#b62230] outline-none"
                />
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
                  Simpan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
