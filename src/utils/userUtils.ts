import { safeSetLocalStorage } from './storageUtils';
import { TeamMember } from '../types';

export const PRESET_DEFAULT_AVATARS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD0R1bby-MAB_3UmPNiN166iM6w8GN8Br7vcCFJTLw_T7QHb0dGgloCH4DrPbR58NA7vg0xGra_ObnphmVVsiXMjjoulq3Cy2Soh0B66LjFvIvUEXKE-jHiqHum5BMMWgIL5NRE-HcQ9dKAJaW3LBrDIAicr0EWyCh2VE7U9ayXTt9EycbZTG3pA-yiBDGCLa34RqH9noeFA24p9s0aphy44bWmlmdJaXy02lMqu38IlS_LnTmD2DHhEOr_D37BoPRkK3Yg9_BY-SQ",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256",
];

/**
 * Returns appropriate access role for a formal Jabatan / Sub-Bagian (Admin or User)
 */
export function getRoleForJabatan(jabatan: string): string {
  if (!jabatan) return 'User';
  const jLower = jabatan.toLowerCase();
  if (
    jLower.includes('kepala bagian') ||
    jLower.includes('kabag') ||
    jLower.includes('officer') ||
    jLower.includes('admin')
  ) {
    return 'Admin';
  }
  return 'User';
}

/**
 * Saves a user's custom photo persistently in localStorage so it is never lost across logins or syncs.
 */
export function savePersistentCustomPhoto(identifiers: (string | undefined)[], photoUrl: string) {
  if (!photoUrl) return;
  identifiers.forEach((id) => {
    if (!id) return;
    const key = 'sipati_custom_photo_' + id.toLowerCase().replace(/\s+/g, '');
    safeSetLocalStorage(key, photoUrl);
  });
}

/**
 * Retrieves a user's persistent custom photo if available.
 */
export function getPersistentCustomPhoto(identifiers: (string | undefined)[]): string | null {
  for (const id of identifiers) {
    if (!id) continue;
    const cleanId = id.toLowerCase().replace(/\s+/g, '');
    const saved = localStorage.getItem('sipati_custom_photo_' + cleanId);
    if (saved && saved.length > 20) {
      return saved;
    }
  }
  return null;
}

/**
 * Normalizes a list of team members, ensuring correct names, NIPs, formal positions,
 * access roles (Admin / User), and custom avatars.
 */
export function normalizeTeamMembers(members: TeamMember[]): TeamMember[] {
  if (!Array.isArray(members)) return [];

  const normalized = members.map((m) => {
    const copy = { ...m };
    const usernameLower = (copy.username || '').toLowerCase().trim();
    const namaLower = (copy.nama || '').toLowerCase().trim();

    // 1. Recover custom persistent avatar if available
    const customPhoto = getPersistentCustomPhoto([copy.username, copy.nip, copy.id]);
    if (customPhoto) {
      copy.foto = customPhoto;
      copy.avatar = customPhoto;
      copy.photo = customPhoto;
    }

    let assignedRole = copy.role;

    // 2. Gilang Ariesta Arga, S.IP
    if (
      usernameLower === 'gilang.admin' ||
      usernameLower === '197805122003121002' ||
      namaLower.includes('gilang') ||
      (copy.nip && copy.nip.includes('199403162016091001'))
    ) {
      copy.nama = 'Gilang Ariesta Arga, S.IP';
      copy.nip = '199403162016091001';
      if (!copy.jabatan) copy.jabatan = 'Kepala Bagian Tata Pemerintahan';
      copy.subBagian = copy.jabatan;
      if (!assignedRole) assignedRole = 'Admin';
    } else if (
      usernameLower === 'faisal.hadi1' ||
      namaLower.includes('faisal') ||
      (copy.nip && copy.nip.includes('196812111996031007'))
    ) {
      // 3. Faisal Hadi Jaya, S.E, M.Si
      copy.nama = 'Faisal Hadi Jaya, S.E, M.Si';
      copy.nip = '196812111996031007';
      if (!copy.jabatan) copy.jabatan = 'Kepala Bagian Tata Pemerintahan';
      copy.subBagian = copy.jabatan;
      if (!assignedRole) assignedRole = 'User';
    } else if (
      usernameLower === 'erik.2' ||
      namaLower.includes('erik') ||
      (copy.nip && copy.nip.includes('19860920'))
    ) {
      // 4. Singgih Erik Rudiana, S.STP, M.A.P
      copy.nama = 'Singgih Erik Rudiana, S.STP, M.A.P';
      copy.nip = '19860920 200904 2 005';
      if (!copy.jabatan) copy.jabatan = 'Analis Kebijakan Ahli Muda';
      copy.subBagian = copy.jabatan;
      if (!assignedRole) assignedRole = 'User';
    } else if (
      usernameLower === 'mulyadi' ||
      namaLower.includes('mulyadi') ||
      (copy.nip && copy.nip.includes('19700101'))
    ) {
      // 5. Drs. H. Mulyadi, M.Si
      copy.nama = 'Drs. H. Mulyadi, M.Si';
      copy.nip = '19700101 199503 1 001';
      if (!copy.jabatan) copy.jabatan = 'Kepala Bagian Tata Pemerintahan';
      copy.subBagian = copy.jabatan;
      if (!assignedRole) assignedRole = 'Admin';
    }

    // Map assignedRole to strictly Admin or User
    const rLower = (assignedRole || '').toLowerCase();
    if (rLower.includes('admin') || rLower.includes('officer') || rLower.includes('kepala bagian')) {
      copy.role = 'Admin';
    } else {
      copy.role = 'User';
    }

    return copy;
  });

  return normalized;
}
