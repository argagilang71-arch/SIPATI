import { TaskItem, ArchiveItem, TemplateItem, ProposalItem } from './types';

export const INITIAL_TASKS: TaskItem[] = [
  // Legalisasi Operasional
  {
    id: 'task-1',
    title: 'Penyusunan Surat Keputusan (SK) Panitia HUT RI Ke-81 Tahun 2026',
    bidang: 'Legalisasi Operasional',
    pj: '—',
    status: 'BELUM',
    catatan: 'Konsep SK sedang disiapkan oleh Tim Hukum Administrasi.',
    draftPekerjaan: ['Draft_Konsep_SK_Panitia_v1.docx'],
    buktiDokumen: [],
    buktiSuratDiterima: [],
    noSurat: '045/SK/PAN-RI/VIII/2026',
    dateCreated: '2026-08-01'
  },
  {
    id: 'task-2',
    title: 'Surat tugas khusus untuk internal bagian tata pemerintahan',
    bidang: 'Legalisasi Operasional',
    pj: '—',
    status: 'BELUM',
    catatan: 'Penugasan personel untuk gladi bersih dan koordinasi lapangan.',
    draftPekerjaan: ['Draft_Surat_Tugas_Internal_Gov.docx'],
    buktiDokumen: [],
    buktiSuratDiterima: [],
    noSurat: '048/ST/GOV/VIII/2026',
    dateCreated: '2026-08-02'
  },
  // Tata Kelola Rapat
  {
    id: 'task-3',
    title: 'Koordinasi rapat internal/eksternal',
    bidang: 'Tata Kelola Rapat',
    pj: 'Budi Santoso, S.STP',
    status: 'PROSES',
    catatan: 'Jadwal rapat plenary dengan instansi terkait pada 10 Agustus 2026.',
    draftPekerjaan: ['Draf_Agenda_Rapat_Koordinasi.docx'],
    buktiDokumen: ['Draf_Undangan_Rapat_Pleno.pdf'],
    buktiSuratDiterima: [],
    noSurat: '012/UND/PAN-RI/VIII/2026',
    dateCreated: '2026-08-03'
  },
  {
    id: 'task-4',
    title: 'Penyiapan seluruh bahan materi rapat',
    bidang: 'Tata Kelola Rapat',
    pj: 'Siti Rahma, M.Si',
    status: 'BELUM',
    catatan: 'Pengumpulan paparan dari masing-masing koordinator seksi.',
    draftPekerjaan: ['Draft_Slide_Materi_Pleno.pptx'],
    buktiDokumen: [],
    buktiSuratDiterima: [],
    noSurat: '014/MAT/PAN-RI/VIII/2026',
    dateCreated: '2026-08-04'
  },
  // Manajemen Korespondensi
  {
    id: 'task-5',
    title: 'Surat Edaran Menyemarakkan HUT RI',
    bidang: 'Manajemen Korespondensi',
    pj: 'Drs. H. Mulyadi',
    status: 'SELESAI',
    catatan: 'Telah didistribusikan ke seluruh dinas dan kecamatan.',
    draftPekerjaan: ['Konsep_Surat_Edaran_HUT_81.docx'],
    buktiDokumen: ['SE_HUT_RI_81_Signed.pdf'],
    buktiSuratDiterima: ['Tanda_Terima_Kecamatan.jpg'],
    noSurat: '001/SE/PAN-RI/VIII/2026',
    dateCreated: '2026-08-01'
  },
  {
    id: 'task-6',
    title: 'Surat Undangan Rapat Koordinasi Panitia',
    bidang: 'Manajemen Korespondensi',
    pj: '—',
    status: 'BELUM',
    catatan: 'Undangan untuk Rapat Rencana Anggaran.',
    draftPekerjaan: ['Draft_Undangan_Anggaran.docx'],
    buktiDokumen: [],
    buktiSuratDiterima: [],
    noSurat: '002/UND/PAN-RI/VIII/2026',
    dateCreated: '2026-08-02'
  },
  {
    id: 'task-7',
    title: 'Surat Permintaan Pasukan ke TNI/POLRI',
    bidang: 'Manajemen Korespondensi',
    pj: 'Mayor Inf. Agus Supriyadi',
    status: 'PROSES',
    catatan: 'Permohonan 150 personel Paskibraka dan Pengamanan.',
    draftPekerjaan: ['Draft_Surat_Permintaan_Pasukan.docx'],
    buktiDokumen: ['Surat_Permohonan_TNI.pdf'],
    buktiSuratDiterima: [],
    noSurat: '003/SRT/PAN-RI/VIII/2026',
    dateCreated: '2026-08-03'
  },
  {
    id: 'task-8',
    title: 'Surat Permohonan Paduan Suara',
    bidang: 'Manajemen Korespondensi',
    pj: '—',
    status: 'BELUM',
    catatan: 'Ke Paduan Suara Mahasiswa Universitas Negeri.',
    draftPekerjaan: ['Draft_Permohonan_Padus.docx'],
    buktiDokumen: [],
    buktiSuratDiterima: [],
    noSurat: '004/SRT/PAN-RI/VIII/2026',
    dateCreated: '2026-08-04'
  },
  {
    id: 'task-9',
    title: 'Surat Permohonan Drum Band',
    bidang: 'Manajemen Korespondensi',
    pj: '—',
    status: 'BELUM',
    catatan: 'Untuk Pawai Budaya HUT RI Ke-81.',
    draftPekerjaan: ['Draft_Permohonan_DrumBand.docx'],
    buktiDokumen: [],
    buktiSuratDiterima: [],
    noSurat: '005/SRT/PAN-RI/VIII/2026',
    dateCreated: '2026-08-05'
  },
  {
    id: 'task-10',
    title: 'Surat Pelaksanaan Upacara Bendera Detik-Detik Proklamasi',
    bidang: 'Manajemen Korespondensi',
    pj: 'Drs. Suparna',
    status: 'PROSES',
    catatan: 'Koordinasi protokol istana negara daerah.',
    draftPekerjaan: ['Draft_Petunjuk_Upacara_Proklamasi.docx'],
    buktiDokumen: ['Draft_Protokol_Upacara.pdf'],
    buktiSuratDiterima: [],
    noSurat: '006/SRT/PAN-RI/VIII/2026',
    dateCreated: '2026-08-05'
  }
];

