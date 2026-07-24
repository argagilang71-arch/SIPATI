import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { TeamMember } from '../types';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);

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
    console.error('⚠️ Firebase Firestore sync warning:', err);
    return false;
  }
}

/**
 * Loads team members list from Firebase Firestore (Cloud) with fallback to LocalStorage.
 */
export async function loadTeamMembersFromCloud(): Promise<TeamMember[]> {
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
    console.warn('Could not fetch team members from Firestore cloud, falling back to local storage:', err);
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
        console.warn('Realtime snapshot listener error:', err);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to realtime Firestore cloud:', err);
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

    const docRef = doc(db, SETTINGS_DOC_PATH[0], SETTINGS_DOC_PATH[1]);
    await setDoc(docRef, {
      ...settings,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.warn('Save settings cloud warning:', err);
    return false;
  }
}

/**
 * Loads system settings from Firebase Firestore Cloud.
 */
export async function loadSettingsFromCloud() {
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
    console.warn('Load settings cloud warning:', err);
  }
  return null;
}
