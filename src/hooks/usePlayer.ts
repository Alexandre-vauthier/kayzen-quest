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

  const togglePremium = useCallback(() => {
    setPlayer(prev => ({ ...prev, premium: !prev.premium }));
  }, []);

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
    togglePremium,
  };
}
