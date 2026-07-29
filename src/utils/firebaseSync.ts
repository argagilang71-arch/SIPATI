import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { TeamMember, TaskItem, ArchiveItem, TemplateItem, ProposalItem, BannerConfig, NotificationItem, ActivityLogItem } from '../types';
import { safeSetLocalStorage } from './storageUtils';
import { normalizeTeamMembers } from './userUtils';

// Initialize Firebase App safely with custom databaseId support
let dbInstance: any = null;
try {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  const dbId = (firebaseConfig as any).firestoreDatabaseId;
  dbInstance = dbId && dbId !== '(default)' ? getFirestore(app, dbId) : getFirestore(app);
} catch (e) {
  console.warn('Firebase initialization warning:', e);
}

export const db = dbInstance;

/**
 * Recursively sanitizes objects before sending to Firestore, converting `undefined` values to `null`
 * or omitting them. This prevents Firestore "Unsupported field value: undefined" runtime errors.
 */
function cleanForFirestore<T>(data: T): T {
  if (data === undefined) return null as any;
  return JSON.parse(JSON.stringify(data, (key, value) => (value === undefined ? null : value)));
}

const CONFIG_DOC_PATH = ['sipati_config', 'team_members'] as const;
const SETTINGS_DOC_PATH = ['sipati_config', 'settings'] as const;
const BANNER_DOC_PATH = ['sipati_config', 'banner'] as const;
const TASKS_DOC_PATH = ['sipati_config', 'tasks'] as const;
const ARCHIVES_DOC_PATH = ['sipati_config', 'archives'] as const;
const TEMPLATES_DOC_PATH = ['sipati_config', 'templates'] as const;
const PROPOSALS_DOC_PATH = ['sipati_config', 'proposals'] as const;
const NOTIFS_DOC_PATH = ['sipati_config', 'notifications'] as const;
const LOGS_DOC_PATH = ['sipati_config', 'activity_logs'] as const;

export const DEFAULT_BANNER_CONFIG: BannerConfig = {
  enabled: true,
  title: '📢 PENGUMUMAN RESMI & INFORMASI PANITIA',
  message: 'Selamat datang di Sistem Informasi Panitia (SIPATI). Harap seluruh Penanggung Jawab Bagian melengkapi draft dokumen & verifikasi berkas naskah dinas sebelum tenggat pelaporan.',
  type: 'info',
  linkUrl: '',
  linkText: 'Buka Panduan Penggunaan',
  imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=1200',
  images: [
    'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200',
  ],
  dismissible: true,
  updatedAt: new Date().toISOString(),
  updatedBy: 'Admin SIPATI',
};

// In-memory cache & write queue to prevent 'Write stream exhausted' errors
const lastSavedCache: Record<string, string> = {};
const pendingTimers: Record<string, any> = {};
const activeWritePromises: Record<string, Promise<any> | null> = {};
let isResourceExhausted = false;
let resourceExhaustedResetTimer: any = null;

function normalizePayloadForCompare(data: any): string {
  try {
    if (!data) return '';
    if (typeof data === 'object') {
      const copy = JSON.parse(JSON.stringify(data));
      if (copy && typeof copy === 'object') {
        delete copy.updatedAt;
        delete copy.timestamp;
      }
      return JSON.stringify(copy);
    }
    return JSON.stringify(data);
  } catch (e) {
    return String(data);
  }
}

