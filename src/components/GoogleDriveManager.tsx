import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  initDriveAuth,
  googleSignInForDrive,
  googleSignOut,
  listGoogleDriveFiles,
  uploadFileToGoogleDrive,
  deleteGoogleDriveFile,
  DriveFileItem,
} from '../utils/googleDriveService';
import { getDriveConfig, saveDriveConfig, syncAllPendingFilesToDrive, registerUploadedFile } from '../utils/fileStorage';

interface GoogleDriveManagerProps {
  onNotify?: (msg: string) => void;
  compact?: boolean;
}

export const GoogleDriveManager: React.FC<GoogleDriveManagerProps> = ({
  onNotify,
  compact = false,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Drive state
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [driveConfig, setDriveConfig] = useState(getDriveConfig());
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);

  // Listen to Auth State
  useEffect(() => {
    setIsLoadingAuth(true);
    const unsubscribe = initDriveAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setAccessToken(token);
        setIsLoadingAuth(false);
        fetchFiles(token);
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setIsLoadingAuth(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const fetchFiles = async (token?: string) => {
    const activeToken = token || accessToken;
    if (!activeToken) return;

    setIsLoadingFiles(true);
    try {
      const files = await listGoogleDriveFiles(activeToken, driveConfig.folderId);
      setDriveFiles(files);
    } catch (err: any) {
      console.error('Error listing files:', err);
      if (onNotify) onNotify(`Gagal mengambil berkas Google Drive: ${err.message}`);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const res = await googleSignInForDrive();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        // Automatically sync any pending uploaded files to user's Google Drive
        const syncedCount = await syncAllPendingFilesToDrive(res.accessToken, driveConfig.folderId);
        if (onNotify) {
          if (syncedCount > 0) {
            onNotify(`Berhasil terhubung! ${syncedCount} berkas otomatis disinkronkan ke Google Drive (${res.user.email}).`);
          } else {
            onNotify(`Berhasil terhubung ke Google Drive sebagai ${res.user.email}`);
          }
        }
        fetchFiles(res.accessToken);
      }
    } catch (err: any) {
      console.error('SignIn error:', err);
      if (onNotify) onNotify(`Gagal masuk ke Google: ${err.message || 'Terjadi kesalahan'}`);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await googleSignOut();
      setUser(null);
      setAccessToken(null);
      setDriveFiles([]);
      if (onNotify) onNotify('Berhasil terputus dari Google Drive.');
    } catch (err: any) {
      console.error('SignOut error:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    registerUploadedFile(file);

    if (!accessToken) {
      if (onNotify) onNotify(`Berkas "${file.name}" tersimpan lokal. Hubungkan ke Google Drive untuk otosinkronisasi cloud.`);
      return;
    }

    setUploading(true);
    try {
      const uploaded = await uploadFileToGoogleDrive(accessToken, file, driveConfig.folderId);
      if (onNotify) onNotify(`Berkas "${file.name}" berhasil diunggah ke Google Drive!`);
      fetchFiles();
    } catch (err: any) {
      console.error('Upload error:', err);
      if (onNotify) onNotify(`Gagal mengunggah berkas: ${err.message}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const confirmDeleteFile = async () => {
    if (!fileToDelete || !accessToken) return;

    try {
      await deleteGoogleDriveFile(accessToken, fileToDelete.id);
      if (onNotify) onNotify(`Berkas "${fileToDelete.name}" berhasil dihapus dari Google Drive.`);
      setFileToDelete(null);
      fetchFiles();
    } catch (err: any) {
      console.error('Delete error:', err);
      if (onNotify) onNotify(`Gagal menghapus berkas: ${err.message}`);
    }
  };

  if (compact) {
    return (
      <div className="bg-black/45 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-lg text-white space-y-3 font-['Inter',sans-serif]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-cyan-300">add_to_drive</span>
            <span className="font-['Lora',serif] font-bold text-sm text-white">Integrasi Google Drive API</span>
          </div>

          {user ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {user.email}
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
              Belum Login Google
            </span>
          )}
        </div>

        {!user ? (
          <button
            type="button"
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-2 shadow-xs cursor-pointer transition active:scale-95 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            <span>{isSigningIn ? 'Menghubungkan...' : 'Hubungkan dengan Google Drive'}</span>
          </button>
        ) : (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
            <span className="text-gray-300">{driveFiles.length} Berkas Tersedia di Drive</span>
            <div className="flex items-center gap-2">
              <label className="px-2.5 py-1 bg-[#00a3e0] hover:bg-[#008bc2] text-white rounded text-[11px] font-bold cursor-pointer transition">
                <span>{uploading ? 'Mengunggah...' : '+ Unggah File'}</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-rose-400 hover:underline text-[11px] font-medium"
              >
                Putuskan
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-black/45 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-xl space-y-5 font-['Inter',sans-serif] text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h3 className="font-['Lora',serif] text-[17px] font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-cyan-300">cloud_sync</span>
            Koneksi Resmi Google Drive API &amp; Penyimpanan Cloud
          </h3>
          <p className="text-xs text-gray-300 mt-0.5">
            Otentikasi dengan akun Google Anda untuk mengakses, menyimpan, dan menyinkronkan dokumen naskah dinas SIPATI langsung ke Google Drive Anda.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Terhubung: {user.email}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <span className="material-symbols-outlined text-sm">warning</span>
              <span>Belum Terhubung</span>
            </span>
          )}
        </div>
      </div>

      {/* Auth Box / Sign In */}
      {!user ? (
        <div className="bg-[#fcf8ee] border border-[#E4DCC8] rounded-lg p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-bold text-xs text-[#57000f] uppercase tracking-wider">
              Akses Google Drive Milik Anda
            </h4>
            <p className="text-xs text-[#6E6A61]">
              Klik tombol di samping untuk masuk menggunakan akun Google dan memberikan izin akses penyimpanan berkas SIPATI.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="px-5 py-2.5 bg-white hover:bg-slate-50 border border-[#E4DCC8] rounded-lg text-xs font-bold text-[#1c1c16] flex items-center gap-2.5 shadow-xs cursor-pointer transition active:scale-95 shrink-0 disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            <span>{isSigningIn ? 'Menghubungkan...' : 'Sign in with Google Drive'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* User Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-lg">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-emerald-300" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                  {user.email?.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-xs font-bold text-emerald-950">{user.displayName || user.email}</div>
                <div className="text-[11px] text-emerald-700">Google OAuth Active • Token Valid</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="px-3 py-1.5 bg-[#57000f] hover:bg-[#b62230] text-white rounded-lg text-xs font-bold cursor-pointer transition flex items-center gap-1.5 shadow-xs">
                <span className="material-symbols-outlined text-sm">upload_file</span>
                <span>{uploading ? 'Mengunggah...' : 'Unggah File Ke Drive'}</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => fetchFiles()}
                className="p-1.5 bg-white border border-[#E4DCC8] hover:bg-slate-50 text-[#1c1c16] rounded-lg transition"
                title="Muat Ulang Berkas Drive"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                className="px-3 py-1.5 border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-lg text-xs font-semibold transition"
              >
                Putuskan Akun
              </button>
            </div>
          </div>

          {/* Drive Files List */}
          <div className="border border-[#E4DCC8] rounded-lg overflow-hidden bg-white">
            <div className="bg-[#fcf8ee] px-4 py-2.5 border-b border-[#E4DCC8] flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#57000f]">
                Daftar Dokumen di Google Drive ({driveFiles.length})
              </span>
              <span className="text-[11px] text-[#6E6A61]">
                {isLoadingFiles ? 'Memuat data drive...' : 'Disinkronkan secara Realtime'}
              </span>
            </div>

            {isLoadingFiles ? (
              <div className="p-8 text-center text-xs text-[#6E6A61] space-y-2">
                <span className="material-symbols-outlined animate-spin text-2xl text-[#b62230]">sync</span>
                <p>Mengambil berkas dari Google Drive...</p>
              </div>
            ) : driveFiles.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6E6A61] space-y-2">
                <span className="material-symbols-outlined text-3xl text-slate-300">folder_open</span>
                <p>Belum ada berkas tersimpan di Google Drive target.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#E4DCC8]/60 max-h-64 overflow-y-auto">
                {driveFiles.map((file) => (
                  <div key={file.id} className="p-3 hover:bg-[#fdfaf2] transition flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="material-symbols-outlined text-amber-700 text-lg shrink-0">
                        {file.mimeType.includes('folder') ? 'folder' : 'description'}
                      </span>
                      <div className="min-w-0">
                        <div className="font-semibold text-[#1c1c16] truncate">{file.name}</div>
                        <div className="text-[10px] text-[#6E6A61] font-mono">
                          ID: {file.id} • {file.size ? `${(parseInt(file.size) / 1024).toFixed(1)} KB` : 'Folder/File'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 rounded text-[11px] font-semibold flex items-center gap-1 transition"
                        >
                          <span className="material-symbols-outlined text-xs">open_in_new</span>
                          <span>Buka</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setFileToDelete(file)}
                        className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition"
                        title="Hapus berkas ini dari Google Drive"
                      >
                        <span className="material-symbols-outlined text-base">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Destructive Operation (Mandatory per Skill) */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-xl border border-[#E4DCC8] shadow-2xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-700">
              <span className="material-symbols-outlined text-2xl">warning</span>
              <h4 className="font-bold text-base text-[#1c1c16]">Konfirmasi Hapus File Drive</h4>
            </div>

            <p className="text-xs text-[#574141] leading-relaxed">
              Apakah Anda yakin ingin menghapus berkas <strong className="text-[#1c1c16]">{fileToDelete.name}</strong> dari akun Google Drive Anda? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                className="px-4 py-2 border border-slate-200 bg-slate-50 text-slate-700 rounded text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDeleteFile}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded text-xs font-bold cursor-pointer shadow-xs"
              >
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
