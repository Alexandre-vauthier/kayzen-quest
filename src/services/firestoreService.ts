import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Player, DailyQuests, QuestHistory } from '../types/types';

// --- Read operations ---

export async function loadPlayer(uid: string): Promise<Player | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'data', 'player'));
  return snap.exists() ? (snap.data() as Player) : null;
}

export async function loadDailyQuests(uid: string): Promise<DailyQuests | null> {
  const snap = await getDoc(doc(db, 'users', uid, 'data', 'dailyQuests'));
  return snap.exists() ? (snap.data() as DailyQuests) : null;
}

export async function loadHistory(uid: string): Promise<QuestHistory[]> {
  const snap = await getDoc(doc(db, 'users', uid, 'data', 'history'));
  return snap.exists() ? (snap.data().entries as QuestHistory[]) : [];
}

// --- Write operations ---

export async function savePlayer(uid: string, player: Player): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'data', 'player'), player);
}

export async function saveDailyQuests(uid: string, dailyQuests: DailyQuests): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'data', 'dailyQuests'), dailyQuests);
}

export async function saveHistory(uid: string, history: QuestHistory[]): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'data', 'history'), { entries: history });
}

// --- User profile ---

export async function saveUserProfile(uid: string, profile: {
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  lastLoginAt: string;
}): Promise<void> {
  await setDoc(doc(db, 'users', uid), profile, { merge: true });
}

// --- Delete all user data ---

export async function deleteUserData(uid: string): Promise<void> {
  await Promise.all([
    deleteDoc(doc(db, 'users', uid, 'data', 'player')),
    deleteDoc(doc(db, 'users', uid, 'data', 'dailyQuests')),
    deleteDoc(doc(db, 'users', uid, 'data', 'history')),
  ]);
  await deleteDoc(doc(db, 'users', uid));
}

// --- Migration localStorage → Firestore ---

export async function migrateLocalStorageToFirestore(uid: string): Promise<boolean> {
  const existingPlayer = await loadPlayer(uid);
  if (existingPlayer) return false;

  const localPlayer = localStorage.getItem('kaizen-player');
  if (!localPlayer) return false;

  try {
    const player = JSON.parse(localPlayer) as Player;
    await savePlayer(uid, player);

    const localQuests = localStorage.getItem('kaizen-daily-quests');
    if (localQuests) {
      const quests = JSON.parse(localQuests) as DailyQuests;
      await saveDailyQuests(uid, quests);
    }

    const localHistory = localStorage.getItem('kaizen-history');
    if (localHistory) {
      const history = JSON.parse(localHistory) as QuestHistory[];
      await saveHistory(uid, history);
    }

    localStorage.removeItem('kaizen-player');
    localStorage.removeItem('kaizen-daily-quests');
    localStorage.removeItem('kaizen-history');

    return true;
  } catch (err) {
    console.error('Migration localStorage → Firestore failed:', err);
    return false;
  }
}
