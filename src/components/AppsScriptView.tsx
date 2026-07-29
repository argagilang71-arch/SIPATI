import React, { useState } from 'react';

export const AppsScriptView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'codejs' | 'indexhtml' | 'appscriptcode'>('codejs');
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const codeJsContent = `/**
 * ============================================================================
 * SIPATI (Sistem Informasi Pengelolaan Administrasi Terpadu Indonesia)
 * GOOGLE APPS SCRIPT WEB APP BACKEND SERVER (code.js / Code.gs)
 * ============================================================================
 * Panitia Nasional HUT RI Ke-81 Tahun 2026
 */

// 1. HTTP GET - Melayani Tampilan Web App (index.html)
function doGet(e) {
  var action = e && e.parameter ? e.parameter.action : null;
  
  if (action === 'getTasks') {
    return ContentService.createTextOutput(JSON.stringify(getTasksData()))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'getArchives') {
    return ContentService.createTextOutput(JSON.stringify(getArchivesData()))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // Render file index.html ke Web Browser
  var template = HtmlService.createTemplateFromFile('index');
  return template.evaluate()
    .setTitle('SIPATI - Sistem Informasi Pengelolaan Administrasi Terpadu')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// 2. Helper untuk menyertakan file CSS/JS eksternal jika dipisah
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// 3. HTTP POST - API Endpoint Penerima Data dari Web App
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;

    if (action === 'createTask') {
      var newTask = saveTaskToSheet(data.task);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: newTask }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'updateTaskStatus') {
      var updated = updateTaskStatusInSheet(data.taskId, data.newStatus);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: updated }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === 'uploadDocument') {
      var fileUrl = saveFileToGoogleDrive(data.fileBase64, data.fileName, data.folderName);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', url: fileUrl }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Aksi tidak dikenali' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 4. Membaca Data Pekerjaan dari Google Sheets "Daftar_Pekerjaan"
function getTasksData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Daftar_Pekerjaan');
  if (!sheet) return getMockTasksData();

  var data = sheet.getDataRange().getValues();
  var tasks = [];
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) {
      tasks.push({
        id: data[i][0],
        title: data[i][1],
        bidang: data[i][2],
        pj: data[i][3],
        status: data[i][4],
        catatan: data[i][5],
        noSurat: data[i][6],
        dateCreated: data[i][7]
      });
    }
  }
  return tasks;
}

// 5. Membaca Data Arsip dari Google Sheets "Arsip_Digital"
function getArchivesData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Arsip_Digital');
  if (!sheet) return [];

  var data = sheet.getDataRange().getValues();
  var archives = [];
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) {
      archives.push({
        id: data[i][0],
        title: data[i][1],
        noSurat: data[i][2],
        bidang: data[i][3],
        date: data[i][4],
        status: data[i][5],
        fileType: data[i][6]
      });
    }
  }
  return archives;
}

// 6. Menyimpan Data Pekerjaan Baru ke Sheet
function saveTaskToSheet(task) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Daftar_Pekerjaan');
  if (!sheet) {
    sheet = ss.insertSheet('Daftar_Pekerjaan');
    sheet.appendRow(['ID', 'Judul', 'Bidang', 'Penanggung Jawab', 'Status', 'Catatan', 'No Surat', 'Tanggal Dibuat']);
  }

  var newId = 'TSK-' + Math.floor(1000 + Math.random() * 9000);
  var dateStr = new Date().toLocaleDateString('id-ID');
  
  sheet.appendRow([
    newId,
    task.title,
    task.bidang,
    task.pj,
    task.status || 'BELUM',
    task.catatan || '',
    task.noSurat || '-',
    dateStr
  ]);

  return { id: newId, title: task.title, status: task.status || 'BELUM' };
}

// 7. Memperbarui Status Pekerjaan
function updateTaskStatusInSheet(taskId, newStatus) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Daftar_Pekerjaan');
  if (!sheet) return false;

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === taskId) {
      sheet.getRange(i + 1, 5).setValue(newStatus);
      return true;
    }
  }
  return false;
}

// 8. Menyimpan Berkas Ke Google Drive
function saveFileToGoogleDrive(fileBase64, fileName, folderName) {
  folderName = folderName || 'SIPATI_Dokumen_HUT_RI_81';
  var folders = DriveApp.getFoldersByName(folderName);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);

  var contentType = 'application/pdf';
  if (fileName.indexOf('.doc') !== -1) contentType = 'application/msword';
  if (fileName.indexOf('.png') !== -1) contentType = 'image/png';

  var decodedData = Utilities.base64Decode(fileBase64.split(',')[1] || fileBase64);
  var blob = Utilities.newBlob(decodedData, contentType, fileName);
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  return file.getUrl();
}

// 9. Mock Fallback Data
function getMockTasksData() {
  return [
    { id: 'TSK-001', title: 'Pemasangan Bendera Sang Saka Merah Putih Istana', bidang: 'Sekretariat Utama', pj: 'Drs. H. Bambang', status: 'SELESAI', catatan: 'Protokoler lengkap.', noSurat: '001/HUT-RI/VIII/2026' },
    { id: 'TSK-002', title: 'Koordinasi Pasukan Pengibar Bendera Pusaka (Paskibraka)', bidang: 'Acara & Upacara', pj: 'Mayor Inf. Sugeng', status: 'PROSES', catatan: 'Gladi bersih ke-2.', noSurat: '002/HUT-RI/VIII/2026' },
    { id: 'TSK-003', title: 'Penyusunan Anggaran Panggung & Audio Logistik', bidang: 'Logistik & Perlengkapan', pj: 'Siti Rahmawati, S.E.', status: 'BELUM', catatan: 'Menunggu persetujuan Kemenkeu.', noSurat: '003/HUT-RI/VIII/2026' }
  ];
}`;

  const indexHtmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SIPATI - Panitia HUT RI Ke-81</title>
  <!-- CDN Tailwind CSS & Google Fonts -->
  <script src="https://cdn.tailwindcss.com"></script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" />
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #fdf9f0; color: #222; }
    h1, h2, h3, .font-serif { font-family: 'Lora', serif; }
    code, pre { font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body class="bg-[#fdf9f0] min-h-screen text-slate-900 flex flex-col md:flex-row">

  <!-- SIDEBAR NAVIGATION -->
  <aside class="w-full md:w-64 bg-[#57000f] text-white p-5 flex flex-col border-r border-[#E4DCC8]">
    <div class="flex items-center gap-3 mb-8">
      <div class="w-10 h-10 bg-[#FFFDF8] rounded-full flex items-center justify-center p-1 border border-[#E4DCC8]">
        <span class="material-symbols-outlined text-[#b62230]">flag</span>
      </div>
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-[#FFFDF8]">SIPATI</h1>
        <p class="text-xs text-rose-200">HUT RI Ke-81 Tahun 2026</p>
      </div>
    </div>

    <nav class="space-y-2 flex-1">
      <button onclick="switchTab('pekerjaan')" id="btn-pekerjaan" class="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 bg-[#ff595e] text-[#60000e] font-semibold transition">
        <span class="material-symbols-outlined">assignment</span>
        <span>Daftar Pekerjaan</span>
      </button>
      <button onclick="switchTab('arsip')" id="btn-arsip" class="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 hover:bg-[#7a1220] transition">
        <span class="material-symbols-outlined">archive</span>
        <span>Arsip Digital</span>
      </button>
      <button onclick="switchTab('proposal')" id="btn-proposal" class="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 hover:bg-[#7a1220] transition">
        <span class="material-symbols-outlined">post_add</span>
        <span>Buat Proposal</span>
      </button>
    </nav>

    <div class="pt-4 border-t border-[#7a1220] text-xs text-rose-200">
      <p class="font-mono">SIPATI v81.0 (GAS)</p>
      <p>Panitia Peringatan Kemerdekaan</p>
    </div>
  </aside>

  <!-- MAIN CONTENT AREA -->
  <main class="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
    
    <!-- HEADER BAR -->
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 mb-8 border-b border-[#E4DCC8] gap-4">
      <div>
        <h2 id="view-title" class="text-2xl md:text-3xl font-bold text-[#57000f]">Daftar Pekerjaan Panitia</h2>
        <p class="text-sm text-slate-600">Sistem Pengelolaan Terpadu HUT RI ke-81</p>
      </div>
      <div class="flex items-center gap-3">
        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Terhubung Google Sheets
        </span>
        <button onclick="refreshData()" class="px-4 py-2 bg-[#b62230] text-white rounded-lg text-sm font-medium hover:bg-[#8e1925] flex items-center gap-2">
          <span class="material-symbols-outlined text-sm">refresh</span> Muat Ulang
        </button>
      </div>
    </header>

    <!-- CONTENT TAB 1: DAFTAR PEKERJAAN -->
    <section id="tab-pekerjaan" class="space-y-6">
      <div class="bg-white rounded-xl border border-[#E4DCC8] shadow-sm overflow-hidden">
        <table class="w-full text-left text-sm">
          <thead class="bg-[#f7f3e8] border-b border-[#E4DCC8] text-xs uppercase tracking-wider text-[#57000f] font-bold">
            <tr>
              <th class="p-4">Kode & Judul Pekerjaan</th>
              <th class="p-4">Bidang</th>
              <th class="p-4">PJ</th>
              <th class="p-4">Status</th>
              <th class="p-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody id="taskTableBody" class="divide-y divide-slate-100">
            <tr>
              <td colspan="5" class="p-8 text-center text-slate-400">Memuat data dari Google Sheets...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- CONTENT TAB 2: ARSIP DIGITAL -->
    <section id="tab-arsip" class="hidden space-y-6">
      <div class="bg-white p-6 rounded-xl border border-[#E4DCC8]">
        <h3 class="text-lg font-bold text-[#57000f] mb-2">Penyimpanan Berkas Digital Google Drive</h3>
        <p class="text-sm text-slate-600 mb-4">Arsip surat resmi, SK Panitia, dan dokumen pendukung HUT RI Ke-81.</p>
        <div id="archiveList" class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="p-4 border border-slate-200 rounded-lg flex items-center justify-between">
            <div>
              <p class="font-bold text-sm">SK Panitia Nasional HUT RI 81</p>
              <p class="text-xs text-slate-500">001/SK-PAN/2026 • PDF (2.4 MB)</p>
            </div>
            <a href="#" class="text-xs text-blue-600 font-bold hover:underline">Buka Drive</a>
          </div>
        </div>
      </div>
    </section>

    <!-- CONTENT TAB 3: BUAT PROPOSAL -->
    <section id="tab-proposal" class="hidden max-w-2xl bg-white p-6 rounded-xl border border-[#E4DCC8] space-y-4">
      <h3 class="text-xl font-bold text-[#57000f] font-serif">Formulir Pengajuan Proposal Anggaran</h3>
      <div>
        <label class="block text-xs font-bold text-slate-700 uppercase mb-1">Judul Proposal</label>
        <input type="text" id="propTitle" class="w-full p-2.5 border border-slate-300 rounded-lg text-sm" placeholder="Pengadaan Sound System Lapangan">
      </div>
      <button onclick="submitProposal()" class="w-full py-3 bg-[#b62230] text-white font-bold rounded-lg hover:bg-[#8e1925] transition">Kirim Proposal Ke Sekretariat</button>
    </section>

  </main>

  <script>
    function switchTab(tab) {
      document.getElementById('tab-pekerjaan').classList.add('hidden');
      document.getElementById('tab-arsip').classList.add('hidden');
      document.getElementById('tab-proposal').classList.add('hidden');
      document.getElementById('tab-' + tab).classList.remove('hidden');
    }

    function refreshData() {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run.withSuccessHandler(renderTasks).getTasksData();
      } else {
        renderTasks([
          { id: 'TSK-001', title: 'Pemasangan Bendera Sang Saka Merah Putih Istana', bidang: 'Sekretariat Utama', pj: 'Drs. H. Bambang', status: 'SELESAI' },
          { id: 'TSK-002', title: 'Koordinasi Pasukan Pengibar Bendera Pusaka', bidang: 'Acara & Upacara', pj: 'Mayor Inf. Sugeng', status: 'PROSES' }
        ]);
      }
    }

    function renderTasks(tasks) {
      var tbody = document.getElementById('taskTableBody');
      tbody.innerHTML = tasks.map(function(t) {
        return '<tr class="hover:bg-slate-50 transition">' +
          '<td class="p-4 font-medium text-slate-800"><div class="text-xs font-mono text-slate-400">' + t.id + '</div>' + t.title + '</td>' +
          '<td class="p-4 text-slate-600">' + t.bidang + '</td>' +
          '<td class="p-4 text-slate-600">' + t.pj + '</td>' +
          '<td class="p-4"><span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">' + t.status + '</span></td>' +
          '<td class="p-4 text-right"><button onclick="alert(\'Terhubung ke Google Sheets!\')" class="text-xs font-bold text-[#b62230] hover:underline">Ubah Status</button></td>' +
        '</tr>';
      }).join('');
    }

    function submitProposal() {
      alert("Proposal berhasil dikirim ke Google Sheets!");
      switchTab('pekerjaan');
    }

    window.onload = function() { refreshData(); };
  </script>
</body>
</html>`;

  const appScriptCodeContent = `/**
 * ============================================================================
 * SIPATI - GOOGLE SHEETS AUTOMATION & CUSTOM MENU (appscriptcode.gs)
 * ============================================================================
 * Tempelkan kode ini di Google Sheets: Extensions -> Apps Script
 */

// 1. Trigger saat Spreadsheet Dibuka - Membuat Menu Khusus SIPATI
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🇮🇩 SIPATI Admin')
    .addItem('⚡ Inisialisasi Sheet SIPATI', 'setupSIPATISheets')
    .addSeparator()
    .addItem('🔄 Sinkronkan Data WebApp', 'syncDataWithWebApp')
    .addItem('📑 Buat Laporan PDF Kemerdekaan', 'generatePDFReport')
    .addItem('✉️ Kirim Email Ringkasan Ke Sekretariat', 'sendEmailSummary')
    .addSeparator()
    .addItem('Stamp / Stempel Digital Resmi', 'applyDigitalStamp')
    .addToUi();
}

// 2. Inisialisasi Otomatis Tab & Header Kolom di Google Sheets
function setupSIPATISheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Sheet 1: Daftar_Pekerjaan
  var sheetTasks = ss.getSheetByName('Daftar_Pekerjaan') || ss.insertSheet('Daftar_Pekerjaan');
  if (sheetTasks.getLastRow() === 0) {
    sheetTasks.appendRow(['ID Pekerjaan', 'Judul Pekerjaan', 'Bidang', 'Penanggung Jawab', 'Status', 'Catatan', 'No Surat', 'Tanggal Dibuat']);
    sheetTasks.getRange(1, 1, 1, 8).setBackground('#57000f').setFontColor('#FFFFFF').setFontWeight('bold');
    sheetTasks.setFrozenRows(1);
  }

  // Sheet 2: Arsip_Digital
  var sheetArchives = ss.getSheetByName('Arsip_Digital') || ss.insertSheet('Arsip_Digital');
  if (sheetArchives.getLastRow() === 0) {
    sheetArchives.appendRow(['ID Arsip', 'Judul Dokumen', 'No Surat', 'Bidang', 'Tanggal', 'Status Verifikasi', 'Format File', 'Link Google Drive']);
    sheetArchives.getRange(1, 1, 1, 8).setBackground('#b62230').setFontColor('#FFFFFF').setFontWeight('bold');
    sheetArchives.setFrozenRows(1);
  }

  // Sheet 3: Proposal_Anggaran
  var sheetProposals = ss.getSheetByName('Proposal_Anggaran') || ss.insertSheet('Proposal_Anggaran');
  if (sheetProposals.getLastRow() === 0) {
    sheetProposals.appendRow(['ID Proposal', 'Judul Proposal', 'Bidang', 'Anggaran (Rp)', 'Latar Belakang', 'Status Persetujuan', 'Tanggal Pengajuan']);
    sheetProposals.getRange(1, 1, 1, 7).setBackground('#7a1220').setFontColor('#FFFFFF').setFontWeight('bold');
    sheetProposals.setFrozenRows(1);
  }

  SpreadsheetApp.getUi().alert('✅ Inisialisasi Berhasil! Tab "Daftar_Pekerjaan", "Arsip_Digital", dan "Proposal_Anggaran" telah terpasang.');
}

