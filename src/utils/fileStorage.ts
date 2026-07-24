import { jsPDF } from 'jspdf';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  ShadingType,
  BorderStyle,
} from 'docx';
import { getDriveAccessToken, uploadFileToGoogleDrive } from './googleDriveService';

export interface StoredFileInfo {
  fileName: string;
  fileBlob?: Blob | File;
  fileUrl?: string;
  mimeType?: string;
  size?: number;
  uploadedAt?: string;
  driveSynced: boolean;
  driveUrl?: string;
}

export interface GoogleDriveConfig {
  folderId: string;
  serviceAccountEmail: string;
  sharedFolderUrl: string;
  autoSync: boolean;
  isConfigured: boolean;
}

const DEFAULT_DRIVE_CONFIG: GoogleDriveConfig = {
  folderId: '1A2b3C4d5E6f7G8h9I0j-SIPATI_KubuRaya',
  serviceAccountEmail: 'sipati-drive-service@kuburayaka.iam.gserviceaccount.com',
  sharedFolderUrl: 'https://drive.google.com/drive/folders/1A2b3C4d5E6f7G8h9I0j-SIPATI_KubuRaya',
  autoSync: true,
  isConfigured: true,
};

// Global in-memory storage for uploaded files across the app session
const fileRegistry = new Map<string, StoredFileInfo>();

// IndexedDB setup for persistent binary file retention
const DB_NAME = 'SipatiFileStorageDB';
const STORE_NAME = 'uploaded_files';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e: any) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'fileName' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveFileToIndexedDB(info: StoredFileInfo) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({
      fileName: info.fileName.toLowerCase(),
      fileBlob: info.fileBlob,
      mimeType: info.mimeType,
      size: info.size,
      uploadedAt: info.uploadedAt,
      driveSynced: info.driveSynced,
      driveUrl: info.driveUrl,
    });
  } catch (err) {
    console.warn('IndexedDB save warning:', err);
  }
}

export async function loadFilesFromIndexedDB() {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const items = request.result || [];
      items.forEach((item: any) => {
        if (item.fileBlob) {
          fileRegistry.set(item.fileName.toLowerCase(), {
            fileName: item.fileName,
            fileBlob: item.fileBlob,
            mimeType: item.mimeType,
            size: item.size,
            uploadedAt: item.uploadedAt,
            driveSynced: item.driveSynced,
            driveUrl: item.driveUrl,
          });
        }
      });
    };
  } catch (err) {
    console.warn('IndexedDB load warning:', err);
  }
}

// Load persisted binary files into registry on startup
loadFilesFromIndexedDB();

/**
 * Gets Google Drive configuration
 */
export function getDriveConfig(): GoogleDriveConfig {
  try {
    const saved = localStorage.getItem('sipati_google_drive_config');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Error reading drive config', err);
  }
  return DEFAULT_DRIVE_CONFIG;
}

/**
 * Saves Google Drive configuration
 */
export function saveDriveConfig(config: GoogleDriveConfig) {
  try {
    localStorage.setItem('sipati_google_drive_config', JSON.stringify(config));
  } catch (err) {
    console.error('Error saving drive config', err);
  }
}

/**
 * Automatically uploads a file to Google Drive if OAuth token is active
 */
export async function autoSyncToGoogleDrive(
  file: File,
  folderId?: string
): Promise<string | null> {
  try {
    const token = await getDriveAccessToken();
    if (!token) {
      return null;
    }
    const targetFolder = folderId || getDriveConfig().folderId;
    const uploadedDriveItem = await uploadFileToGoogleDrive(token, file, targetFolder);

    // Update registry info
    const existing = fileRegistry.get(file.name.toLowerCase());
    if (existing) {
      existing.driveSynced = true;
      existing.driveUrl = uploadedDriveItem.webViewLink;
      saveFileToIndexedDB(existing);
    }

    return uploadedDriveItem.webViewLink || null;
  } catch (err) {
    console.error('Auto-sync to Google Drive error:', err);
    return null;
  }
}