function shouldSkipCloudSave(key: string, data: any): boolean {
  if (isResourceExhausted) {
    return true; // Gracefully fall back to local storage if Firestore stream exhausted
  }
  try {
    const stringified = normalizePayloadForCompare(data);
    if (lastSavedCache[key] === stringified) {
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

function updateCloudCache(key: string, data: any) {
  try {
    lastSavedCache[key] = normalizePayloadForCompare(data);
  } catch (e) {}
}

/**
 * Queue and debounce Firestore writes to strictly prevent 'resource-exhausted: Write stream exhausted' errors.
 */
async function scheduleDebouncedCloudWrite(
  key: string,
  writeTask: () => Promise<void>,
  delayMs: number = 300,
  dataToCacheOnSuccess?: any
): Promise<boolean> {
  if (!db || isResourceExhausted) return false;

  return new Promise((resolve) => {
    if (pendingTimers[key]) {
      clearTimeout(pendingTimers[key]);
    }

    pendingTimers[key] = setTimeout(async () => {
      delete pendingTimers[key];

      // If a write for this key is already active/in-flight, wait for it to finish first
      if (activeWritePromises[key]) {
        try {
          await activeWritePromises[key];
        } catch (e) {}
      }

      const currentPromise = (async () => {
        try {
          await writeTask();
          if (dataToCacheOnSuccess !== undefined) {
            updateCloudCache(key, dataToCacheOnSuccess);
          }
          return true;
        } catch (err: any) {
          const errMsg = err?.message || String(err);
          if (err?.code === 'resource-exhausted' || errMsg.includes('resource-exhausted') || errMsg.includes('queued writes')) {
            console.warn(`Firestore resource exhausted on key '${key}'. Pausing Firestore cloud writes temporarily.`);
            isResourceExhausted = true;
            if (resourceExhaustedResetTimer) clearTimeout(resourceExhaustedResetTimer);
            resourceExhaustedResetTimer = setTimeout(() => {
              isResourceExhausted = false;
            }, 10000); // Reset after 10s backoff
          }
          return false;
        } finally {
          activeWritePromises[key] = null;
        }
      })();

      activeWritePromises[key] = currentPromise;
      const res = await currentPromise;
      resolve(res);
    }, delayMs);
  });
}

/**
 * Saves Dashboard Banner configuration to Cloud Firestore and LocalStorage.
 */
export async function saveBannerConfigToCloud(banner: BannerConfig): Promise<boolean> {
  try {
    safeSetLocalStorage('sipati_dashboard_banner', JSON.stringify(banner));
    window.dispatchEvent(new Event('sipati_banner_updated'));
  } catch (e) {
    console.warn('LocalStorage error saving banner:', e);
  }

  if (!db) return true;
  if (shouldSkipCloudSave('banner', banner)) return true;

  return scheduleDebouncedCloudWrite('banner', async () => {
    const docRef = doc(db, BANNER_DOC_PATH[0], BANNER_DOC_PATH[1]);
    await setDoc(docRef, cleanForFirestore({
      ...banner,
      updatedAt: new Date().toISOString(),
    }));
  });
}

/**
 * Loads Dashboard Banner configuration from Cloud Firestore with fallback to LocalStorage.
 */
export async function loadBannerConfigFromCloud(): Promise<BannerConfig> {
  if (db) {
    try {
      const docRef = doc(db, BANNER_DOC_PATH[0], BANNER_DOC_PATH[1]);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const cloudBanner = snap.data() as BannerConfig;
        if (cloudBanner && typeof cloudBanner.enabled === 'boolean') {
          updateCloudCache('banner', cloudBanner);
          localStorage.setItem('sipati_dashboard_banner', JSON.stringify(cloudBanner));
          return cloudBanner;
        }
      }
    } catch (err) {
      // Offline fallback
    }
  }

  try {
    const saved = localStorage.getItem('sipati_dashboard_banner');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error parsing local banner config:', e);
  }

  return DEFAULT_BANNER_CONFIG;
}

/**
 * Subscribes to real-time Dashboard Banner changes.
 */
export function subscribeBannerConfigCloud(onUpdate: (banner: BannerConfig) => void) {
  if (!db) return () => {};
  try {
    const docRef = doc(db, BANNER_DOC_PATH[0], BANNER_DOC_PATH[1]);
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const cloudBanner = snap.data() as BannerConfig;
          if (cloudBanner && typeof cloudBanner.enabled === 'boolean') {
            updateCloudCache('banner', cloudBanner);
            localStorage.setItem('sipati_dashboard_banner', JSON.stringify(cloudBanner));
            onUpdate(cloudBanner);
          }
        }
      },
      (err) => {}
    );
  } catch (err) {
    return () => {};
  }
}

/**
 * Saves team members list both to Firebase Firestore (Global Cloud Sync) and LocalStorage.
 */