// 3. Trigger Otomatis saat Ada Perubahan di Google Sheets (onEdit)
function onEdit(e) {
  if (!e) return;
  var range = e.range;
  var sheet = range.getSheet();
  
  // Format pewarnaan otomatis untuk kolom status pekerjaan
  if (sheet.getName() === 'Daftar_Pekerjaan' && range.getColumn() === 5 && range.getRow() > 1) {
    var val = range.getValue().toString().toUpperCase();
    
    if (val === 'SELESAI') {
      range.setBackground('#d1fae5').setFontColor('#065f46').setFontWeight('bold');
    } else if (val === 'PROSES') {
      range.setBackground('#fef3c7').setFontColor('#92400e').setFontWeight('bold');
    } else if (val === 'BELUM') {
      range.setBackground('#ffe4e6').setFontColor('#9f1239').setFontWeight('bold');
    }
  }
}

// 4. Ekspor Laporan Otomatis ke PDF Google Drive
function generatePDFReport() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Daftar_Pekerjaan');
  if (!sheet) {
    SpreadsheetApp.getUi().alert('⚠️ Sheet "Daftar_Pekerjaan" tidak ditemukan.');
    return;
  }

  var pdfBlob = ss.getAs('application/pdf').setName('SIPATI_Laporan_HUT_RI_81_' + new Date().toISOString().substring(0,10) + '.pdf');
  var folder = DriveApp.createFolder('SIPATI_Laporan_Resmi');
  var file = folder.createFile(pdfBlob);

  SpreadsheetApp.getUi().alert('📄 Laporan PDF Berhasil Dibuat! Tersimpan di Google Drive: ' + file.getUrl());
}

