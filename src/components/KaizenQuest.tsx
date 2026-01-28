import { useState, useEffect } from 'react';
import { Sparkles, Zap, Plus, Trophy, Award, Target, Loader2 } from 'lucide-react';

// Types
import type {
  Player, Quests, QuestHistory, LastReset, Badge,
  CategoryType, DifficultyLevel, QuestType, LevelUpPopupData
} from '../types/types';

// Constants & Utils
import {
  difficultyXP, ritualXP, categories, presetGoals, allBadges
} from '../utils/constants';
import {
  getWeekStart, getPlayerTitle, generateThemesForGoal,
  generateRitualsFromAPI, generateQuestsFromAPI, generateLevelUpStoryFromAPI
} from '../utils/utils';

// Components
import QuestCard from './QuestCard';
import OnboardingModal from './OnboardingModal';
import LevelUpPopup from './LevelUpPopup';
import BadgePopup from './BadgePopup';
import RitualsModal from './RitualsModal';
import BadgesModal from './BadgesModal';
import GoalsModal from './GoalsModal';
import HistoryModal from './HistoryModal';
import NewQuestModal from './NewQuestModal';

const KaizenQuest = () => {
  const [player, setPlayer] = useState<Player>({
    name: "Aventurier",
    level: 1,
    xp: 0,
    xpToNext: 100,
    stats: { body: 0, mind: 0, environment: 0, projects: 0, social: 0 },
    badges: [],
    questsCompleted: 0,
    hardQuestsCompleted: 0,
    dailyStreak: 0,
    lastCompletionDate: null,
    goals: [],
    rituals: [],
    storyChapters: [],
    onboardingComplete: false
  });

  const [quests, setQuests] = useState<Quests>({ daily: [], weekly: [], main: [] });
  const [questHistory, setQuestHistory] = useState<QuestHistory[]>([]);
  const [lastReset, setLastReset] = useState<LastReset>({
    daily: new Date().toDateString(),
    weekly: getWeekStart()
  });

  const [showNewQuest, setShowNewQuest] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [showRituals, setShowRituals] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingRituals, setGeneratingRituals] = useState(false);
  const [generatingStory, setGeneratingStory] = useState(false);
  const [levelUpPopup, setLevelUpPopup] = useState<LevelUpPopupData | null>(null);
  const [badgePopup, setBadgePopup] = useState<Badge | null>(null);

  const [newQuest, setNewQuest] = useState<{
    title: string;
    category: CategoryType;
    difficulty: DifficultyLevel;
    type: QuestType;
  }>({ title: '', category: 'body', difficulty: 'easy', type: 'daily' });

  const [newRitual, setNewRitual] = useState<{ title: string; category: CategoryType }>({
    title: '',
    category: 'body'
  });

  const [newGoal, setNewGoal] = useState('');
  const [selectedPresetGoals, setSelectedPresetGoals] = useState<string[]>([]);

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

  useEffect(() => {
    const checkResets = () => {
      const now = new Date();
      const today = now.toDateString();
      const currentWeek = getWeekStart();

      if (lastReset.daily !== today) {
        setQuests(prev => ({ ...prev, daily: [] }));
        setPlayer(prev => ({
          ...prev,
          rituals: (prev.rituals || []).map(r => ({ ...r, completedToday: false }))
        }));
        setLastReset(prev => ({ ...prev, daily: today }));
      }
      if (lastReset.weekly !== currentWeek) {
        setQuests(prev => ({ ...prev, weekly: [] }));
        setLastReset(prev => ({ ...prev, weekly: currentWeek }));
      }
    };

    checkResets();
    const interval = setInterval(checkResets, 60000);
    return () => clearInterval(interval);
  }, [lastReset]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const playerData = await (window as any).storage.get('kaizen-player');
        const questsData = await (window as any).storage.get('kaizen-quests');
        const historyData = await (window as any).storage.get('kaizen-history');
        const resetData = await (window as any).storage.get('kaizen-reset');

        if (playerData) {
          const loadedPlayer = JSON.parse(playerData.value);
          setPlayer(loadedPlayer);
          if (!loadedPlayer.onboardingComplete) setShowOnboarding(true);
        } else {
          setShowOnboarding(true);
        }

        if (questsData) setQuests(JSON.parse(questsData.value));
        if (historyData) setQuestHistory(JSON.parse(historyData.value));
        if (resetData) setLastReset(JSON.parse(resetData.value));
      } catch (err) {
        setShowOnboarding(true);
      }
    };
    loadData();
  }, []);

  const saveData = async () => {
    try {
      await (window as any).storage.set('kaizen-player', JSON.stringify(player));
      await (window as any).storage.set('kaizen-quests', JSON.stringify(quests));
      await (window as any).storage.set('kaizen-history', JSON.stringify(questHistory));
      await (window as any).storage.set('kaizen-reset', JSON.stringify(lastReset));
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  useEffect(() => {
    if (player.onboardingComplete) saveData();
  }, [player, quests, questHistory, lastReset]);

  const completeOnboarding = () => {
    const goals = [
      ...selectedPresetGoals.map(id => presetGoals.find(g => g.id === id)!.label),
      ...(newGoal ? [newGoal] : [])
    ];

    setPlayer(prev => ({ ...prev, goals: [], onboardingComplete: true }));
    setShowOnboarding(false);

    goals.forEach(goal => generateThemesForGoal(goal).then(newGoal => {
      setPlayer(prev => ({ ...prev, goals: [...(prev.goals || []), newGoal] }));
    }));
  };

  const addGoal = async () => {
    if (newGoal.trim()) {
      const goal = await generateThemesForGoal(newGoal.trim());
      setPlayer(prev => ({ ...prev, goals: [...(prev.goals || []), goal] }));
      setNewGoal('');
    }
  };

  const removeGoal = (goalId: string) => {
    setPlayer(prev => ({ ...prev, goals: (prev.goals || []).filter(g => g.id !== goalId) }));
  };

  const generateRituals = async () => {
    setGeneratingRituals(true);
    try {
      const goalsText = (player.goals || []).map(g => g.label).join(', ');
      const newRituals = await generateRitualsFromAPI(goalsText);
      setPlayer(prev => ({ ...prev, rituals: [...(prev.rituals || []), ...newRituals] }));
    } catch (err) {
      alert('Erreur génération');
    }
    setGeneratingRituals(false);
  };

  const addRitual = () => {
    const ritual = {
      id: Date.now(),
      title: newRitual.title,
      category: newRitual.category,
      streak: 0,
      completedToday: false
    };
    setPlayer(prev => ({ ...prev, rituals: [...(prev.rituals || []), ritual] }));
    setNewRitual({ title: '', category: 'body' });
  };

  const toggleRitual = (ritualId: number) => {
    const ritual = (player.rituals || []).find(r => r.id === ritualId);
    if (!ritual) return;

    const today = new Date().toDateString();
    const xpGained = ritual.completedToday ? -ritualXP : ritualXP;
    const newCompleted = !ritual.completedToday;

    let newStreak = ritual.streak;
    if (newCompleted && !ritual.completedToday) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      newStreak = ritual.lastCompletedDate === yesterday.toDateString() ? newStreak + 1 : 1;
    } else if (!newCompleted) {
      newStreak = Math.max(0, ritual.streak - 1);
    }

    setPlayer(prev => ({
      ...prev,
      xp: prev.xp + xpGained,
      stats: { ...prev.stats, [ritual.category]: prev.stats[ritual.category] + xpGained },
      rituals: (prev.rituals || []).map(r =>
        r.id === ritualId
          ? { ...r, completedToday: newCompleted, streak: newStreak, lastCompletedDate: newCompleted ? today : r.lastCompletedDate }
          : r
      )
    }));
  };

  const deleteRitual = (ritualId: number) => {
    setPlayer(prev => ({ ...prev, rituals: (prev.rituals || []).filter(r => r.id !== ritualId) }));
  };

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

      const newDailyQuests = await generateQuestsFromAPI(recentQuests, goalsInfo, hasGoals);

      setQuests(prev => ({ ...prev, daily: [...prev.daily, ...newDailyQuests] }));
      setQuestHistory(prev => [...prev, ...newDailyQuests.map(q => ({
        title: q.title,
        date: new Date().toISOString(),
        goalId: q.goalId,
        themeId: q.themeId
      }))]);
    } catch (err) {
      alert('Erreur génération');
    }
    setGenerating(false);
  };

  const addQuest = () => {
    const quest = {
      id: Date.now(),
      title: newQuest.title,
      category: newQuest.category,
      difficulty: newQuest.difficulty,
      completed: false,
      type: newQuest.type,
      goalId: null,
      themeId: null
    };
    setQuests(prev => ({ ...prev, [newQuest.type]: [...prev[newQuest.type], quest] }));
    setQuestHistory(prev => [...prev, { title: quest.title, date: new Date().toISOString(), goalId: null, themeId: null }]);
    setNewQuest({ title: '', category: 'body', difficulty: 'easy', type: 'daily' });
    setShowNewQuest(false);
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

  const completeQuest = (questId: number, type: QuestType) => {
    const quest = quests[type].find(q => q.id === questId);
    if (!quest || quest.completed) return;

    if (quest.goalId && quest.themeId) {
      updateThemeProgress(quest.goalId, quest.themeId);
    }

    const xpGained = difficultyXP[quest.difficulty];
    const newXp = player.xp + xpGained;
    let newLevel = player.level;
    let newXpToNext = player.xpToNext;
    let finalXp = newXp;
    let leveledUp = false;

    if (newXp >= player.xpToNext) {
      newLevel++;
      finalXp = newXp - player.xpToNext;
      newXpToNext = Math.floor(player.xpToNext * 1.5);
      leveledUp = true;
    }

    const today = new Date().toDateString();
    let newStreak = player.dailyStreak;
    if (player.lastCompletionDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      newStreak = player.lastCompletionDate === yesterday.toDateString() ? newStreak + 1 : 1;
    }

    const newPlayerData: Player = {
      ...player,
      level: newLevel,
      xp: finalXp,
      xpToNext: newXpToNext,
      stats: { ...player.stats, [quest.category]: player.stats[quest.category] + xpGained },
      questsCompleted: player.questsCompleted + 1,
      hardQuestsCompleted: player.hardQuestsCompleted + (quest.difficulty === 'hard' ? 1 : 0),
      dailyStreak: newStreak,
      lastCompletionDate: today
    };

    const currentTitle = getPlayerTitle(newPlayerData.level);
    const previousTitle = getPlayerTitle(player.level);
    newPlayerData.name = currentTitle.name;

    checkBadges(newPlayerData);

    if (leveledUp) {
      generateLevelUpStory(newPlayerData, newLevel, currentTitle, previousTitle);
    } else {
      setPlayer(newPlayerData);
    }

    setQuests(prev => ({
      ...prev,
      [type]: prev[type].map(q => q.id === questId ? { ...q, completed: true } : q)
    }));
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

  const deleteQuest = (questId: number, type: QuestType) => {
    setQuests(prev => ({ ...prev, [type]: prev[type].filter(q => q.id !== questId) }));
  };

  const currentTitle = getPlayerTitle(player.level);

  if (showOnboarding) {
    return (
      <OnboardingModal
        selectedPresetGoals={selectedPresetGoals}
        newGoal={newGoal}
        onTogglePresetGoal={(goalId) => {
          if (selectedPresetGoals.includes(goalId)) {
            setSelectedPresetGoals(selectedPresetGoals.filter(id => id !== goalId));
          } else {
            setSelectedPresetGoals([...selectedPresetGoals, goalId]);
          }
        }}
        onNewGoalChange={setNewGoal}
        onComplete={completeOnboarding}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-pulse">⚔️ Kaizen Quest ⚔️</h1>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border-2 border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold">{currentTitle.emoji} {player.name}</h2>
              <p className="text-purple-300">Niveau {player.level}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowHistory(true)} className="px-4 py-2 bg-pink-500/20 hover:bg-pink-500/30 rounded-lg z-10">
                <Trophy className="text-pink-400" size={24} />
              </button>
              <button onClick={() => setShowRituals(true)} className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg z-10">
                <Sparkles className="text-blue-400" size={24} />
              </button>
              <button onClick={() => setShowGoals(true)} className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg z-10">
                <Target size={24} />
              </button>
              <button onClick={() => setShowBadges(true)} className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg z-10">
                <Award className="text-yellow-400" size={24} />
              </button>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>XP</span>
              <span>{player.xp} / {player.xpToNext}</span>
            </div>
            <div className="h-4 bg-black/30 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500" style={{ width: `${(player.xp / player.xpToNext) * 100}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {Object.entries(categories).map(([key, cat]) => {
              const Icon = cat.icon;
              return (
                <div key={key} className="bg-black/20 rounded-lg p-3">
                  <Icon className={cat.color} size={20} />
                  <p className="text-xs text-gray-400 mt-1">{cat.name}</p>
                  <p className="text-lg font-bold">{player.stats[key as CategoryType]}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 rounded-2xl p-6 border-2 border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Zap className="text-yellow-400" />
                Quêtes Quotidiennes
              </h2>
              <button onClick={generateQuests} disabled={generating} className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex items-center gap-2 disabled:opacity-50">
                {generating ? <><Loader2 className="animate-spin" size={18} />Génération...</> : <><Sparkles size={18} />Générer</>}
              </button>
            </div>
            <div className="space-y-3">
              {quests.daily.length === 0 ? <p className="text-center text-gray-400 py-8">Aucune quête</p> : quests.daily.map(q => <QuestCard key={q.id} quest={q} type="daily" onComplete={completeQuest} onDelete={deleteQuest} />)}
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border-2 border-green-500/30">
            <h2 className="text-2xl font-bold mb-4">Quêtes Hebdomadaires</h2>
            <div className="space-y-3">
              {quests.weekly.length === 0 ? <p className="text-center text-gray-400 py-8">Aucune quête</p> : quests.weekly.map(q => <QuestCard key={q.id} quest={q} type="weekly" onComplete={completeQuest} onDelete={deleteQuest} />)}
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border-2 border-purple-500/30">
            <h2 className="text-2xl font-bold mb-4">Quêtes Principales</h2>
            <div className="space-y-3">
              {quests.main.length === 0 ? <p className="text-center text-gray-400 py-8">Aucune quête</p> : quests.main.map(q => <QuestCard key={q.id} quest={q} type="main" onComplete={completeQuest} onDelete={deleteQuest} />)}
            </div>
          </div>
        </div>

        <button onClick={() => setShowNewQuest(true)} className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-2xl flex items-center justify-center">
          <Plus size={32} />
        </button>

        {levelUpPopup && <LevelUpPopup data={levelUpPopup} generatingStory={generatingStory} />}
        {badgePopup && <BadgePopup badge={badgePopup} />}
        {showHistory && <HistoryModal storyChapters={player.storyChapters} onClose={() => setShowHistory(false)} />}
        {showRituals && (
          <RitualsModal
            rituals={player.rituals}
            newRitual={newRitual}
            generatingRituals={generatingRituals}
            onClose={() => setShowRituals(false)}
            onToggleRitual={toggleRitual}
            onDeleteRitual={deleteRitual}
            onNewRitualChange={setNewRitual}
            onAddRitual={addRitual}
            onGenerateRituals={generateRituals}
          />
        )}
        {showBadges && <BadgesModal player={player} onClose={() => setShowBadges(false)} />}
        {showGoals && (
          <GoalsModal
            goals={player.goals}
            newGoal={newGoal}
            onClose={() => setShowGoals(false)}
            onNewGoalChange={setNewGoal}
            onAddGoal={addGoal}
            onRemoveGoal={removeGoal}
          />
        )}
        {showNewQuest && (
          <NewQuestModal
            newQuest={newQuest}
            onClose={() => setShowNewQuest(false)}
            onQuestChange={setNewQuest}
            onAddQuest={addQuest}
          />
        )}
      </div>
    </div>
  );
};

export default KaizenQuest;