export async function saveTeamMembersToCloud(members: TeamMember[]): Promise<boolean> {
  const normalizedMembers = normalizeTeamMembers(members);
  safeSetLocalStorage('sipati_team_members', JSON.stringify(normalizedMembers));

  if (!db) return false;
  if (shouldSkipCloudSave('team_members', normalizedMembers)) return true;

  return scheduleDebouncedCloudWrite('team_members', async () => {
    const docRef = doc(db, CONFIG_DOC_PATH[0], CONFIG_DOC_PATH[1]);
    await setDoc(
      docRef,
      cleanForFirestore({
        members: normalizedMembers,
        updatedAt: new Date().toISOString(),
      })
    );
  });
}

/**
 * Loads team members list from Firebase Firestore (Cloud) with fallback to LocalStorage.
 */
export async function loadTeamMembersFromCloud(): Promise<TeamMember[]> {
  let localMembers: TeamMember[] = [];
  try {
    const saved = localStorage.getItem('sipati_team_members');
    if (saved) {
      localMembers = normalizeTeamMembers(JSON.parse(saved));
    }
  } catch (e) {
    console.error('Error parsing local team members:', e);
  }

  if (db) {
    try {
      const docRef = doc(db, CONFIG_DOC_PATH[0], CONFIG_DOC_PATH[1]);
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data()?.members) {
        const cloudMembers = snap.data().members as TeamMember[];
        if (Array.isArray(cloudMembers) && cloudMembers.length > 0) {
          updateCloudCache('team_members', cloudMembers);
          const merged = [...cloudMembers];
          localMembers.forEach((lm) => {
            const idx = merged.findIndex(
              (cm) =>
                (cm.id && lm.id && cm.id === lm.id) ||
                (cm.username && lm.username && cm.username.toLowerCase().replace(/\s+/g, '') === lm.username.toLowerCase().replace(/\s+/g, '')) ||
                (cm.nip && lm.nip && cm.nip.replace(/\s+/g, '') === lm.nip.replace(/\s+/g, ''))
            );
            if (idx >= 0) {
              merged[idx] = {
                ...merged[idx],
                ...lm,
                foto: lm.foto || lm.avatar || merged[idx].foto || merged[idx].avatar,
                avatar: lm.avatar || lm.foto || merged[idx].avatar || merged[idx].foto,
              };
            } else {
              merged.push(lm);
            }
          });
          const normalized = normalizeTeamMembers(merged);
          safeSetLocalStorage('sipati_team_members', JSON.stringify(normalized));
          return normalized;
        }
      }
    } catch (err) {
      // Offline fallback
    }
  }

  return normalizeTeamMembers(localMembers);
}

/**
 * Subscribes to real-time changes in Firebase Firestore.
 */
export function subscribeTeamMembersCloud(onUpdate: (members: TeamMember[]) => void) {
  if (!db) return () => {};

  try {
    const docRef = doc(db, CONFIG_DOC_PATH[0], CONFIG_DOC_PATH[1]);
    return onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists() && snap.data()?.members) {
          const members = snap.data().members as TeamMember[];
          if (Array.isArray(members)) {
            const normalized = normalizeTeamMembers(members);
            updateCloudCache('team_members', normalized);
            safeSetLocalStorage('sipati_team_members', JSON.stringify(normalized));
            onUpdate(normalized);
          }
        }
      },
      (err) => {}
    );
  } catch (err) {
    return () => {};
  }
}

/**
 * Saves settings to Cloud Firestore and LocalStorage
 */