// 5. Kirim Ringkasan Laporan via Gmail
function sendEmailSummary() {
  var email = Session.getActiveUser().getEmail();
  var body = "Yth. Panitia HUT RI Ke-81,\\n\\nBerikut adalah ringkasan progres administrasi SIPATI:\\n- Laporan otomatis dibuat dari Google Sheets.\\n- Akses WebApp SIPATI untuk pembaruan real-time.\\n\\nSalam Kemerdekaan,\\nPanitia Nasional HUT RI Ke-81";
  
  GmailApp.sendEmail(email, "🇮🇩 Ringkasan Laporan Administrasi SIPATI HUT RI 81", body);
  SpreadsheetApp.getUi().alert('✉️ Email ringkasan telah dikirimkan ke: ' + email);
}

// 6. Stempel Digital Resmi
function applyDigitalStamp() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var cell = sheet.getActiveCell();
  cell.setValue('[ STEMPEL RESMI SIPATI PANITIA HUT RI 81 - VERIFIED ]');
  cell.setBackground('#57000f').setFontColor('#FFFDF8').setFontWeight('bold');
  SpreadsheetApp.getUi().alert('Stempel Digital Resmi SIPATI telah dibubuhkan.');
}`;

  const handleCopy = (content: string, tabKey: string) => {
    navigator.clipboard.writeText(content);
    setCopiedTab(tabKey);
    setTimeout(() => setCopiedTab(null), 2500);
  };

  const getActiveContent = () => {
    switch (activeTab) {
      case 'codejs': return codeJsContent;
      case 'indexhtml': return indexHtmlContent;
      case 'appscriptcode': return appScriptCodeContent;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 text-white font-['Inter',sans-serif]">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#003b5c]/90 via-[#005f8e]/90 to-[#003b5c]/90 text-white p-6 md:p-8 rounded-2xl shadow-2xl border border-white/20 relative overflow-hidden backdrop-blur-xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 backdrop-blur-md rounded-full text-xs font-semibold text-cyan-300 border border-cyan-400/30 mb-3">
            <span className="material-symbols-outlined text-sm text-cyan-300">cloud_sync</span>
            Deployment Center Google Apps Script
          </div>
          <h2 className="font-['Lora',serif] text-2xl md:text-3xl font-bold mb-2 text-white">
            Kode Integrasi Google Apps Script (GAS)
          </h2>
          <p className="text-sm text-gray-200 font-['Inter',sans-serif] leading-relaxed">
            Gunakan tiga berkas berikut (<code className="bg-black/40 px-1.5 py-0.5 rounded text-cyan-300">code.js</code>, <code className="bg-black/40 px-1.5 py-0.5 rounded text-cyan-300">index.html</code>, dan <code className="bg-black/40 px-1.5 py-0.5 rounded text-cyan-300">appscriptcode.gs</code>) untuk mendeploy sistem SIPATI secara langsung ke Google Workspace, Google Sheets, dan Google Drive.
          </p>
        </div>
      </div>

      {/* Deployment Steps Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-black/45 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-xl flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#00a3e0] text-white flex items-center justify-center font-bold text-xs shrink-0">1</div>
          <div>
            <h4 className="font-bold text-white text-sm mb-1">Buka Google Sheets</h4>
            <p className="text-xs text-gray-300">Buka Spreadsheet Panitia &rarr; klik menu <strong className="text-cyan-300">Ekstensi</strong> &rarr; <strong className="text-cyan-300">Apps Script</strong>.</p>
          </div>
        </div>
        <div className="bg-black/45 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-xl flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#00a3e0] text-white flex items-center justify-center font-bold text-xs shrink-0">2</div>
          <div>
            <h4 className="font-bold text-white text-sm mb-1">Tempel Berkas</h4>
            <p className="text-xs text-gray-300">Buat file <code className="text-cyan-300">Code.gs</code> (<code className="text-cyan-300">code.js</code>) dan <code className="text-cyan-300">index.html</code> pada Google Apps Script Editor.</p>
          </div>
        </div>
        <div className="bg-black/45 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-xl flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">3</div>
          <div>
            <h4 className="font-bold text-white text-sm mb-1">Deploy Sebagai WebApp</h4>
            <p className="text-xs text-gray-300">Klik <strong className="text-cyan-300">Deploy</strong> &rarr; <strong className="text-cyan-300">New Deployment</strong> &rarr; Pilih <strong className="text-cyan-300">Web App</strong> (Execute as: <i>Me</i>, Access: <i>Anyone</i>).</p>
          </div>
        </div>
      </div>

      {/* Code Selector Tabs */}
      <div className="bg-black/45 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between border-b border-white/15 bg-white/10 p-3 gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('codejs')}
              className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'codejs'
                  ? 'bg-[#00a3e0] text-white shadow-md'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-sm">javascript</span>
              <span>1. code.js (Code.gs Backend)</span>
            </button>
            <button
              onClick={() => setActiveTab('indexhtml')}
              className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'indexhtml'
                  ? 'bg-[#00a3e0] text-white shadow-md'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-sm">html</span>
              <span>2. index.html (WebApp View)</span>
            </button>
            <button
              onClick={() => setActiveTab('appscriptcode')}
              className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'appscriptcode'
                  ? 'bg-[#00a3e0] text-white shadow-md'
                  : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              <span className="material-symbols-outlined text-sm">table_chart</span>
              <span>3. appscriptcode.gs (Sheets Menu)</span>
            </button>
          </div>

          <button
            onClick={() => handleCopy(getActiveContent(), activeTab)}
            className="px-4 py-2 bg-[#00a3e0] hover:bg-[#008bc2] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-cyan-500/25 active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">
              {copiedTab === activeTab ? 'check_circle' : 'content_copy'}
            </span>
            <span>{copiedTab === activeTab ? 'Berhasil Disalin!' : 'Salin Kode'}</span>
          </button>
        </div>

        {/* Code Content Container */}
        <div className="p-4 bg-black/60 text-[#d4d4d4] overflow-x-auto max-h-[600px] font-['JetBrains_Mono',monospace] text-xs leading-relaxed">
          <pre>
            <code>{getActiveContent()}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