export const INITIAL_ARCHIVES: ArchiveItem[] = [];

export const INITIAL_TEMPLATES: TemplateItem[] = [
  // Legalisasi Operasional (2 template)
  {
    id: 'tpl-1',
    title: 'Template SK Panitia HUT RI',
    category: 'Legalisasi Operasional',
    targetPekerjaan: 'Penyusunan Surat Keputusan (SK) Panitia HUT RI Ke-81 Tahun 2026',
    status: 'BELUM',
    description: 'Format baku Surat Keputusan penetapan susunan kepanitiaan dan tugas penanggung jawab.',
    googleDocsUrl: '',
    backupFile: '',
    code: 'TPL-SK-01'
  },
  {
    id: 'tpl-2',
    title: 'Template Surat Tugas Internal',
    category: 'Legalisasi Operasional',
    targetPekerjaan: 'Surat tugas khusus untuk internal bagian tata pemerintahan',
    status: 'BELUM',
    description: 'Surat penugasan resmi personel sekretariat dan seksi penunjang.',
    googleDocsUrl: '',
    backupFile: 'SK TIM PELAKSANA HUT RI KE-81 TAHUN 2026 EDIT 27 8 2025 (1).DOC',
    code: 'TPL-ST-02'
  },

  // Tata Kelola Rapat (1 template)
  {
    id: 'tpl-3',
    title: 'Template Undangan Rapat',
    category: 'Tata Kelola Rapat',
    targetPekerjaan: 'Koordinasi rapat internal/eksternal',
    status: 'BELUM',
    description: 'Format undangan rapat koordinasi internal/eksternal.',
    googleDocsUrl: '',
    backupFile: 'DRAFT_UNDANGAN_RAPAT_PLENO_2026.DOC',
    code: 'TPL-UND-03'
  },

  // Manajemen Korespondensi (5 template)
  {
    id: 'tpl-4',
    title: 'Template Surat Edaran HUT RI',
    category: 'Manajemen Korespondensi',
    targetPekerjaan: 'Surat Edaran Menyemarakkan HUT RI',
    status: 'BELUM',
    description: 'Imbauan Pemasangan Bendera dan Umbul-umbul di lingkungan instansi dan masyarakat.',
    googleDocsUrl: '',
    backupFile: '',
    code: 'TPL-SE-04'
  },
  {
    id: 'tpl-5',
    title: 'Template Surat Permintaan Pasukan',
    category: 'Manajemen Korespondensi',
    targetPekerjaan: 'Surat Permintaan Pasukan ke TNI/POLRI',
    status: 'BELUM',
    description: 'Permohonan 150 personel Paskibraka dan Pengamanan.',
    googleDocsUrl: '',
    backupFile: '',
    code: 'TPL-SRT-05'
  },
  {
    id: 'tpl-6',
    title: 'Template Surat Pelaksanaan Latihan Gabungan',
    category: 'Manajemen Korespondensi',
    targetPekerjaan: 'Surat Pelaksanaan Latihan Gabungan',
    status: 'BELUM',
    description: 'Instruksi dan jadwal latihan gabungan pengibaran bendera.',
    googleDocsUrl: '',
    backupFile: '',
    code: 'TPL-SRT-06'
  },
  {
    id: 'tpl-7',
    title: 'Template ST Petugas Upacara',
    category: 'Manajemen Korespondensi',
    targetPekerjaan: 'ST Petugas Upacara (termasuk MC)',
    status: 'BELUM',
    description: 'Penugasan pembawa acara, perwira upacara, dan pembaca teks proklamasi.',
    googleDocsUrl: '',
    backupFile: '',
    code: 'TPL-ST-07'
  },
  {
    id: 'tpl-8',
    title: 'Template Surat Permohonan Live Streaming',
    category: 'Manajemen Korespondensi',
    targetPekerjaan: 'Surat Permohonan Live Streaming ke Diskominfo',
    status: 'BELUM',
    description: 'Permohonan bantuan fasilitas penyiaran langsung dan satelit.',
    googleDocsUrl: '',
    backupFile: '',
    code: 'TPL-SRT-08'
  }
];

export const INITIAL_PROPOSALS: ProposalItem[] = [
  {
    id: 'prop-1',
    judul: 'Proposal Pengadaan Sound System & Panggung Utama HUT RI 81',
    bidang: 'Logistik & Perlengkapan',
    anggaran: 45000000,
    latarBelakang: 'Kebutuhan panggung kehormatan dan audio kualitas broadcast untuk upacara detik-detik proklamasi.',
    status: 'Diajukan',
    dateSubmitted: '2026-08-01'
  },
  {
    id: 'prop-2',
    judul: 'Proposal Konsumsi & Akomodasi Tim Paskibraka Daerah',
    bidang: 'Keuangan & Audit',
    anggaran: 68000000,
    latarBelakang: 'Fasilitas karantina dan pemenuhan gizi 75 calon Paskibraka selama 14 hari pemusatan latihan.',
    status: 'Disetujui',
    dateSubmitted: '2026-07-28'
  }
];
