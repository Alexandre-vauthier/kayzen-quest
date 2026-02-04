import { useEffect, useRef, useCallback } from 'react';
import type { Player, DailyQuests, QuestHistory } from '../types/types';
import { useAuth } from '../contexts/AuthContext';
import {
  loadPlayer, loadDailyQuests, loadHistory,
  savePlayer, saveDailyQuests, saveHistory,
  saveUserProfile, migrateLocalStorageToFirestore,
} from '../services/firestoreService';

interface FirestoreSyncParams {
  player: Player;
  dailyQuests: DailyQuests;
  questHistory: QuestHistory[];
  setPlayer: (p: Player) => void;
  setDailyQuests: (d: DailyQuests) => void;
  setQuestHistory: (h: QuestHistory[]) => void;
  openOnboarding: () => void;
}

export function useFirestoreSync(params: FirestoreSyncParams) {
  const { user } = useAuth();
  const dataLoadedRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { player, dailyQuests, questHistory, setPlayer, setDailyQuests, setQuestHistory, openOnboarding } = params;

  // Load data from Firestore on user change
  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        await migrateLocalStorageToFirestore(user.uid);

        await saveUserProfile(user.uid, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          lastLoginAt: new Date().toISOString(),
        });

        const playerData = await loadPlayer(user.uid);
        const questsData = await loadDailyQuests(user.uid);
        const historyData = await loadHistory(user.uid);

        console.log('[Firestore] Loaded player:', { goals: playerData?.goals?.length, onboardingComplete: playerData?.onboardingComplete });

        if (playerData) {
          setPlayer(playerData);
          // If onboarding is complete but no goals exist (corrupted data), show onboarding again
          const activeGoals = (playerData.goals || []).filter(g => !g.archivedAt);
          if (!playerData.onboardingComplete || activeGoals.length === 0) {
            openOnboarding();
          }
        } else {
          openOnboarding();
        }

        if (questsData && questsData.date === new Date().toDateString()) {
          setDailyQuests(questsData);
        }

        if (historyData && historyData.length > 0) {
          setQuestHistory(historyData);
        }

        dataLoadedRef.current = true;
      } catch (err) {
        console.error('Load from Firestore failed:', err);
        openOnboarding();
        dataLoadedRef.current = true;
      }
    };
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Auto-save to Firestore (debounced)
  const saveData = useCallback(async () => {
    if (!user) return;
    try {
      console.log('[Firestore] Saving player:', { goals: player.goals?.length, onboardingComplete: player.onboardingComplete });
      await Promise.all([
        savePlayer(user.uid, player),
        saveDailyQuests(user.uid, dailyQuests),
        saveHistory(user.uid, questHistory),
      ]);
      console.log('[Firestore] Save successful');
    } catch (err) {
      console.error('[Firestore] Save failed:', err);
    }
  }, [user, player, dailyQuests, questHistory]);

  useEffect(() => {
    if (!player.onboardingComplete || !dataLoadedRef.current) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveData();
    }, 1000);
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [player, dailyQuests, questHistory, saveData]);

  return { dataLoaded: dataLoadedRef.current };
}
