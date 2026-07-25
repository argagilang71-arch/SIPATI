import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { TeamMember, TaskItem, ArchiveItem, TemplateItem, ProposalItem } from '../types';

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

const CONFIG_DOC_PATH = ['sipati_config', 'team_members'] as const;
const SETTINGS_DOC_PATH = ['sipati_config', 'settings'] as const;
const TASKS_DOC_PATH = ['sipati_config', 'tasks'] as const;
const ARCHIVES_DOC_PATH = ['sipati_config', 'archives'] as const;
const TEMPLATES_DOC_PATH = ['sipati_config', 'templates'] as const;
const PROPOSALS_DOC_PATH = ['sipati_config', 'proposals'] as const;

/**
 * Saves team members list both to Firebase Firestore (Global Cloud Sync) and LocalStorage.
 */
export async function saveTeamMembersToCloud(members: TeamMember[]): Promise<boolean> {
  // Always update LocalStorage immediately for instant local UI responsiveness
  try {
    localStorage.setItem('sipati_team_members', JSON.stringify(members));
  } catch (err) {
    console.warn('LocalStorage error:', err);
  }

  if (!db) return false;

  // Sync to Firebase Firestore for cross-device & shared link support
  try {
    const docRef = doc(db, CONFIG_DOC_PATH[0], CONFIG_DOC_PATH[1]);
    await setDoc(docRef, {
      members,
      updatedAt: new Date().toISOString(),
    });
    console.log('✅ Team members synced to Cloud Firestore successfully.');
    return true;
  } catch (err) {
    // Graceful error logging without breaking app execution
    console.warn('Note: Cloud Firestore not initialized yet. Data saved locally on this browser.');
    return false;
  }
}

/**
 * Loads team members list from Firebase Firestore (Cloud) with fallback to LocalStorage.
 */
export async function loadTeamMembersFromCloud(): Promise<TeamMember[]> {
  if (db) {
    try {
      const docRef = doc(db, CONFIG_DOC_PATH[0], CONFIG_DOC_PATH[1]);
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data()?.members) {
        const cloudMembers = snap.data().members as TeamMember[];
        if (Array.isArray(cloudMembers) && cloudMembers.length > 0) {
          localStorage.setItem('sipati_team_members', JSON.stringify(cloudMembers));
          return cloudMembers;
        }
      }
    } catch (err) {
      // Offline or database not created yet, fall back silently to local storage
    }
  }

  // Fallback to local storage if Firestore fails or is offline
  try {
    const saved = localStorage.getItem('sipati_team_members');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error parsing local team members:', e);
  }

  return [];
}

/**
 * Subscribes to real-time changes in Firebase Firestore so shared links on other devices update instantly.
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
            localStorage.setItem('sipati_team_members', JSON.stringify(members));
            onUpdate(members);
          }
        }
      },
      (err) => {
        // Quietly catch unprovisioned database errors
      }
    );
  } catch (err) {
    return () => {};
  }
}

/**
 * Saves overall system settings to Firebase Firestore Cloud & LocalStorage.
 */
export async function saveSettingsToCloud(settings: {
  namaInstansi?: string;
  namaAdmin?: string;
  nipAdmin?: string;
  emailNotif?: string;
  autoArchive?: boolean;
}): Promise<boolean> {
  try {
    if (settings.namaInstansi) localStorage.setItem('sipati_nama_instansi', settings.namaInstansi);
    if (settings.namaAdmin) localStorage.setItem('sipati_nama_admin', settings.namaAdmin);
    if (settings.nipAdmin) localStorage.setItem('sipati_nip_admin', settings.nipAdmin);
    if (settings.emailNotif) localStorage.setItem('sipati_email_notif', settings.emailNotif);
    if (settings.autoArchive !== undefined)
      localStorage.setItem('sipati_auto_archive', JSON.stringify(settings.autoArchive));
  } catch (e) {
    console.warn(e);
  }

  if (!db) return false;

  try {
    const docRef = doc(db, SETTINGS_DOC_PATH[0], SETTINGS_DOC_PATH[1]);
    await setDoc(docRef, {
      ...settings,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    return false;
  }
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
      if (data.namaInstansi) localStorage.setItem('sipati_nama_instansi', data.namaInstansi);
      if (data.namaAdmin) localStorage.setItem('sipati_nama_admin', data.namaAdmin);
      if (data.nipAdmin) localStorage.setItem('sipati_nip_admin', data.nipAdmin);
      if (data.emailNotif) localStorage.setItem('sipati_email_notif', data.emailNotif);
      if (data.autoArchive !== undefined)
        localStorage.setItem('sipati_auto_archive', JSON.stringify(data.autoArchive));
      return data;
    }
  } catch (err) {
    // Quietly fallback
  }
  return null;
}

