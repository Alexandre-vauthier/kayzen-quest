import { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Trophy, Award, Target, Loader2, Clock, Settings } from 'lucide-react';

// Types
import type {
  Player, DailyQuests, QuestHistory, Badge, LevelUpPopupData, Quest
} from '../types/types';

// Constants & Utils
import {
  difficultyXP, BONUS_QUEST_MULTIPLIER, allBadges, presetGoals, genericCompletionMessages
} from '../utils/constants';
import {
  getPlayerTitle, generateThemesForGoal,
  generateQuestsFromAPI, generateLevelUpStoryFromAPI, generateQuestCompletionMessage
} from '../utils/utils';

// Auth & Firestore
import { useAuth } from '../contexts/AuthContext';
import {
  loadPlayer, loadDailyQuests, loadHistory,
  savePlayer, saveDailyQuests, saveHistory,
  saveUserProfile, migrateLocalStorageToFirestore
} from '../services/firestoreService';

// Components
import QuestSelection from './QuestSelection';
import OnboardingModal from './OnboardingModal';
import LevelUpPopup from './LevelUpPopup';
import BadgePopup from './BadgePopup';
import BadgesModal from './BadgesModal';
import GoalsModal from './GoalsModal';
import HistoryModal from './HistoryModal';
import SettingsModal from './SettingsModal';

