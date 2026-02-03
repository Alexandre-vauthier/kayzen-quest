import { useState, useEffect, useRef, useCallback } from 'react';
import type { Player, DailyQuests, QuestHistory, Quest, Badge, LevelUpPopupData } from '../types/types';
import { difficultyXP, BONUS_QUEST_MULTIPLIER, allBadges, genericCompletionMessages } from '../utils/constants';
import { getPlayerTitle, generateQuestsFromAPI, generateLevelUpStoryFromAPI, generateQuestCompletionMessage } from '../utils/utils';
import { celebrateQuestComplete } from '../utils/celebrations';

export interface QuestCallbacks {
  setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  onBadgeEarned: (badge: Badge) => void;
  onPerfectDay: () => void;
  onLevelUp: (data: LevelUpPopupData, duration?: number) => void;
  setGeneratingStory: (val: boolean) => void;
}

interface UndoSnapshot {
  player: Player;
  dailyQuests: DailyQuests;
  questHistory: QuestHistory[];
  questId: number;
}

export function useQuests(player: Player, isPremium: boolean, questCount: number, callbacks: QuestCallbacks) {
  const [dailyQuests, setDailyQuests] = useState<DailyQuests>({
    quests: [],
    selectedQuestId: null,
    date: new Date().toDateString(),
  });
  const [questHistory, setQuestHistory] = useState<QuestHistory[]>([]);
  const [generating, setGenerating] = useState(false);
  const [refreshingQuestId, setRefreshingQuestId] = useState<number | null>(null);
  const [timeToReset, setTimeToReset] = useState('');
  const [undoSnapshot, setUndoSnapshot] = useState<UndoSnapshot | null>(null);

  // Refs to avoid stale closures in async callbacks
  const playerRef = useRef(player);
  playerRef.current = player;
  const questHistoryRef = useRef(questHistory);
  questHistoryRef.current = questHistory;
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Daily reset check
  useEffect(() => {
    const checkDailyReset = () => {
      const today = new Date().toDateString();
      if (dailyQuests.date !== today) {
        setDailyQuests({
          quests: [],
          selectedQuestId: null,
          date: today,
          questRefreshesUsed: 0,
        });
      }
    };
    checkDailyReset();
    const interval = setInterval(checkDailyReset, 60000);
    return () => clearInterval(interval);
  }, [dailyQuests.date]);

  // Midnight countdown timer
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeToReset(`${hours.toString().padStart(2, '0')}h${minutes.toString().padStart(2, '0')}m${seconds.toString().padStart(2, '0')}s`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper: build goals info string for API
  const buildGoalsInfo = useCallback((goals: Player['goals']) => {
    return (goals || []).filter(g => !g.archivedAt).map(goal => {
      const themesInfo = goal.themes.map(t => {
        let suggestedDifficulty = 'easy';
        if (t.developmentLevel === 'medium') suggestedDifficulty = 'medium';
        if (t.developmentLevel === 'high' || t.developmentLevel === 'advanced') suggestedDifficulty = 'hard';
        return `${t.name} [goalId="${goal.id}", themeId="${t.id}"] (${t.questsCompleted} quêtes, niveau: ${t.developmentLevel}, difficulté suggérée: ${suggestedDifficulty})`;
      }).join('\n  - ');
      const contextInfo = goal.context ? `\n  Contexte: "${goal.context}"` : '';
      return `Objectif "${goal.label}" [goalId="${goal.id}"]:${contextInfo}\n  - ${themesInfo}`;
    }).join('\n\n');
  }, []);

  // Helper: check badges (internal)
  const checkBadges = useCallback((newPlayerData: Player, onBadgeEarned: (badge: Badge) => void) => {
    if (!newPlayerData.badges) newPlayerData.badges = [];
    allBadges.forEach(badge => {
      if (!newPlayerData.badges.includes(badge.id) && badge.condition(newPlayerData)) {
        newPlayerData.badges.push(badge.id);
        onBadgeEarned(badge);
      }
    });
  }, []);

  // Helper: compute streak from history (accounting for freeze days)
  const computeStreak = useCallback((history: QuestHistory[], freezeDays: string[] = []) => {
    if (history.length === 0 && freezeDays.length === 0) return 0;

    const daysWithQuests = new Set<string>();
    history.forEach(q => {
      daysWithQuests.add(new Date(q.date).toDateString());
    });

    // Add freeze days to valid days
    const freezeDaysSet = new Set(freezeDays);

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count consecutive days from today backwards
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toDateString();

      if (daysWithQuests.has(dateStr) || freezeDaysSet.has(dateStr)) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, []);

  const generateQuests = useCallback(async () => {
    setGenerating(true);
    try {
      const p = playerRef.current;
      const recentQuests = questHistoryRef.current.slice(-15).map(q => q.title).join(', ');
      const goalsInfo = buildGoalsInfo(p.goals);
      const hasGoals = p.goals && p.goals.filter(g => !g.archivedAt).length > 0;

      const generatedQuests = await generateQuestsFromAPI(
        recentQuests, goalsInfo, hasGoals, questCount, p.pinnedQuests || []
      );
      const newQuests: Quest[] = generatedQuests.map((q: any) => ({
        ...q,
        status: 'available' as const,
        isSelectedQuest: false,
      }));

      setDailyQuests({
        quests: newQuests,
        selectedQuestId: null,
        date: new Date().toDateString(),
        questRefreshesUsed: 0,
      });
    } catch {
      alert('Erreur génération');
    }
    setGenerating(false);
  }, [questCount, buildGoalsInfo]);

  // Refresh a single quest (Premium feature, max 3/day)
  const refreshSingleQuest = useCallback(async (questId: number) => {
    const refreshesUsed = dailyQuests.questRefreshesUsed || 0;
    if (refreshesUsed >= 3) return;

    const questToReplace = dailyQuests.quests.find(q => q.id === questId);
    if (!questToReplace || questToReplace.status === 'completed' || questToReplace.status === 'selected') return;

    setRefreshingQuestId(questId);
    try {
      const p = playerRef.current;
      const otherQuests = dailyQuests.quests.filter(q => q.id !== questId);

      // Build list of quests to avoid (recent + current quests)
      const recentQuests = [
        ...questHistoryRef.current.slice(-15).map(q => q.title),
        ...otherQuests.map(q => q.title),
        questToReplace.title, // Also avoid the quest being replaced
      ].join(', ');

      const goalsInfo = buildGoalsInfo(p.goals);
      const hasGoals = p.goals && p.goals.filter(g => !g.archivedAt).length > 0;

      // Generate just 1 quest (no pinned quests for single refresh)
      const generatedQuests = await generateQuestsFromAPI(
        recentQuests, goalsInfo, hasGoals, 1, []
      );

      if (generatedQuests.length > 0) {
        const newQuest: Quest = {
          ...generatedQuests[0],
          id: Date.now(),
          status: questToReplace.status,
          isSelectedQuest: false,
        };

        setDailyQuests(prev => ({
          ...prev,
          quests: prev.quests.map(q => q.id === questId ? newQuest : q),
          questRefreshesUsed: refreshesUsed + 1,
        }));
      }
    } catch {
      alert('Erreur génération');
    }
    setRefreshingQuestId(null);
  }, [dailyQuests, buildGoalsInfo]);

  const selectQuest = useCallback((questId: number) => {
    setDailyQuests(prev => {
      const updatedQuests = prev.quests.map(q => {
        if (q.id === questId) return { ...q, status: 'selected' as const, isSelectedQuest: true };
        if (q.status === 'available') return { ...q, status: 'bonus' as const, isSelectedQuest: false };
        return q;
      });
      return { ...prev, quests: updatedQuests, selectedQuestId: questId };
    });
  }, []);

  const completeQuest = useCallback((questId: number) => {
    const quest = dailyQuests.quests.find(q => q.id === questId);
    if (!quest || quest.status === 'completed') return;

    const p = playerRef.current;
    const cb = callbacksRef.current;
    const prevHistory = questHistoryRef.current;

    // Save undo snapshot
    setUndoSnapshot({
      player: { ...p },
      dailyQuests: { ...dailyQuests, quests: dailyQuests.quests.map(q => ({ ...q })) },
      questHistory: [...prevHistory],
      questId,
    });
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    undoTimeoutRef.current = setTimeout(() => setUndoSnapshot(null), 6000);

    // Celebrate!
    celebrateQuestComplete();

    // XP calculation
    const isBonus = quest.status === 'bonus';
    const baseXP = difficultyXP[quest.difficulty];
    const xpGained = isBonus ? Math.floor(baseXP * BONUS_QUEST_MULTIPLIER) : baseXP;

    const newXp = p.xp + xpGained;
    let newLevel = p.level;
    let newXpToNext = p.xpToNext;
    let finalXp = newXp;
    let leveledUp = false;

    if (newXp >= p.xpToNext) {
      newLevel++;
      finalXp = newXp - p.xpToNext;
      newXpToNext = Math.floor(p.xpToNext * 1.2);
      leveledUp = true;
    }

    // Theme progression
    let updatedGoals = p.goals || [];
    if (quest.goalId && quest.themeId) {
      updatedGoals = updatedGoals.map(goal => {
        if (goal.id !== quest.goalId) return goal;
        const updatedThemes = goal.themes.map(theme => {
          if (theme.id !== quest.themeId) return theme;
          const newCount = theme.questsCompleted + 1;
          let devLevel: any = 'none';
          if (newCount <= 3) devLevel = 'low';
          else if (newCount <= 7) devLevel = 'medium';
          else if (newCount <= 15) devLevel = 'high';
          else devLevel = 'advanced';
          return { ...theme, questsCompleted: newCount, lastTouched: new Date().toISOString(), developmentLevel: devLevel };
        });
        return { ...goal, themes: updatedThemes };
      });
    }

    // Streak computation
    const newHistory: QuestHistory[] = [...prevHistory, {
      title: quest.title,
      date: new Date().toISOString(),
      goalId: quest.goalId,
      themeId: quest.themeId,
      wasPerfectDay: false, // updated below
      category: quest.category,
      difficulty: quest.difficulty,
    }];
    const newStreak = computeStreak(newHistory, p.streakFreezeDays || []);
    const newBestStreak = Math.max(newStreak, p.bestStreak || 0);

    // Build new player data
    const currentTitle = getPlayerTitle(newLevel);
    const previousTitle = getPlayerTitle(p.level);
    const newPlayerData: Player = {
      ...p,
      level: newLevel,
      xp: finalXp,
      xpToNext: newXpToNext,
      questsCompleted: p.questsCompleted + 1,
      hardQuestsCompleted: p.hardQuestsCompleted + (quest.difficulty === 'hard' ? 1 : 0),
      perfectDays: p.perfectDays,
      goals: updatedGoals,
      name: currentTitle.name,
      currentStreak: newStreak,
      bestStreak: newBestStreak,
      bonusQuestsCompleted: (p.bonusQuestsCompleted || 0) + (isBonus ? 1 : 0),
    };

    // Update quest status
    const updatedQuests = dailyQuests.quests.map(q =>
      q.id === questId ? { ...q, status: 'completed' as const, completedAt: new Date().toISOString(), wasBonus: isBonus } : q
    );

    const completedCount = updatedQuests.filter(q => q.status === 'completed').length;
    const wasPerfectDay = completedCount === updatedQuests.length;

    if (wasPerfectDay) {
      newPlayerData.perfectDays++;
      cb.onPerfectDay();
    }

    // Update history entry with wasPerfectDay
    newHistory[newHistory.length - 1].wasPerfectDay = wasPerfectDay;

    // Dispatch state updates
    setDailyQuests(prev => ({ ...prev, quests: updatedQuests }));
    setQuestHistory(newHistory);

    // Badge check
    checkBadges(newPlayerData, cb.onBadgeEarned);

    // Completion message
    if (isPremium) {
      generateQuestCompletionMessage(quest.title).then(msg => {
        if (msg) {
          setDailyQuests(prev => ({
            ...prev,
            quests: prev.quests.map(q => q.id === questId ? { ...q, completionMessage: msg } : q),
          }));
        }
      });
    } else {
      const msg = genericCompletionMessages[Math.floor(Math.random() * genericCompletionMessages.length)];
      setDailyQuests(prev => ({
        ...prev,
        quests: prev.quests.map(q => q.id === questId ? { ...q, completionMessage: msg } : q),
      }));
    }

    // Level-up story or direct player update
    if (leveledUp) {
      cb.setGeneratingStory(true);

      const recentQuests = questHistoryRef.current.slice(-15);
      const previousChapters = (p.storyChapters || []).slice(-2);
      const goalsText = (p.goals || []).map(g => g.label).join(', ');

      generateLevelUpStoryFromAPI(newLevel, currentTitle, goalsText, recentQuests, previousChapters)
        .then(story => {
          const newChapter = {
            level: newLevel,
            title: currentTitle.name,
            story,
            date: new Date().toISOString(),
          };
          const updatedPlayerData = {
            ...newPlayerData,
            storyChapters: [...(p.storyChapters || []), newChapter],
          };
          cb.setPlayer(updatedPlayerData);
          cb.onLevelUp({
            level: newLevel,
            title: currentTitle,
            titleChanged: currentTitle.name !== previousTitle.name,
            story,
          });
          cb.setGeneratingStory(false);
        })
        .catch(() => {
          cb.setPlayer(newPlayerData);
          cb.onLevelUp({
            level: newLevel,
            title: currentTitle,
            titleChanged: currentTitle.name !== previousTitle.name,
            story: null,
          }, 4000);
          cb.setGeneratingStory(false);
        });
    } else {
      cb.setPlayer(newPlayerData);
    }
  }, [dailyQuests, isPremium, checkBadges, computeStreak]);

  const undoLastCompletion = useCallback(() => {
    if (!undoSnapshot) return;
    const cb = callbacksRef.current;
    cb.setPlayer(undoSnapshot.player);
    setDailyQuests(undoSnapshot.dailyQuests);
    setQuestHistory(undoSnapshot.questHistory);
    setUndoSnapshot(null);
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
  }, [undoSnapshot]);

  const setQuestFeedback = useCallback((questId: number, feedback: 'up' | 'down') => {
    setDailyQuests(prev => ({
      ...prev,
      quests: prev.quests.map(q => q.id === questId ? { ...q, feedback } : q),
    }));
    setQuestHistory(prev => {
      const quest = dailyQuests.quests.find(q => q.id === questId);
      if (!quest) return prev;
      return prev.map(h => h.title === quest.title && h.date === quest.completedAt ? { ...h, feedback } : h);
    });
  }, [dailyQuests]);

  // Add a custom quest (user-defined, one-off)
  const addCustomQuest = useCallback((title: string, category: Quest['category'] = 'projects') => {
    if (!title.trim()) return;
    const hasSelectedQuest = dailyQuests.quests.some(q => q.status === 'selected');
    const newQuest: Quest = {
      id: Date.now(),
      title: title.trim(),
      description: 'Quête personnalisée',
      category,
      difficulty: 'medium',
      status: hasSelectedQuest ? 'bonus' : 'available',
      isSelectedQuest: false,
      goalId: null,
      themeId: null,
    };
    setDailyQuests(prev => ({
      ...prev,
      quests: [...prev.quests, newQuest],
    }));
  }, [dailyQuests]);

  return {
    dailyQuests,
    setDailyQuests,
    questHistory,
    setQuestHistory,
    generating,
    refreshingQuestId,
    timeToReset,
    generateQuests,
    refreshSingleQuest,
    selectQuest,
    completeQuest,
    undoSnapshot,
    undoLastCompletion,
    setQuestFeedback,
    addCustomQuest,
  };
}