export async function saveSettingsToCloud(settings: {
  namaInstansi?: string;
  namaAdmin?: string;
  nipAdmin?: string;
  emailNotif?: string;
  autoArchive?: boolean;
  logoUrl?: string;
}): Promise<boolean> {
  try {
    if (settings.namaInstansi) localStorage.setItem('sipati_nama_instansi', settings.namaInstansi);
    if (settings.namaAdmin) localStorage.setItem('sipati_nama_admin', settings.namaAdmin);
    if (settings.nipAdmin) localStorage.setItem('sipati_nip_admin', settings.nipAdmin);
    if (settings.emailNotif) localStorage.setItem('sipati_email_notif', settings.emailNotif);
    if (settings.autoArchive !== undefined)
      localStorage.setItem('sipati_auto_archive', JSON.stringify(settings.autoArchive));
    if (settings.logoUrl !== undefined) {
      if (settings.logoUrl) {
        localStorage.setItem('sipati_logo_url', settings.logoUrl);
      } else {
        localStorage.removeItem('sipati_logo_url');
      }
      window.dispatchEvent(new Event('sipati_logo_updated'));
    }
  } catch (e) {
    console.warn(e);
  }

  if (!db) return false;
  if (shouldSkipCloudSave('settings', settings)) return true;

  return scheduleDebouncedCloudWrite('settings', async () => {
    const docRef = doc(db, SETTINGS_DOC_PATH[0], SETTINGS_DOC_PATH[1]);
    await setDoc(
      docRef,
      cleanForFirestore({
        ...settings,
        updatedAt: new Date().toISOString(),
      }),
      { merge: true }
    );
  });
}

/**
 * Loads system settings from Firebase Firestore Cloud.
 */
export async function loadSettingsFromCloud() {
  if (!db) return null;
  try {
    const docRef = doc(db, SETTINGS_DOC_PATH[0], SETTINGS_DOC_PATH[1]);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      updateCloudCache('settings', data);
      if (data.namaInstansi) localStorage.setItem('sipati_nama_instansi', data.namaInstansi);
      if (data.namaAdmin) localStorage.setItem('sipati_nama_admin', data.namaAdmin);
      if (data.nipAdmin) localStorage.setItem('sipati_nip_admin', data.nipAdmin);
      if (data.emailNotif) localStorage.setItem('sipati_email_notif', data.emailNotif);
      if (data.autoArchive !== undefined)
        localStorage.setItem('sipati_auto_archive', JSON.stringify(data.autoArchive));
      if (data.logoUrl !== undefined) {
        if (data.logoUrl) localStorage.setItem('sipati_logo_url', data.logoUrl);
        else localStorage.removeItem('sipati_logo_url');
        window.dispatchEvent(new Event('sipati_logo_updated'));
      }
      return data;
    }
  } catch (err) {}
  return null;
}

/**
 * Subscribes to realtime settings updates
 */
export function subscribeSettingsCloud(onUpdate: (settings: any) => void) {
  if (!db) return () => {};
  try {
    const docRef = doc(db, SETTINGS_DOC_PATH[0], SETTINGS_DOC_PATH[1]);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        updateCloudCache('settings', data);
        if (data.namaInstansi) localStorage.setItem('sipati_nama_instansi', data.namaInstansi);
        if (data.namaAdmin) localStorage.setItem('sipati_nama_admin', data.namaAdmin);
        if (data.nipAdmin) localStorage.setItem('sipati_nip_admin', data.nipAdmin);
        if (data.emailNotif) localStorage.setItem('sipati_email_notif', data.emailNotif);
        if (data.autoArchive !== undefined)
          localStorage.setItem('sipati_auto_archive', JSON.stringify(data.autoArchive));
        if (data.logoUrl !== undefined) {
          if (data.logoUrl) localStorage.setItem('sipati_logo_url', data.logoUrl);
          else localStorage.removeItem('sipati_logo_url');
          window.dispatchEvent(new Event('sipati_logo_updated'));
        }
        onUpdate(data);
      }
    }, (err) => {});
  } catch (err) {
    return () => {};
  }
}

/**
 * Saves tasks to Cloud Firestore and LocalStorage
 */
export async function saveTasksToCloud(tasks: TaskItem[]): Promise<boolean> {
  try {
    localStorage.setItem('sipati_tasks', JSON.stringify(tasks));
  } catch (e) {
    console.warn(e);
  }

  if (!db) return false;
  if (shouldSkipCloudSave('tasks', tasks)) return true;

  return scheduleDebouncedCloudWrite('tasks', async () => {
    const docRef = doc(db, TASKS_DOC_PATH[0], TASKS_DOC_PATH[1]);
    await setDoc(docRef, cleanForFirestore({ tasks, updatedAt: new Date().toISOString() }));
  });
}