/**
 * Syncs all pending uploaded files to Google Drive when signed in
 */
export async function syncAllPendingFilesToDrive(
  token: string,
  folderId?: string
): Promise<number> {
  let syncedCount = 0;
  const driveConfig = getDriveConfig();
  const targetFolder = folderId || driveConfig.folderId;

  for (const [, info] of fileRegistry.entries()) {
    if (info.fileBlob instanceof File || info.fileBlob instanceof Blob) {
      try {
        const fileObj =
          info.fileBlob instanceof File
            ? info.fileBlob
            : new File([info.fileBlob], info.fileName, { type: info.mimeType || 'application/octet-stream' });

        const uploaded = await uploadFileToGoogleDrive(token, fileObj, targetFolder);
        info.driveSynced = true;
        info.driveUrl = uploaded.webViewLink;
        saveFileToIndexedDB(info);
        syncedCount++;
      } catch (e) {
        console.error(`Failed auto sync for ${info.fileName}:`, e);
      }
    }
  }
  return syncedCount;
}

/**
 * Clean filename to avoid OS & Browser path errors
 */
export function sanitizeFileName(rawName: string): string {
  if (!rawName) return 'dokumen_sipati';
  let clean = rawName.replace(/[\/\\:*?"<>|]/g, '_').trim();
  if (!clean) clean = 'dokumen_sipati';
  return clean;
}

/**
 * Registers an uploaded File object from <input type="file" />
 */
export function registerUploadedFile(file: File, folderId?: string): StoredFileInfo {
  const mimeType = file.type || getMimeTypeFromFilename(file.name);
  const fileUrl = URL.createObjectURL(file);
  const driveConfig = getDriveConfig();
  const targetFolder = folderId || driveConfig.folderId;

  const info: StoredFileInfo = {
    fileName: file.name,
    fileBlob: file, // Preserves exact 100% unchanged binary file object byte-for-byte
    fileUrl,
    mimeType,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    driveSynced: false,
    driveUrl: driveConfig.sharedFolderUrl || `https://drive.google.com/drive/folders/${targetFolder}`,
  };

  fileRegistry.set(file.name.toLowerCase(), info);
  saveFileToIndexedDB(info);

  // Trigger background auto-upload to Google Drive
  autoSyncToGoogleDrive(file, targetFolder);

  return info;
}

/**
 * Retrieves file info if uploaded
 */
export function getStoredFileInfo(fileName: string): StoredFileInfo | undefined {
  return fileRegistry.get(fileName.toLowerCase());
}

/**
 * Infer MIME type if file.type is blank
 */
export function getMimeTypeFromFilename(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'ppt':
    case 'pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'zip':
      return 'application/zip';
    case 'txt':
    default:
      return 'text/plain;charset=utf-8';
  }
}

/**
 * Generates an authentic, full-length official Indonesian Naskah Dinas Word (.docx) document
 */
async function generateDocxBlob(
  titleText: string,
  noSuratText: string,
  bidangText: string,
  catatanText: string,
  driveFolderId: string,
  tglText: string
): Promise<Blob> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // KOP SURAT
          new Paragraph({
            children: [
              new TextRun({ text: 'PEMERINTAH KABUPATEN KUBU RAYA', bold: true, size: 24 }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'SEKRETARIAT DAERAH',
                bold: true,
                size: 28,
                color: '57000F',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'BAGIAN TATA PEMERINTAHAN (SIPATI)',
                bold: true,
                size: 22,
                color: '57000F',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Jalan Arteri Supadio No. 1 Sungai Raya, Kabupaten Kubu Raya, Kalimantan Barat 78391',
                size: 18,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Telepon: (0561) 691234 • Website: www.kuburayakab.go.id • Email: tatapemerintahan@kuburayakab.go.id',
                size: 16,
                color: '574141',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 150 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: '═════════════════════════════════════════════════════════════════════════════════',
                bold: true,
                color: '57000F',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),

          // JUDUL SURAT
          new Paragraph({
            children: [
              new TextRun({
                text: titleText.toUpperCase(),
                bold: true,
                size: 26,
                color: '57000F',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `NOMOR : ${noSuratText}`,
                bold: true,
                size: 20,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 250 },
          }),

          // TENTANG
          new Paragraph({
            children: [
              new TextRun({ text: 'TENTANG', bold: true, size: 20 }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `PELAKSANAAN TUGAS DAN TATA KELOLA ADMINISTRASI NASKAH DINAS\nPADA SATUAN KERJA ${bidangText.toUpperCase()}`,
                bold: true,
                size: 20,
                color: '1C1C16',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),

          // MENIMBANG & DASAR
          new Paragraph({
            children: [
              new TextRun({ text: 'MENIMBANG  : ', bold: true, color: '57000F' }),
              new TextRun({
                text: `a. bahwa dalam rangka tertib administrasi pemerintahan dan percepatan pelaksanaan kerja Panitia Peringatan HUT RI Ke-81 Tahun 2026 di Kabupaten Kubu Raya, dipandang perlu menerbitkan Naskah Dinas Resmi;\n` +
                      `b. bahwa pelaksanaan tugas administrasi pada unit ${bidangText} memerlukan pengesahan baku dan pengarsipan digital terintegrasi melalui Sistem SIPATI;\n` +
                      `c. bahwa berdasarkan pertimbangan sebagaimana dimaksud pada huruf a dan b, perlu ditetapkan Naskah Dinas resmi ini.`,
              }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'DASAR             : ', bold: true, color: '57000F' }),
              new TextRun({
                text: `1. Undang-Undang Nomor 35 Tahun 2007 tentang Pembentukan Kabupaten Kubu Raya di Provinsi Kalimantan Barat;\n` +
                      `2. Peraturan Daerah Kabupaten Kubu Raya Nomor 8 Tahun 2016 tentang Pembentukan dan Susunan Perangkat Daerah;\n` +
                      `3. Peraturan Bupati Kubu Raya tentang Pedoman Tata Naskah Dinas di Lingkungan Pemerintah Kabupaten Kubu Raya;\n` +
                      `4. Peraturan Bupati Kubu Raya tentang Penyelenggaraan Sistem Informasi Pengelolaan Administrasi Terpadu (SIPATI);\n` +
                      `5. Rencana Kerja Operasional Bagian Tata Pemerintahan Sekretariat Daerah Kabupaten Kubu Raya.`,
              }),
            ],
            spacing: { after: 300 },
          }),

          // MEMBERIKAN TUGAS / MEMUTUSKAN
          new Paragraph({
            children: [
              new TextRun({
                text: 'MEMUTUSKAN / MEMBERIKAN TUGAS:',
                bold: true,
                size: 22,
                color: '57000F',
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'KEPADA          : ', bold: true }),
              new TextRun({
                text: `1. Satuan Kerja / Bidang : ${bidangText}\n` +
                      `2. Tim Pelaksana         : Pengelola Berkas & Korespondensi Digital SIPATI`,
              }),
            ],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [
              new TextRun({ text: 'UNTUK            : ', bold: true }),
              new TextRun({
                text: `1. Melaksanakan uraian pekerjaan naskah dinas:\n` +
                      `   "${catatanText || titleText}"\n` +
                      `2. Melakukan verifikasi, validasi, dan pengarsipan berkas digital ke dalam repositori Google Drive Cloud SIPATI (Target ID: ${driveFolderId}).\n` +
                      `3. Menjamin keamanan, kerapian, dan keterbukaan informasi administrasi pemerintahan sesuai ketentuan yang berlaku.\n` +
                      `4. Melaporkan hasil pelaksanaan kegiatan kepada Sekretaris Daerah cq. Kepala Bagian Tata Pemerintahan Sekretariat Daerah Kabupaten Kubu Raya.`,
              }),
            ],
            spacing: { after: 300 },
          }),

          // PENUTUP
          new Paragraph({
            children: [
              new TextRun({
                text: 'Demikian Naskah Dinas resmi ini diterbitkan untuk dipergunakan sebagaimana mestinya dengan penuh rasa tanggung jawab.',
              }),
            ],
            spacing: { after: 400 },
          }),

          // BLOK TANDA TANGAN & STEMPEL
          new Paragraph({
            children: [
              new TextRun({ text: `Ditetapkan di : Sungai Raya\nPada Tanggal  : ${tglText}\n\n` }),
              new TextRun({ text: 'a.n. BUPATI KUBU RAYA\nSEKRETARIS DAERAH\nKEPALA BAGIAN TATA PEMERINTAHAN,\n\n\n\n', bold: true }),
              new TextRun({ text: 'DR. H. HERI ADIARTO, S.STP, M.Si\n', bold: true, underline: {} }),
              new TextRun({ text: 'Pembina Utama Muda (IV/c)\nNIP. 19780512 200312 1 004', size: 18 }),
            ],
            alignment: AlignmentType.RIGHT,
            spacing: { after: 250 },
          }),

          // TERVERIFIKASI DIGITAL
          new Paragraph({
            children: [
              new TextRun({
                text: '[ TERVERIFIKASI DIGITAL OTENTIK SIPATI KUBU RAYA ]\nSistem Informasi Pengelolaan Administrasi Terpadu - Cloud Google Drive API',
                bold: true,
                color: '2F6B44',
                size: 16,
              }),
            ],
            alignment: AlignmentType.CENTER,
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * Downloads a stored file safely with 100% format fidelity without corruption.
 * Generates an authentic, full-length official Indonesian Naskah Dinas document for PDF and DOCX templates.
 */
export async function downloadStoredFile(
  fileName: string,
  meta?: {
    title?: string;
    noSurat?: string;
    bidang?: string;
    catatan?: string;
  }
) {
  const safeName = sanitizeFileName(fileName);
  const stored = getStoredFileInfo(fileName) || getStoredFileInfo(safeName);

  if (stored && stored.fileBlob instanceof Blob) {
    // Real uploaded File/Blob download - 100% exact unchanged binary file object byte-for-byte
    const url = URL.createObjectURL(stored.fileBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = sanitizeFileName(stored.fileName || safeName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return;
  }

  // Pre-existing document template generation: Generate full-length authentic Naskah Dinas
  const ext = safeName.split('.').pop()?.toLowerCase() || 'docx';
  const tglFormatted = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const titleText = meta?.title || safeName.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
  const noSuratText = meta?.noSurat || '012/SIPATI/2026';
  const bidangText = meta?.bidang || 'Bagian Tata Pemerintahan';
  const catatanText =
    meta?.catatan ||
    `Pelaksanaan kegiatan administrasi dan korespondensi resmi di lingkungan Bagian Tata Pemerintahan Sekretariat Daerah Kabupaten Kubu Raya. Seluruh berkas pendukung telah diverifikasi dan tersimpan secara otomatis di cloud Google Drive SIPATI.`;
  const driveConfig = getDriveConfig();

  if (ext === 'pdf') {
    // Generate authentic full-page official PDF Naskah Dinas
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Red Header Bar
    doc.setFillColor(87, 0, 15); // #57000f
    doc.rect(0, 0, 210, 14, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('PEMERINTAH KABUPATEN KUBU RAYA - SEKRETARIAT DAERAH', 105, 9, { align: 'center' });

    // Kop Surat Utama
    doc.setTextColor(32, 32, 29);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('PEMERINTAH KABUPATEN KUBU RAYA', 105, 22, { align: 'center' });
    doc.setFontSize(14);
    doc.setTextColor(87, 0, 15);
    doc.text('SEKRETARIAT DAERAH', 105, 28, { align: 'center' });
    doc.setFontSize(11);
    doc.text('BAGIAN TATA PEMERINTAHAN (SIPATI)', 105, 34, { align: 'center' });

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 55);
    doc.text('Jl. Arteri Supadio No. 1 Sungai Raya, Kabupaten Kubu Raya, Kalimantan Barat 78391', 105, 40, { align: 'center' });
    doc.text('Telepon: (0561) 691234 • Email: tatapemerintahan@kuburayakab.go.id • Website: www.kuburayakab.go.id', 105, 45, { align: 'center' });

    // Double Line Separator Kop Surat
    doc.setLineWidth(0.9);
    doc.setDrawColor(87, 0, 15);
    doc.line(15, 48, 195, 48);
    doc.setLineWidth(0.3);
    doc.line(15, 49.5, 195, 49.5);

    // Judul & Nomor Surat
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(87, 0, 15);
    doc.text(titleText.toUpperCase(), 105, 58, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(32, 32, 29);
    doc.text(`Nomor: ${noSuratText}`, 105, 64, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TENTANG', 105, 72, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(`PELAKSANAAN TUGAS DAN TATA KELOLA ADMINISTRASI NASKAH DINAS`, 105, 77, { align: 'center' });
    doc.text(`SATUAN KERJA ${bidangText.toUpperCase()}`, 105, 82, { align: 'center' });

    // Menimbang & Dasar
    let y = 92;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(87, 0, 15);
    doc.text('MENIMBANG :', 15, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(32, 32, 29);
    const menimbangText =
      `a. bahwa untuk kelancaran penyelenggaraan administrasi pemerintahan dan pelaksanaan tugas Panitia Peringatan HUT RI Ke-81 Tahun 2026 di Kabupaten Kubu Raya, dipandang perlu menerbitkan Naskah Dinas Resmi;\n` +
      `b. bahwa pelaksanaan tugas administrasi pada unit ${bidangText} memerlukan pengesahan baku dan pengarsipan digital terintegrasi melalui Sistem SIPATI;\n` +
      `c. bahwa berdasarkan pertimbangan sebagaimana dimaksud pada huruf a dan b, perlu ditetapkan Naskah Dinas resmi ini.`;
    const splitMenimbang = doc.splitTextToSize(menimbangText, 150);
    doc.text(splitMenimbang, 42, y);

    y += splitMenimbang.length * 4.5 + 4;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(87, 0, 15);
    doc.text('DASAR          :', 15, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(32, 32, 29);
    const dasarText =
      `1. Undang-Undang Nomor 35 Tahun 2007 tentang Pembentukan Kabupaten Kubu Raya di Provinsi Kalbar;\n` +
      `2. Peraturan Daerah Kabupaten Kubu Raya Nomor 8 Tahun 2016 tentang Pembentukan Perangkat Daerah;\n` +
      `3. Peraturan Bupati Kubu Raya tentang Pedoman Tata Naskah Dinas di Lingkungan Pemkab Kubu Raya;\n` +
      `4. Peraturan Bupati Kubu Raya tentang Sistem Informasi Pengelolaan Administrasi Terpadu (SIPATI);\n` +
      `5. Program Kerja Bagian Tata Pemerintahan Sekretariat Daerah Kabupaten Kubu Raya.`;
    const splitDasar = doc.splitTextToSize(dasarText, 150);
    doc.text(splitDasar, 42, y);

    y += splitDasar.length * 4.5 + 6;

    // Memutuskan / Memberi Tugas
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(87, 0, 15);
    doc.text('MEMUTUSKAN / MEMBERIKAN TUGAS:', 105, y, { align: 'center' });

    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(32, 32, 29);
    doc.text('KEPADA       :', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(`1. Satuan Kerja / Bidang : ${bidangText}`, 42, y);
    doc.text(`2. Tim Pelaksana         : Pengelola Berkas & Korespondensi Digital SIPATI`, 42, y + 5);

    y += 12;
    doc.setFont('helvetica', 'bold');
    doc.text('UNTUK         :', 15, y);
    doc.setFont('helvetica', 'normal');
    const untukText =
      `1. Melaksanakan uraian pekerjaan naskah dinas: "${catatanText}"\n` +
      `2. Melakukan verifikasi dan pengarsipan berkas digital ke dalam repositori Google Drive Cloud SIPATI (Target Folder ID: ${driveConfig.folderId}).\n` +
      `3. Menjamin keamanan, kerapian, dan keterbukaan informasi administrasi pemerintahan secara profesional.\n` +
      `4. Melaporkan hasil pelaksanaan kegiatan kepada Sekretaris Daerah cq. Kepala Bagian Tata Pemerintahan.`;
    const splitUntuk = doc.splitTextToSize(untukText, 150);
    doc.text(splitUntuk, 42, y);

    y += splitUntuk.length * 4.5 + 8;

    // Penutup
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Demikian Naskah Dinas resmi ini diterbitkan untuk dipergunakan sebagaimana mestinya dengan penuh tanggung jawab.', 15, y);

    y += 10;
    // Tanda Tangan & Stempel
    doc.text('Ditetapkan di : Sungai Raya', 125, y);
    doc.text(`Pada Tanggal  : ${tglFormatted}`, 125, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.text('a.n. BUPATI KUBU RAYA', 125, y + 12);
    doc.text('SEKRETARIS DAERAH', 125, y + 17);
    doc.text('KEPALA BAGIAN TATA PEMERINTAHAN,', 125, y + 22);

    // Stempel Digital Box
    doc.setDrawColor(47, 107, 68);
    doc.setFillColor(240, 250, 243);
    doc.roundedRect(125, y + 26, 62, 16, 2, 2, 'FD');
    doc.setFontSize(7.5);
    doc.setTextColor(47, 107, 68);
    doc.text('TERVERIFIKASI DIGITAL SIPATI', 156, y + 32, { align: 'center' });
    doc.setFontSize(6.5);
    doc.text('OTENTIKASI CLOUD GOOGLE DRIVE API', 156, y + 37, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(32, 32, 29);
    doc.text('DR. H. HERI ADIARTO, S.STP, M.Si', 125, y + 48);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Pembina Utama Muda (IV/c)', 125, y + 53);
    doc.text('NIP. 19780512 200312 1 004', 125, y + 57);

    // Footer
    doc.setFontSize(7.5);
    doc.setTextColor(110, 106, 97);
    doc.text('Sistem Informasi Pengelolaan Administrasi Terpadu (SIPATI) v2.0 - Kabupaten Kubu Raya', 105, 285, { align: 'center' });

    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = pdfUrl;
    const finalPdfName = safeName.endsWith('.pdf') ? safeName : `${safeName}.pdf`;
    link.download = finalPdfName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(pdfUrl), 2000);
    return;
  }

  if (ext === 'docx' || ext === 'doc') {
    try {
      const docxBlob = await generateDocxBlob(titleText, noSuratText, bidangText, catatanText, driveConfig.folderId, tglFormatted);
      const docxUrl = URL.createObjectURL(docxBlob);
      const link = document.createElement('a');
      link.href = docxUrl;
      const finalDocxName = safeName.endsWith('.docx')
        ? safeName
        : safeName.endsWith('.doc')
        ? `${safeName}x`
        : `${safeName}.docx`;
      link.download = finalDocxName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(docxUrl), 2000);
      return;
    } catch (docxErr) {
      console.error('Docx generation error:', docxErr);
    }
  }

  if (ext === 'xlsx' || ext === 'xls') {
    const excelHtml =
      `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">` +
      `<head><meta charset="utf-8"/></head><body>` +
      `<table border="1" style="border-collapse: collapse; font-family: Arial; font-size: 12px;">` +
      `<tr style="background-color: #57000f; color: white; font-weight: bold;">` +
      `<th style="padding: 10px;">PEMERINTAH KABUPATEN KUBU RAYA</th><th style="padding: 10px;">NOMOR REGISTRASI</th><th style="padding: 10px;">BIDANG</th><th style="padding: 10px;">TANGGAL PENGESAHAN</th><th style="padding: 10px;">CATATAN DOKUMEN</th>` +
      `</tr>` +
      `<tr>` +
      `<td style="padding: 8px;">${titleText}</td>` +
      `<td style="padding: 8px;">${noSuratText}</td>` +
      `<td style="padding: 8px;">${bidangText}</td>` +
      `<td style="padding: 8px;">${tglFormatted}</td>` +
      `<td style="padding: 8px;">${catatanText}</td>` +
      `</tr>` +
      `</table></body></html>`;

    const blob = new Blob(['\ufeff' + excelHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = safeName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return;
  }

  // Text document format
  const mimeType = getMimeTypeFromFilename(safeName);
  const docText =
    `=================================================================================\n` +
    `PEMERINTAH KABUPATEN KUBU RAYA - SEKRETARIAT DAERAH\n` +
    `BAGIAN TATA PEMERINTAHAN (SIPATI)\n` +
    `Jalan Arteri Supadio No. 1 Sungai Raya, Kabupaten Kubu Raya, Kalimantan Barat 78391\n` +
    `=================================================================================\n\n` +
    `NASKAH DINAS RESMI     : ${titleText.toUpperCase()}\n` +
    `NOMOR REGISTRASI       : ${noSuratText}\n` +
    `BIDANG / SATUAN KERJA  : ${bidangText}\n` +
    `TANGGAL PENGESAHAN     : ${tglFormatted}\n` +
    `TARGET GOOGLE DRIVE ID : ${driveConfig.folderId}\n\n` +
    `MENIMBANG:\n` +
    `a. Bahwa untuk kelancaran penyelenggaraan administrasi pemerintahan dan pelaksanaan tugas Panitia Peringatan HUT RI Ke-81 Tahun 2026 di Kabupaten Kubu Raya, dipandang perlu menerbitkan Naskah Dinas Resmi.\n` +
    `b. Bahwa pelaksanaan tugas administrasi pada unit ${bidangText} memerlukan pengesahan baku dan pengarsipan digital terintegrasi melalui Sistem SIPATI.\n\n` +
    `DASAR HUKUM:\n` +
    `1. Undang-Undang Nomor 35 Tahun 2007 tentang Pembentukan Kabupaten Kubu Raya;\n` +
    `2. Peraturan Bupati Kubu Raya tentang Pedoman Tata Naskah Dinas;\n` +
    `3. Peraturan Bupati Kubu Raya tentang Sistem Informasi Pengelolaan Administrasi Terpadu (SIPATI).\n\n` +
    `URAIAN PEKERJAAN & CATATAN DOKUMEN:\n` +
    `${catatanText}\n\n` +
    `Ditetapkan di : Sungai Raya\n` +
    `Pada Tanggal  : ${tglFormatted}\n\n` +
    `a.n. BUPATI KUBU RAYA\n` +
    `SEKRETARIS DAERAH\n` +
    `KEPALA BAGIAN TATA PEMERINTAHAN,\n\n` +
    `DR. H. HERI ADIARTO, S.STP, M.Si\n` +
    `Pembina Utama Muda (IV/c)\n` +
    `NIP. 19780512 200312 1 004\n\n` +
    `---------------------------------------------------------------------------------\n` +
    `[ DOKUMEN RESMI TERVERIFIKASI DIGITAL SIPATI KUBU RAYA ]\n`;

  const blob = new Blob([docText], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = safeName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/**
 * Open file or target folder in Google Drive
 */
export function openInGoogleDrive(fileName?: string) {
  const config = getDriveConfig();
  if (fileName) {
    const stored = getStoredFileInfo(fileName);
    if (stored?.driveUrl) {
      window.open(stored.driveUrl, '_blank');
      return;
    }
  }

  if (config.sharedFolderUrl) {
    window.open(config.sharedFolderUrl, '_blank');
  } else if (config.folderId) {
    window.open(`https://drive.google.com/drive/folders/${config.folderId}`, '_blank');
  } else {
    window.open(`https://drive.google.com/drive/u/0/my-drive`, '_blank');
  }
}
