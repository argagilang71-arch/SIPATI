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
  taskId?: string;
  title: string;
  noSurat: string;
  bidang: string;
  date: string;
  status: ArchiveStatus;
  fileType: string;
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

export interface TeamMember {
  id: string;
  nama: string;
  nip: string;
  jabatan: string;
  subBagian: string;
  username: string;
  password?: string;
  role: 'Officer / Administrator' | 'Analis Kebijakan' | 'Staf Operasional';
}

export interface BannerConfig {
  enabled: boolean;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
  linkUrl?: string;
  linkText?: string;
  imageUrl?: string;
  dismissible?: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export type ViewMode = 'landing' | 'login' | 'ringkasan' | 'pekerjaan' | 'template' | 'arsip' | 'pengaturan' | 'appscript';