/**
 * Loads tasks from Cloud Firestore with fallback to LocalStorage
 */
export async function loadTasksFromCloud(): Promise<TaskItem[] | null> {
  if (db) {
    try {
      const docRef = doc(db, TASKS_DOC_PATH[0], TASKS_DOC_PATH[1]);
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data()?.tasks) {
        const cloudTasks = snap.data().tasks as TaskItem[];
        if (Array.isArray(cloudTasks)) {
          updateCloudCache('tasks', cloudTasks);
          localStorage.setItem('sipati_tasks', JSON.stringify(cloudTasks));
          return cloudTasks;
        }
      }
    } catch (e) {}
  }
  try {
    const saved = localStorage.getItem('sipati_tasks');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return null;
}

/**
 * Subscribes to realtime task updates
 */
export function subscribeTasksCloud(onUpdate: (tasks: TaskItem[]) => void) {
  if (!db) return () => {};
  try {
    const docRef = doc(db, TASKS_DOC_PATH[0], TASKS_DOC_PATH[1]);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists() && snap.data()?.tasks) {
        const cloudTasks = snap.data().tasks as TaskItem[];
        if (Array.isArray(cloudTasks)) {
          updateCloudCache('tasks', cloudTasks);
          localStorage.setItem('sipati_tasks', JSON.stringify(cloudTasks));
          onUpdate(cloudTasks);
        }
      }
    }, (err) => {});
  } catch (err) {
    return () => {};
  }
}

/**
 * Saves archives to Cloud Firestore and LocalStorage
 */
export async function saveArchivesToCloud(archives: ArchiveItem[]): Promise<boolean> {
  try {
    localStorage.setItem('sipati_archives', JSON.stringify(archives));
  } catch (e) {
    console.warn(e);
  }

  if (!db) return false;
  if (shouldSkipCloudSave('archives', archives)) return true;

  return scheduleDebouncedCloudWrite('archives', async () => {
    const docRef = doc(db, ARCHIVES_DOC_PATH[0], ARCHIVES_DOC_PATH[1]);
    await setDoc(docRef, cleanForFirestore({ archives, updatedAt: new Date().toISOString() }));
  });
}

/**
 * Loads archives from Cloud Firestore with fallback to LocalStorage
 */
export async function loadArchivesFromCloud(): Promise<ArchiveItem[] | null> {
  if (db) {
    try {
      const docRef = doc(db, ARCHIVES_DOC_PATH[0], ARCHIVES_DOC_PATH[1]);
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data()?.archives) {
        const cloudArchives = snap.data().archives as ArchiveItem[];
        if (Array.isArray(cloudArchives)) {
          updateCloudCache('archives', cloudArchives);
          localStorage.setItem('sipati_archives', JSON.stringify(cloudArchives));
          return cloudArchives;
        }
      }
    } catch (e) {}
  }
  try {
    const saved = localStorage.getItem('sipati_archives');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return null;
}

/**
 * Subscribes to realtime archive updates
 */
export function subscribeArchivesCloud(onUpdate: (archives: ArchiveItem[]) => void) {
  if (!db) return () => {};
  try {
    const docRef = doc(db, ARCHIVES_DOC_PATH[0], ARCHIVES_DOC_PATH[1]);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists() && snap.data()?.archives) {
        const cloudArchives = snap.data().archives as ArchiveItem[];
        if (Array.isArray(cloudArchives)) {
          updateCloudCache('archives', cloudArchives);
          localStorage.setItem('sipati_archives', JSON.stringify(cloudArchives));
          onUpdate(cloudArchives);
        }
      }
    }, (err) => {});
  } catch (err) {
    return () => {};
  }
}

/**
 * Saves templates to Cloud Firestore and LocalStorage
 */