const KaizenQuest = () => {
  const { user } = useAuth();
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataLoadedRef = useRef(false);

  const [player, setPlayer] = useState<Player>({
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
    onboardingComplete: false
  });

  const [dailyQuests, setDailyQuests] = useState<DailyQuests>({
    quests: [],
    selectedQuestId: null,
    date: new Date().toDateString()
  });

  const [questHistory, setQuestHistory] = useState<QuestHistory[]>([]);
  const [showBadges, setShowBadges] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingStory, setGeneratingStory] = useState(false);
  const [generatingThemes, setGeneratingThemes] = useState(false);
  const [levelUpPopup, setLevelUpPopup] = useState<LevelUpPopupData | null>(null);
  const [badgePopup, setBadgePopup] = useState<Badge | null>(null);
  const [perfectDayPopup, setPerfectDayPopup] = useState(false);

  const [newGoal, setNewGoal] = useState('');
  const [selectedPresetGoal, setSelectedPresetGoal] = useState<string | null>(null);
  const [timeToReset, setTimeToReset] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const checkBadges = (newPlayerData: Player) => {
    if (!newPlayerData.badges) newPlayerData.badges = [];
    const newBadges: Badge[] = [];
    allBadges.forEach(badge => {
      if (!newPlayerData.badges.includes(badge.id) && badge.condition(newPlayerData)) {
        newBadges.push(badge);
        newPlayerData.badges.push(badge.id);
      }
    });

    if (newBadges.length > 0) {
      setBadgePopup(newBadges[0]);
      setTimeout(() => setBadgePopup(null), 4000);
    }
  };

  // Réinitialisation quotidienne
  useEffect(() => {
    const checkDailyReset = () => {
      const today = new Date().toDateString();
      if (dailyQuests.date !== today) {
        setDailyQuests({
          quests: [],
          selectedQuestId: null,
          date: today,
          questRefreshesUsed: 0
        });
      }
    };

    checkDailyReset();
    const interval = setInterval(checkDailyReset, 60000);
    return () => clearInterval(interval);
  }, [dailyQuests.date]);

  // Timer countdown jusqu'à minuit
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

  useEffect(() => {
    if (!user) return;
    const loadData = async () => {
      try {
        // Migrate localStorage data on first login
        await migrateLocalStorageToFirestore(user.uid);

        // Save/update user profile
        await saveUserProfile(user.uid, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          lastLoginAt: new Date().toISOString(),
        });

        // Load from Firestore
        const playerData = await loadPlayer(user.uid);
        const questsData = await loadDailyQuests(user.uid);
        const historyData = await loadHistory(user.uid);

        if (playerData) {
          setPlayer(playerData);
          if (!playerData.onboardingComplete) setShowOnboarding(true);
        } else {
          setShowOnboarding(true);
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
        setShowOnboarding(true);
        dataLoadedRef.current = true;
      }
    };
    loadData();
  }, [user]);

  const saveData = useCallback(async () => {
    if (!user) return;
    try {
      await Promise.all([
        savePlayer(user.uid, player),
        saveDailyQuests(user.uid, dailyQuests),
        saveHistory(user.uid, questHistory),
      ]);
    } catch (err) {
      console.error('Save to Firestore failed:', err);
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

  const completeOnboarding = async () => {
    const goalLabel = selectedPresetGoal
      ? presetGoals.find(g => g.id === selectedPresetGoal)!.label
      : newGoal.trim();

    if (!goalLabel) return;

    setGeneratingThemes(true);
    setPlayer(prev => ({ ...prev, goals: [], onboardingComplete: true }));
    setShowOnboarding(false);

    const goal = await generateThemesForGoal(goalLabel);
    setPlayer(prev => ({ ...prev, goals: [goal] }));

    setGeneratingThemes(false);
  };

  const addGoal = async () => {
    if (newGoal.trim()) {
      setGeneratingThemes(true);
      const goal = await generateThemesForGoal(newGoal.trim());
      setPlayer(prev => ({ ...prev, goals: [...(prev.goals || []), goal] }));
      setNewGoal('');
      setGeneratingThemes(false);
    }
  };

  const removeGoal = (goalId: string) => {
    setPlayer(prev => ({ ...prev, goals: (prev.goals || []).filter(g => g.id !== goalId) }));
  };

  const isPremium = player.premium === true;
  const questCount = isPremium ? 5 : 3;

  const generateQuests = async () => {
    setGenerating(true);
    try {
      const recentQuests = questHistory.slice(-15).map(q => q.title).join(', ');

      const goalsInfo = (player.goals || []).map(goal => {
        const themesInfo = goal.themes.map(t => {
          let suggestedDifficulty = 'easy';
          if (t.developmentLevel === 'medium') suggestedDifficulty = 'medium';
          if (t.developmentLevel === 'high' || t.developmentLevel === 'advanced') suggestedDifficulty = 'hard';

          return `${t.name} (${t.questsCompleted} quêtes, niveau: ${t.developmentLevel}, difficulté suggérée: ${suggestedDifficulty})`;
        }).join('\n  - ');
        return `Objectif "${goal.label}":\n  - ${themesInfo}`;
      }).join('\n\n');

      const hasGoals = player.goals && player.goals.length > 0;

      const generatedQuests = await generateQuestsFromAPI(recentQuests, goalsInfo, hasGoals, questCount);

      const newQuests: Quest[] = generatedQuests.map((q: any) => ({
        ...q,
        status: 'available' as const,
        isSelectedQuest: false
      }));

      setDailyQuests({
        quests: newQuests,
        selectedQuestId: null,
        date: new Date().toDateString(),
        questRefreshesUsed: 0
      });
    } catch (err) {
      alert('Erreur génération');
    }
    setGenerating(false);
  };

  const refreshQuests = async () => {
    const refreshesUsed = dailyQuests.questRefreshesUsed || 0;
    if (refreshesUsed >= 2) return;

    setGenerating(true);
    try {
      const refreshableQuests = dailyQuests.quests.filter(q => q.status === 'available' || q.status === 'bonus');
      const keptQuests = dailyQuests.quests.filter(q => q.status !== 'available' && q.status !== 'bonus');
      const countToGenerate = refreshableQuests.length;

      if (countToGenerate === 0) {
        setGenerating(false);
        return;
      }

      const recentQuests = [
        ...questHistory.slice(-15).map(q => q.title),
        ...keptQuests.map(q => q.title)
      ].join(', ');

      const goalsInfo = (player.goals || []).map(goal => {
        const themesInfo = goal.themes.map(t => {
          let suggestedDifficulty = 'easy';
          if (t.developmentLevel === 'medium') suggestedDifficulty = 'medium';
          if (t.developmentLevel === 'high' || t.developmentLevel === 'advanced') suggestedDifficulty = 'hard';

          return `${t.name} (${t.questsCompleted} quêtes, niveau: ${t.developmentLevel}, difficulté suggérée: ${suggestedDifficulty})`;
        }).join('\n  - ');
        return `Objectif "${goal.label}":\n  - ${themesInfo}`;
      }).join('\n\n');

      const hasGoals = player.goals && player.goals.length > 0;

      const generatedQuests = await generateQuestsFromAPI(recentQuests, goalsInfo, hasGoals, countToGenerate);

      const hasSelectedQuest = keptQuests.some(q => q.status === 'selected');
      const newQuests: Quest[] = generatedQuests.map((q: any) => ({
        ...q,
        status: hasSelectedQuest ? 'bonus' as const : 'available' as const,
        isSelectedQuest: false
      }));

      setDailyQuests(prev => ({
        ...prev,
        quests: [...keptQuests, ...newQuests],
        questRefreshesUsed: refreshesUsed + 1
      }));
    } catch (err) {
      alert('Erreur génération');
    }
    setGenerating(false);
  };

  const selectQuest = (questId: number) => {
    setDailyQuests(prev => {
      const updatedQuests = prev.quests.map(q => {
        if (q.id === questId) {
          return { ...q, status: 'selected' as const, isSelectedQuest: true };
        } else if (q.status === 'available') {
          return { ...q, status: 'bonus' as const, isSelectedQuest: false };
        }
        return q;
      });

      return {
        ...prev,
        quests: updatedQuests,
        selectedQuestId: questId
      };
    });
  };

  const updateThemeProgress = (goalId: string | null, themeId: string | null) => {
    if (!goalId || !themeId) return;

    setPlayer(prev => {
      const goals = prev.goals || [];
      const updatedGoals = goals.map(goal => {
        if (goal.id !== goalId) return goal;

        const updatedThemes = goal.themes.map(theme => {
          if (theme.id !== themeId) return theme;

          const newCount = theme.questsCompleted + 1;
          let newLevel: any = "none";
          if (newCount <= 3) newLevel = "low";
          else if (newCount <= 7) newLevel = "medium";
          else if (newCount <= 15) newLevel = "high";
          else newLevel = "advanced";

          return {
            ...theme,
            questsCompleted: newCount,
            lastTouched: new Date().toISOString(),
            developmentLevel: newLevel
          };
        });

        return { ...goal, themes: updatedThemes };
      });

      return { ...prev, goals: updatedGoals };
    });
  };

  const completeQuest = (questId: number) => {
    const quest = dailyQuests.quests.find(q => q.id === questId);
    if (!quest || quest.status === 'completed') return;

    if (quest.goalId && quest.themeId) {
      updateThemeProgress(quest.goalId, quest.themeId);
    }

    const isBonus = quest.status === 'bonus';
    const baseXP = difficultyXP[quest.difficulty];
    const xpGained = isBonus ? Math.floor(baseXP * BONUS_QUEST_MULTIPLIER) : baseXP;

    const newXp = player.xp + xpGained;
    let newLevel = player.level;
    let newXpToNext = player.xpToNext;
    let finalXp = newXp;
    let leveledUp = false;

    if (newXp >= player.xpToNext) {
      newLevel++;
      finalXp = newXp - player.xpToNext;
      newXpToNext = Math.floor(player.xpToNext * 1.2);
      leveledUp = true;
    }

    // Mise à jour du joueur
    const newPlayerData: Player = {
      ...player,
      level: newLevel,
      xp: finalXp,
      xpToNext: newXpToNext,
      questsCompleted: player.questsCompleted + 1,
      hardQuestsCompleted: player.hardQuestsCompleted + (quest.difficulty === 'hard' ? 1 : 0),
      perfectDays: player.perfectDays
    };

    const currentTitle = getPlayerTitle(newPlayerData.level);
    const previousTitle = getPlayerTitle(player.level);
    newPlayerData.name = currentTitle.name;

    // Mise à jour des quêtes
    const updatedQuests = dailyQuests.quests.map(q =>
      q.id === questId ? { ...q, status: 'completed' as const, completedAt: new Date().toISOString(), wasBonus: isBonus } : q
    );

    const completedCount = updatedQuests.filter(q => q.status === 'completed').length;
    const totalQuests = updatedQuests.length;
    const wasPerfectDay = completedCount === totalQuests;

    if (wasPerfectDay) {
      newPlayerData.perfectDays++;
      setPerfectDayPopup(true);
      setTimeout(() => setPerfectDayPopup(false), 5000);
    }

    setDailyQuests(prev => ({
      ...prev,
      quests: updatedQuests
    }));

    setQuestHistory(prev => [...prev, {
      title: quest.title,
      date: new Date().toISOString(),
      goalId: quest.goalId,
      themeId: quest.themeId,
      wasPerfectDay
    }]);

    checkBadges(newPlayerData);

    // Message de félicitation : IA personnalisée (premium) ou générique (freemium)
    if (isPremium) {
      generateQuestCompletionMessage(quest.title).then(msg => {
        if (msg) {
          setDailyQuests(prev => ({
            ...prev,
            quests: prev.quests.map(q =>
              q.id === questId ? { ...q, completionMessage: msg } : q
            )
          }));
        }
      });
    } else {
      const msg = genericCompletionMessages[Math.floor(Math.random() * genericCompletionMessages.length)];
      setDailyQuests(prev => ({
        ...prev,
        quests: prev.quests.map(q =>
          q.id === questId ? { ...q, completionMessage: msg } : q
        )
      }));
    }

    if (leveledUp) {
      generateLevelUpStory(newPlayerData, newLevel, currentTitle, previousTitle);
    } else {
      setPlayer(newPlayerData);
    }
  };

  const generateLevelUpStory = async (newPlayerData: Player, newLevel: number, currentTitle: any, previousTitle: any) => {
    setGeneratingStory(true);

    const recentQuests = questHistory.slice(-15);
    const previousChapters = (player.storyChapters || []).slice(-2);
    const goalsText = (player.goals || []).map(g => g.label).join(', ');

    try {
      const story = await generateLevelUpStoryFromAPI(newLevel, currentTitle, goalsText, recentQuests, previousChapters);

      const newChapter = {
        level: newLevel,
        title: currentTitle.name,
        story: story,
        date: new Date().toISOString()
      };

      const updatedPlayerData = {
        ...newPlayerData,
        storyChapters: [...(player.storyChapters || []), newChapter]
      };

      setPlayer(updatedPlayerData);

      setLevelUpPopup({
        level: newLevel,
        title: currentTitle,
        titleChanged: currentTitle.name !== previousTitle.name,
        story: story
      });
      setTimeout(() => setLevelUpPopup(null), 8000);
    } catch (err) {
      setPlayer(newPlayerData);
      setLevelUpPopup({
        level: newLevel,
        title: currentTitle,
        titleChanged: currentTitle.name !== previousTitle.name,
        story: null
      });
      setTimeout(() => setLevelUpPopup(null), 4000);
    }

    setGeneratingStory(false);
  };

  const currentTitle = getPlayerTitle(player.level);

  if (showOnboarding) {
    return (
      <OnboardingModal
        selectedPresetGoal={selectedPresetGoal}
        newGoal={newGoal}
        generatingThemes={generatingThemes}
        onSelectPresetGoal={(goalId) => {
          setSelectedPresetGoal(selectedPresetGoal === goalId ? null : goalId);
          setNewGoal('');
        }}
        onNewGoalChange={(value) => {
          setNewGoal(value);
          setSelectedPresetGoal(null);
        }}
        onComplete={completeOnboarding}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
            ⚔️ Kaizen Quest ⚔️
          </h1>
        </div>

        {/* Player Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border-2 border-purple-500/30">
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">{currentTitle.emoji} {player.name}</h2>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 text-gray-500 hover:text-gray-300 transition-colors"
                title="Paramètres"
              >
                <Settings size={20} />
              </button>
            </div>
            <p className="text-purple-300">Niveau {player.level}</p>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>XP</span>
              <span>{player.xp} / {player.xpToNext}</span>
            </div>
            <div className="h-4 bg-black/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                style={{ width: `${(player.xp / player.xpToNext) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => setShowHistory(true)} className="bg-pink-500/20 hover:bg-pink-500/30 rounded-lg p-4 transition-colors flex flex-col items-center gap-2">
              <Trophy className="text-pink-400" size={28} />
              <p className="text-xs text-gray-300">Histoire</p>
            </button>
            <button onClick={() => setShowGoals(true)} className="bg-purple-500/20 hover:bg-purple-500/30 rounded-lg p-4 transition-colors flex flex-col items-center gap-2">
              <Target className="text-purple-400" size={28} />
              <p className="text-xs text-gray-300">Objectifs</p>
            </button>
            <button onClick={() => setShowBadges(true)} className="bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg p-4 transition-colors flex flex-col items-center gap-2">
              <Award className="text-yellow-400" size={28} />
              <p className="text-xs text-gray-300">Succès</p>
            </button>
          </div>
        </div>

        {/* Daily Quests Section */}
        <div className="bg-white/5 rounded-2xl p-6 border-2 border-blue-500/30 mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Quêtes du jour</h2>
            {dailyQuests.quests.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                <Clock size={14} />
                <span>Prochaines quêtes dans {timeToReset}</span>
              </div>
            )}
          </div>

          {dailyQuests.quests.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg mb-2">Génère tes {questCount} quêtes quotidiennes</p>
              <p className="text-sm mb-6">Choisis-en 1 comme ta quête du jour, les {questCount - 1} autres seront des quêtes bonus (+50% XP)</p>
              <div className="flex justify-center">
                <button
                  onClick={generateQuests}
                  disabled={generating}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {generating ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Génération...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Générer mes quêtes
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <QuestSelection
              quests={dailyQuests.quests}
              selectedQuestId={dailyQuests.selectedQuestId}
              onSelectQuest={selectQuest}
              onCompleteQuest={completeQuest}
              isPremium={isPremium}
              refreshesUsed={dailyQuests.questRefreshesUsed || 0}
              refreshing={generating}
              onRefreshQuests={refreshQuests}
            />
          )}
        </div>

        {/* Popups */}
        {levelUpPopup && <LevelUpPopup data={levelUpPopup} generatingStory={generatingStory} />}
        {badgePopup && <BadgePopup badge={badgePopup} />}

        {perfectDayPopup && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50">
            <div className="bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 p-1 rounded-3xl animate-pulse">
              <div className="bg-slate-900 rounded-3xl p-8 text-center">
                <div className="text-8xl mb-4">🌟</div>
                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                  JOURNÉE PARFAITE !
                </h2>
                <p className="text-xl text-purple-300">Tu as complété toutes les quêtes aujourd'hui !</p>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        {showHistory && <HistoryModal storyChapters={player.storyChapters} onClose={() => setShowHistory(false)} />}
        {showBadges && <BadgesModal player={player} onClose={() => setShowBadges(false)} />}
        {showGoals && (
          <GoalsModal
            goals={player.goals}
            newGoal={newGoal}
            generatingThemes={generatingThemes}
            isPremium={isPremium}
            onClose={() => setShowGoals(false)}
            onNewGoalChange={setNewGoal}
            onAddGoal={addGoal}
            onRemoveGoal={removeGoal}
          />
        )}
        {showSettings && (
          <SettingsModal
            onClose={() => setShowSettings(false)}
            isPremium={isPremium}
            onTogglePremium={() => setPlayer(prev => ({ ...prev, premium: !prev.premium }))}
          />
        )}
      </div>
    </div>
  );
};

export default KaizenQuest;
