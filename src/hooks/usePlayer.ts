import { useState, useCallback } from 'react';
import type { Player } from '../types/types';
import { presetGoals } from '../utils/constants';
import { getPlayerTitle, generateThemesForGoal } from '../utils/utils';

const defaultPlayer: Player = {
  name: "Aventurier",
  level: 1,
  xp: 0,
  xpToNext: 100,
  badges: [],
  questsCompleted: 0,
  hardQuestsCompleted: 0,
  perfectDays: 0,
  goals: [],
  storyChapters: [],
  onboardingComplete: false,
};

export function usePlayer() {
  const [player, setPlayer] = useState<Player>(defaultPlayer);
  const [generatingThemes, setGeneratingThemes] = useState(false);
  const [newGoal, setNewGoal] = useState('');
  const [selectedPresetGoal, setSelectedPresetGoal] = useState<string | null>(null);

  const isPremium = player.premium === true;
  const currentTitle = getPlayerTitle(player.level);
  const questCount = isPremium ? 5 : 3;

  const completeOnboarding = useCallback(async () => {
    const goalLabel = selectedPresetGoal
      ? presetGoals.find(g => g.id === selectedPresetGoal)!.label
      : newGoal.trim();

    if (!goalLabel) return;

    setGeneratingThemes(true);
    setPlayer(prev => ({ ...prev, goals: [], onboardingComplete: true }));

    const goal = await generateThemesForGoal(goalLabel);
    setPlayer(prev => ({ ...prev, goals: [goal] }));

    setGeneratingThemes(false);
  }, [selectedPresetGoal, newGoal]);

  const addGoal = useCallback(async () => {
    if (newGoal.trim()) {
      setGeneratingThemes(true);
      const goal = await generateThemesForGoal(newGoal.trim());
      setPlayer(prev => ({ ...prev, goals: [...(prev.goals || []), goal] }));
      setNewGoal('');
      setGeneratingThemes(false);
    }
  }, [newGoal]);

  const removeGoal = useCallback((goalId: string) => {
    setPlayer(prev => ({ ...prev, goals: (prev.goals || []).filter(g => g.id !== goalId) }));
  }, []);

  const archiveGoal = useCallback((goalId: string) => {
    setPlayer(prev => ({
      ...prev,
      goals: (prev.goals || []).map(g =>
        g.id === goalId ? { ...g, archivedAt: new Date().toISOString() } : g
      ),
    }));
  }, []);

  const togglePremium = useCallback(() => {
    setPlayer(prev => ({ ...prev, premium: !prev.premium }));
  }, []);

  const togglePinnedQuest = useCallback((questTitle: string) => {
    setPlayer(prev => {
      const pinned = prev.pinnedQuests || [];
      const isAlreadyPinned = pinned.includes(questTitle);
      return {
        ...prev,
        pinnedQuests: isAlreadyPinned
          ? pinned.filter(q => q !== questTitle)
          : [...pinned, questTitle],
      };
    });
  }, []);

  // Check if user can use streak freeze (premium + once per week)
  const canUseStreakFreeze = useCallback(() => {
    if (!isPremium) return false;
    const lastUsed = player.streakFreezeUsedAt;
    if (!lastUsed) return true;
    const lastUsedDate = new Date(lastUsed);
    const now = new Date();
    const daysSinceLastUse = Math.floor((now.getTime() - lastUsedDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceLastUse >= 7;
  }, [isPremium, player.streakFreezeUsedAt]);

  // Use streak freeze for today
  const useStreakFreeze = useCallback(() => {
    if (!canUseStreakFreeze()) return false;
    const today = new Date().toDateString();
    setPlayer(prev => ({
      ...prev,
      streakFreezeUsedAt: new Date().toISOString(),
      streakFreezeDays: [...(prev.streakFreezeDays || []), today],
    }));
    return true;
  }, [canUseStreakFreeze]);

  return {
    player,
    setPlayer,
    isPremium,
    currentTitle,
    questCount,
    generatingThemes,
    newGoal,
    setNewGoal,
    selectedPresetGoal,
    setSelectedPresetGoal,
    completeOnboarding,
    addGoal,
    removeGoal,
    archiveGoal,
    togglePremium,
    togglePinnedQuest,
    canUseStreakFreeze,
    useStreakFreeze,
  };
}