export async function saveTemplatesToCloud(templates: TemplateItem[]): Promise<boolean> {
  try {
    localStorage.setItem('sipati_templates', JSON.stringify(templates));
  } catch (e) {
    console.warn(e);
  }

  if (!db) return false;
  if (shouldSkipCloudSave('templates', templates)) return true;

  return scheduleDebouncedCloudWrite('templates', async () => {
    const docRef = doc(db, TEMPLATES_DOC_PATH[0], TEMPLATES_DOC_PATH[1]);
    await setDoc(docRef, cleanForFirestore({ templates, updatedAt: new Date().toISOString() }));
  });
}

/**
 * Loads templates from Cloud Firestore with fallback to LocalStorage
 */
export async function loadTemplatesFromCloud(): Promise<TemplateItem[] | null> {
  if (db) {
    try {
      const docRef = doc(db, TEMPLATES_DOC_PATH[0], TEMPLATES_DOC_PATH[1]);
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data()?.templates) {
        const cloudTemplates = snap.data().templates as TemplateItem[];
        if (Array.isArray(cloudTemplates)) {
          updateCloudCache('templates', cloudTemplates);
          localStorage.setItem('sipati_templates', JSON.stringify(cloudTemplates));
          return cloudTemplates;
        }
      }
    } catch (e) {}
  }
  try {
    const saved = localStorage.getItem('sipati_templates');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return null;
}

/**
 * Subscribes to realtime template updates
 */
export function subscribeTemplatesCloud(onUpdate: (templates: TemplateItem[]) => void) {
  if (!db) return () => {};
  try {
    const docRef = doc(db, TEMPLATES_DOC_PATH[0], TEMPLATES_DOC_PATH[1]);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists() && snap.data()?.templates) {
        const cloudTemplates = snap.data().templates as TemplateItem[];
        if (Array.isArray(cloudTemplates)) {
          updateCloudCache('templates', cloudTemplates);
          localStorage.setItem('sipati_templates', JSON.stringify(cloudTemplates));
          onUpdate(cloudTemplates);
        }
      }
    }, (err) => {});
  } catch (err) {
    return () => {};
  }
}

/**
 * Saves proposals to Cloud Firestore and LocalStorage
 */
export async function saveProposalsToCloud(proposals: ProposalItem[]): Promise<boolean> {
  try {
    localStorage.setItem('sipati_proposals', JSON.stringify(proposals));
  } catch (e) {
    console.warn(e);
  }

  if (!db) return false;
  if (shouldSkipCloudSave('proposals', proposals)) return true;

  return scheduleDebouncedCloudWrite('proposals', async () => {
    const docRef = doc(db, PROPOSALS_DOC_PATH[0], PROPOSALS_DOC_PATH[1]);
    await setDoc(docRef, cleanForFirestore({ proposals, updatedAt: new Date().toISOString() }));
  });
}

/**
 * Loads proposals from Cloud Firestore with fallback to LocalStorage
 */
export async function loadProposalsFromCloud(): Promise<ProposalItem[] | null> {
  if (db) {
    try {
      const docRef = doc(db, PROPOSALS_DOC_PATH[0], PROPOSALS_DOC_PATH[1]);
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data()?.proposals) {
        const cloudProposals = snap.data().proposals as ProposalItem[];
        if (Array.isArray(cloudProposals)) {
          updateCloudCache('proposals', cloudProposals);
          localStorage.setItem('sipati_proposals', JSON.stringify(cloudProposals));
          return cloudProposals;
        }
      }
    } catch (e) {}
  }
  try {
    const saved = localStorage.getItem('sipati_proposals');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return null;
}

/**
 * Subscribes to realtime proposal updates
 */
export function subscribeProposalsCloud(onUpdate: (proposals: ProposalItem[]) => void) {
  if (!db) return () => {};
  try {
    const docRef = doc(db, PROPOSALS_DOC_PATH[0], PROPOSALS_DOC_PATH[1]);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists() && snap.data()?.proposals) {
        const cloudProposals = snap.data().proposals as ProposalItem[];
        if (Array.isArray(cloudProposals)) {
          updateCloudCache('proposals', cloudProposals);
          localStorage.setItem('sipati_proposals', JSON.stringify(cloudProposals));
          onUpdate(cloudProposals);
        }
      }
    }, (err) => {});
  } catch (err) {
    return () => {};
  }
}