/**
 * Subscribes to real-time system settings changes.
 */
export function subscribeSettingsCloud(onUpdate: (settings: any) => void) {
  if (!db) return () => {};
  try {
    const docRef = doc(db, SETTINGS_DOC_PATH[0], SETTINGS_DOC_PATH[1]);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.namaInstansi) localStorage.setItem('sipati_nama_instansi', data.namaInstansi);
        if (data.namaAdmin) localStorage.setItem('sipati_nama_admin', data.namaAdmin);
        if (data.nipAdmin) localStorage.setItem('sipati_nip_admin', data.nipAdmin);
        if (data.emailNotif) localStorage.setItem('sipati_email_notif', data.emailNotif);
        if (data.autoArchive !== undefined)
          localStorage.setItem('sipati_auto_archive', JSON.stringify(data.autoArchive));
        onUpdate(data);
      }
    });
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
  try {
    const docRef = doc(db, TASKS_DOC_PATH[0], TASKS_DOC_PATH[1]);
    await setDoc(docRef, { tasks, updatedAt: new Date().toISOString() });
    return true;
  } catch (err) {
    return false;
  }
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
          localStorage.setItem('sipati_tasks', JSON.stringify(cloudTasks));
          onUpdate(cloudTasks);
        }
      }
    });
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
  try {
    const docRef = doc(db, ARCHIVES_DOC_PATH[0], ARCHIVES_DOC_PATH[1]);
    await setDoc(docRef, { archives, updatedAt: new Date().toISOString() });
    return true;
  } catch (err) {
    return false;
  }
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
          localStorage.setItem('sipati_archives', JSON.stringify(cloudArchives));
          onUpdate(cloudArchives);
        }
      }
    });
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
  try {
    const docRef = doc(db, TEMPLATES_DOC_PATH[0], TEMPLATES_DOC_PATH[1]);
    await setDoc(docRef, { templates, updatedAt: new Date().toISOString() });
    return true;
  } catch (err) {
    return false;
  }
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
          localStorage.setItem('sipati_templates', JSON.stringify(cloudTemplates));
          onUpdate(cloudTemplates);
        }
      }
    });
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
  try {
    const docRef = doc(db, PROPOSALS_DOC_PATH[0], PROPOSALS_DOC_PATH[1]);
    await setDoc(docRef, { proposals, updatedAt: new Date().toISOString() });
    return true;
  } catch (err) {
    return false;
  }
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
          localStorage.setItem('sipati_proposals', JSON.stringify(cloudProposals));
          onUpdate(cloudProposals);
        }
      }
    });
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
    const docRef = doc(db, 'sipati_cloud_files', safeDocId);

    const CHUNK_SIZE = 450000;
    const totalLength = base64.length;
    const chunkCount = Math.ceil(totalLength / CHUNK_SIZE);

    if (chunkCount <= 1) {
      await setDoc(docRef, {
        fileName,
        mimeType: mimeType || blob.type || 'application/octet-stream',
        size: blob.size,
        base64Data: base64,
        chunkCount: 1,
        uploadedAt: new Date().toISOString(),
      });
    } else {
      const chunks: string[] = [];
      for (let i = 0; i < chunkCount; i++) {
        chunks.push(base64.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
      }
      await setDoc(docRef, {
        fileName,
        mimeType: mimeType || blob.type || 'application/octet-stream',
        size: blob.size,
        chunks,
        chunkCount,
        uploadedAt: new Date().toISOString(),
      });
    }
    console.log(`✅ Binary file "${fileName}" stored in Cloud Firestore.`);
    return true;
  } catch (err) {
    console.warn(`Could not sync file "${fileName}" to Cloud Firestore:`, err);
    return false;
  }
}

/**
 * Retrieves a file's exact binary content from Cloud Firestore across any device or account
 */
export async function loadFileFromCloud(fileName: string): Promise<{ blob: Blob; fileName: string; mimeType: string } | null> {
  if (!db) return null;
  try {
    const safeDocId = fileName.toLowerCase().replace(/[\/\\:#?%*"'<>|]/g, '_').substring(0, 100);
    const docRef = doc(db, 'sipati_cloud_files', safeDocId);
    let snap = await getDoc(docRef);

    if (!snap.exists()) {
      const cleanName = fileName.replace(/[\/\\:*?"<>|]/g, '_').toLowerCase();
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

