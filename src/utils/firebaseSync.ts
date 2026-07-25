import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { TeamMember } from '../types';

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