/**
 * Converts a Blob or File to Base64 data string
 */
export function fileToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Converts Base64 data string back to a binary File or Blob object
 */
export function base64ToBlob(base64: string, mimeType: string = 'application/octet-stream', fileName?: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  if (fileName) {
    return new File([byteArray], fileName, { type: mimeType });
  }
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Saves a file's exact binary content to Cloud Firestore for cross-device download support
 */
export async function saveFileToCloud(
  fileName: string,
  blob: Blob,
  mimeType?: string
): Promise<boolean> {
  if (!db) return false;
  try {
    const base64 = await fileToBase64(blob);
    const safeDocId = fileName.toLowerCase().replace(/[\/\\:#?%*"'<>|]/g, '_').substring(0, 100);
    const fileKey = `file_${safeDocId}`;

    if (shouldSkipCloudSave(fileKey, base64)) return true;

    return scheduleDebouncedCloudWrite(fileKey, async () => {
      const docRef = doc(db, 'sipati_cloud_files', safeDocId);
      const CHUNK_SIZE = 450000;
      const totalLength = base64.length;
      const chunkCount = Math.ceil(totalLength / CHUNK_SIZE);

      if (chunkCount <= 1) {
        await setDoc(docRef, cleanForFirestore({
          fileName,
          mimeType: mimeType || blob.type || 'application/octet-stream',
          size: blob.size,
          base64Data: base64,
          chunkCount: 1,
          uploadedAt: new Date().toISOString(),
        }));
      } else {
        const chunks: string[] = [];
        for (let i = 0; i < chunkCount; i++) {
          chunks.push(base64.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
        }
        await setDoc(docRef, cleanForFirestore({
          fileName,
          mimeType: mimeType || blob.type || 'application/octet-stream',
          size: blob.size,
          chunks,
          chunkCount,
          uploadedAt: new Date().toISOString(),
        }));
      }
      console.log(`✅ Binary file "${fileName}" stored in Cloud Firestore.`);
      window.dispatchEvent(new CustomEvent('sipati_cloud_file_uploaded', { detail: { fileName } }));
    }, 500, base64);
  } catch (err) {
    console.warn(`Could not sync file "${fileName}" to Cloud Firestore:`, err);
    return false;
  }
}

/**
 * Retrieves a file's exact binary content from Cloud Firestore across any device or account
 */
export async function loadFileFromCloud(fileName: string): Promise<{ blob: Blob; fileName: string; mimeType: string } | null> {
  if (!db || !fileName) return null;
  try {
    const trimmed = fileName.trim();
    const safeDocId = trimmed.toLowerCase().replace(/[\/\\:#?%*"'<>|]/g, '_').substring(0, 100);
    const docRef = doc(db, 'sipati_cloud_files', safeDocId);
    let snap = await getDoc(docRef);

    if (!snap.exists()) {
      const cleanName = trimmed.replace(/[\/\\:*?"<>|]/g, '_').toLowerCase();
      const altDocId = cleanName.substring(0, 100);
      snap = await getDoc(doc(db, 'sipati_cloud_files', altDocId));
    }

    if (snap.exists()) {
      const data = snap.data();
      let fullBase64 = '';
      if (data.base64Data) {
        fullBase64 = data.base64Data;
      } else if (Array.isArray(data.chunks)) {
        fullBase64 = data.chunks.join('');
      }

      if (fullBase64) {
        const mimeType = data.mimeType || 'application/octet-stream';
        const blob = base64ToBlob(fullBase64, mimeType, data.fileName || fileName);
        return {
          blob,
          fileName: data.fileName || fileName,
          mimeType,
        };
      }
    }
  } catch (err) {
    console.warn(`Could not load file "${fileName}" from Cloud Firestore:`, err);
  }
  return null;
}

/**
 * Saves Notifications to Cloud Firestore and LocalStorage
 */
export async function saveNotificationsToCloud(notifs: NotificationItem[]): Promise<boolean> {
  try {
    localStorage.setItem('sipati_notifications', JSON.stringify(notifs));
  } catch (e) {
    console.warn(e);
  }

  if (!db) return false;
  if (shouldSkipCloudSave('notifications', notifs)) return true;

  return scheduleDebouncedCloudWrite('notifications', async () => {
    const docRef = doc(db, NOTIFS_DOC_PATH[0], NOTIFS_DOC_PATH[1]);
    await setDoc(docRef, cleanForFirestore({ notifications: notifs, updatedAt: new Date().toISOString() }));
  }, 300, notifs);
}

/**
 * Loads Notifications from Cloud Firestore
 */
export async function loadNotificationsFromCloud(): Promise<NotificationItem[] | null> {
  if (db) {
    try {
      const docRef = doc(db, NOTIFS_DOC_PATH[0], NOTIFS_DOC_PATH[1]);
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data()?.notifications) {
        const cloudNotifs = snap.data().notifications as NotificationItem[];
        if (Array.isArray(cloudNotifs)) {
          updateCloudCache('notifications', cloudNotifs);
          localStorage.setItem('sipati_notifications', JSON.stringify(cloudNotifs));
          return cloudNotifs;
        }
      }
    } catch (e) {}
  }
  return null;
}

/**
 * Subscribes to realtime Notifications updates across devices
 */
export function subscribeNotificationsCloud(onUpdate: (notifs: NotificationItem[]) => void) {
  if (!db) return () => {};
  try {
    const docRef = doc(db, NOTIFS_DOC_PATH[0], NOTIFS_DOC_PATH[1]);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists() && snap.data()?.notifications) {
        const cloudNotifs = snap.data().notifications as NotificationItem[];
        if (Array.isArray(cloudNotifs)) {
          updateCloudCache('notifications', cloudNotifs);
          localStorage.setItem('sipati_notifications', JSON.stringify(cloudNotifs));
          onUpdate(cloudNotifs);
        }
      }
    }, (err) => {});
  } catch (err) {
    return () => {};
  }
}

/**
 * Saves Activity Logs to Cloud Firestore and LocalStorage
 */
export async function saveActivityLogsToCloud(logs: ActivityLogItem[]): Promise<boolean> {
  try {
    localStorage.setItem('sipati_activity_logs', JSON.stringify(logs));
  } catch (e) {
    console.warn(e);
  }

  if (!db) return false;
  if (shouldSkipCloudSave('activity_logs', logs)) return true;

  return scheduleDebouncedCloudWrite('activity_logs', async () => {
    const docRef = doc(db, LOGS_DOC_PATH[0], LOGS_DOC_PATH[1]);
    await setDoc(docRef, cleanForFirestore({ logs, updatedAt: new Date().toISOString() }));
  }, 300, logs);
}

/**
 * Loads Activity Logs from Cloud Firestore
 */
export async function loadActivityLogsFromCloud(): Promise<ActivityLogItem[] | null> {
  if (db) {
    try {
      const docRef = doc(db, LOGS_DOC_PATH[0], LOGS_DOC_PATH[1]);
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data()?.logs) {
        const cloudLogs = snap.data().logs as ActivityLogItem[];
        if (Array.isArray(cloudLogs)) {
          updateCloudCache('activity_logs', cloudLogs);
          localStorage.setItem('sipati_activity_logs', JSON.stringify(cloudLogs));
          return cloudLogs;
        }
      }
    } catch (e) {}
  }
  return null;
}

/**
 * Subscribes to realtime Activity Logs updates across devices
 */
export function subscribeActivityLogsCloud(onUpdate: (logs: ActivityLogItem[]) => void) {
  if (!db) return () => {};
  try {
    const docRef = doc(db, LOGS_DOC_PATH[0], LOGS_DOC_PATH[1]);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists() && snap.data()?.logs) {
        const cloudLogs = snap.data().logs as ActivityLogItem[];
        if (Array.isArray(cloudLogs)) {
          updateCloudCache('activity_logs', cloudLogs);
          localStorage.setItem('sipati_activity_logs', JSON.stringify(cloudLogs));
          onUpdate(cloudLogs);
        }
      }
    }, (err) => {});
  } catch (err) {
    return () => {};
  }
}
