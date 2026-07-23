export type TaskStatus = 'BELUM' | 'PROSES' | 'SELESAI';

export interface TaskItem {
  id: string;
  title: string;
  bidang: string;
  pj: string;
  status: TaskStatus;
  catatan: string;
  draftPekerjaan?: string[];
  buktiDokumen: string[];
  buktiSuratDiterima: string[];
  noSurat?: string;
  dateCreated?: string;
}

export type ArchiveStatus = 'TERVERIFIKASI' | 'FINAL' | 'DIUSANGKAN';

export interface ArchiveItem {
  id: string;
  title: string;
  noSurat: string;
  bidang: string;
  date: string;
  status: ArchiveStatus;
  fileType: 'pdf' | 'doc' | 'zip';
  description?: string;
  fileSize?: string;
}

export interface TemplateItem {
  id: string;
  title: string;
  category: string;
  targetPekerjaan: string;
  status: TaskStatus;
  description: string;
  googleDocsUrl?: string;
  backupFile?: string;
  code?: string;
  sampleText?: string;
}

export interface ProposalItem {
  id: string;
  judul: string;
  bidang: string;
  anggaran: number;
  latarBelakang: string;
  status: 'Draf' | 'Diajukan' | 'Disetujui';
  dateSubmitted: string;
}

export type ViewMode = 'landing' | 'login' | 'ringkasan' | 'pekerjaan' | 'template' | 'arsip' | 'pengaturan' | 'appscript';
