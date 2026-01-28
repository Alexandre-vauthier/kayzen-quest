import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, Heart, Brain, Target, Users, Plus, Check, X, Loader2, Home, Briefcase, Award, Trophy } from 'lucide-react';

const KaizenQuest = () => {
  const [player, setPlayer] = useState({
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

  const [quests, setQuests] = useState({ daily: [], weekly: [], main: [] });
  const [questHistory, setQuestHistory] = useState([]);
  const [lastReset, setLastReset] = useState({
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
  const [levelUpPopup, setLevelUpPopup] = useState(null);
  const [badgePopup, setBadgePopup] = useState(null);
  
  const [newQuest, setNewQuest] = useState({ title: '', category: 'body', difficulty: 'easy', type: 'daily' });
  const [newRitual, setNewRitual] = useState({ title: '', category: 'body' });
  const [newGoal, setNewGoal] = useState('');
  const [selectedPresetGoals, setSelectedPresetGoals] = useState([]);

  const difficultyXP = { easy: 10, medium: 25, hard: 50 };
  const ritualXP = 5;

  const categories = {
    body: { icon: Heart, color: 'text-red-400', name: 'Corps' },
    mind: { icon: Brain, color: 'text-purple-400', name: 'Esprit' },
    environment: { icon: Home, color: 'text-green-400', name: 'Environnement' },
    projects: { icon: Briefcase, color: 'text-blue-400', name: 'Projets' },
    social: { icon: Users, color: 'text-yellow-400', name: 'Social' }
  };

  const titles = [
    { maxLevel: 5, name: 'Aventurier', emoji: '🌱' },
    { maxLevel: 10, name: 'Disciple', emoji: '🎋' },
    { maxLevel: 15, name: 'Voyageur', emoji: '🗺️' },
    { maxLevel: 20, name: 'Maître', emoji: '⛩️' },
    { maxLevel: 30, name: 'Sage', emoji: '🧘' },
    { maxLevel: Infinity, name: 'Légende', emoji: '✨' }
  ];

  const presetGoals = [
    { id: 'fitness', label: 'Être en meilleure forme physique', emoji: '💪' },
    { id: 'creative', label: 'Être plus créatif', emoji: '🎨' },
    { id: 'organized', label: 'Être plus organisé', emoji: '📋' },
    { id: 'learning', label: 'Apprendre et me cultiver', emoji: '📚' },
    { id: 'social', label: 'Développer ma vie sociale', emoji: '👥' },
    { id: 'career', label: 'Faire avancer ma carrière', emoji: '💼' },
    { id: 'wellness', label: 'Prendre soin de mon bien-être mental', emoji: '🧘' },
    { id: 'financial', label: 'Améliorer mes finances', emoji: '💰' },
  ];

  const allBadges = [
    { id: 'first-quest', name: 'Premier Pas', emoji: '🔥', description: 'Première quête', condition: (p) => p.questsCompleted >= 1 },
    { id: 'streak-7', name: 'Régularité', emoji: '📅', description: '7 jours consécutifs', condition: (p) => p.dailyStreak >= 7 },
    { id: 'body-100', name: 'Athlète', emoji: '💪', description: '100 XP Corps', condition: (p) => p.stats.body >= 100 },
    { id: 'mind-100', name: 'Érudit', emoji: '🧠', description: '100 XP Esprit', condition: (p) => p.stats.mind >= 100 },
    { id: 'env-100', name: 'Organisé', emoji: '🏠', description: '100 XP Environnement', condition: (p) => p.stats.environment >= 100 },
    { id: 'proj-100', name: 'Productif', emoji: '💼', description: '100 XP Projets', condition: (p) => p.stats.projects >= 100 },
    { id: 'social-100', name: 'Social', emoji: '👥', description: '100 XP Social', condition: (p) => p.stats.social >= 100 },
    { id: 'hard-10', name: 'Perfectionniste', emoji: '🌟', description: '10 quêtes difficiles', condition: (p) => p.hardQuestsCompleted >= 10 },
    { id: 'total-50', name: 'Conquérant', emoji: '🎯', description: '50 quêtes', condition: (p) => p.questsCompleted >= 50 },
    { id: 'level-10', name: 'Légende', emoji: '🏆', description: 'Niveau 10', condition: (p) => p.level >= 10 },
  ];

  function getWeekStart() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff)).toDateString();
  }

  function getPlayerTitle(level) {
    return titles.find(t => level <= t.maxLevel) || titles[titles.length - 1];
  }

  const checkBadges = (newPlayerData) => {
    if (!newPlayerData.badges) newPlayerData.badges = [];
    const newBadges = [];
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
        const playerData = await window.storage.get('kaizen-player');
        const questsData = await window.storage.get('kaizen-quests');
        const historyData = await window.storage.get('kaizen-history');
        const resetData = await window.storage.get('kaizen-reset');
        
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
      await window.storage.set('kaizen-player', JSON.stringify(player));
      await window.storage.set('kaizen-quests', JSON.stringify(quests));
      await window.storage.set('kaizen-history', JSON.stringify(questHistory));
      await window.storage.set('kaizen-reset', JSON.stringify(lastReset));
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  useEffect(() => {
    if (player.onboardingComplete) saveData();
  }, [player, quests, questHistory, lastReset]);

  const generateThemesForGoal = async (goalLabel) => {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 800,
          messages: [{
            role: "user",
            content: `Analyse: "${goalLabel}"

Identifie 2-10 thèmes essentiels.

JSON:
{"themes": [{"id": "id", "name": "Nom"}]}`
          }]
        })
      });

      const data = await response.json();
      const text = data.content[0].text.trim().replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(text);

      const newGoal = {
        id: `goal-${Date.now()}`,
        label: goalLabel,
        themes: parsed.themes.map(t => ({
          ...t,
          questsCompleted: 0,
          lastTouched: null,
          developmentLevel: "none"
        })),
        createdAt: new Date().toISOString()
      };

      setPlayer(prev => ({ ...prev, goals: [...(prev.goals || []), newGoal] }));
    } catch (err) {
      console.error('Theme gen failed');
    }
  };

  const completeOnboarding = () => {
    const goals = [
      ...selectedPresetGoals.map(id => presetGoals.find(g => g.id === id).label),
      ...(newGoal ? [newGoal] : [])
    ];
    
    setPlayer(prev => ({ ...prev, goals: [], onboardingComplete: true }));
    setShowOnboarding(false);
    
    goals.forEach(goal => generateThemesForGoal(goal));
  };

  const addGoal = async () => {
    if (newGoal.trim()) {
      await generateThemesForGoal(newGoal.trim());
      setNewGoal('');
    }
  };

  const removeGoal = (goalId) => {
    setPlayer(prev => ({ ...prev, goals: (prev.goals || []).filter(g => g.id !== goalId) }));
  };

  const generateRituals = async () => {
    setGeneratingRituals(true);
    try {
      const goalsText = (player.goals || []).map(g => g.label).join(', ');
      
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Suggère 5 rituels quotidiens (< 5min).

Objectifs: ${goalsText || 'amélioration générale'}

JSON:
{"rituals": [{"title": "Action", "category": "body|mind|environment|projects|social"}]}`
          }]
        })
      });

      const data = await response.json();
      const text = data.content[0].text.trim().replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(text);

      const newRituals = parsed.rituals.map((r, i) => ({
        id: Date.now() + i,
        title: r.title,
        category: r.category,
        streak: 0,
        completedToday: false
      }));

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

  const toggleRitual = (ritualId) => {
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

  const deleteRitual = (ritualId) => {
    setPlayer(prev => ({ ...prev, rituals: (prev.rituals || []).filter(r => r.id !== ritualId) }));
  };

  const generateQuests = async () => {
    setGenerating(true);
    try {
      const recentQuests = questHistory.slice(-15).map(q => q.title).join(', ');
      
      const goalsInfo = (player.goals || []).map(goal => {
        const themesInfo = goal.themes.map(t => {
          // Déterminer la difficulté recommandée selon le niveau
          let suggestedDifficulty = 'easy';
          if (t.developmentLevel === 'medium') suggestedDifficulty = 'medium';
          if (t.developmentLevel === 'high' || t.developmentLevel === 'advanced') suggestedDifficulty = 'hard';
          
          return `${t.name} (${t.questsCompleted} quêtes, niveau: ${t.developmentLevel}, difficulté suggérée: ${suggestedDifficulty})`;
        }).join('\n  - ');
        return `Objectif "${goal.label}":\n  - ${themesInfo}`;
      }).join('\n\n');

      const hasGoals = player.goals && player.goals.length > 0;
      
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: `Génère 3 quêtes quotidiennes. JSON uniquement.

${hasGoals ? `${goalsInfo}

RÈGLE CRUCIALE - Difficulté adaptée au niveau:
- Thèmes "none" ou "low" (0-3 quêtes) → difficulté FACILE (découverte)
- Thèmes "medium" (4-7 quêtes) → difficulté MOYENNE (progression)
- Thèmes "high" ou "advanced" (8+ quêtes) → difficulté DIFFICILE (challenge)

La difficulté doit correspondre au niveau de développement du thème !

Priorité aux thèmes peu développés. Varie les thèmes.` : 'Amélioration générale, 1 facile, 1 moyen, 1 difficile'}

Éviter: ${recentQuests || 'aucune'}

Format:
{"quests": [{"title": "Action", "category": "body|mind|environment|projects|social", "difficulty": "easy|medium|hard"${hasGoals ? ', "goalId": "goal-XXX", "themeId": "theme-id"' : ''}}, ...]}

${!hasGoals ? '1 facile, 1 moyen, 1 difficile.' : ''}`
          }]
        })
      });

      const data = await response.json();
      const text = data.content[0].text.trim().replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(text);

      const newDailyQuests = parsed.quests.map((q, i) => ({
        id: Date.now() + i,
        title: q.title,
        category: q.category,
        difficulty: q.difficulty,
        completed: false,
        type: 'daily',
        goalId: q.goalId || null,
        themeId: q.themeId || null
      }));

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

  const updateThemeProgress = (goalId, themeId) => {
    if (!goalId || !themeId) return;

    setPlayer(prev => {
      const goals = prev.goals || [];
      const updatedGoals = goals.map(goal => {
        if (goal.id !== goalId) return goal;

        const updatedThemes = goal.themes.map(theme => {
          if (theme.id !== themeId) return theme;

          const newCount = theme.questsCompleted + 1;
          let newLevel = "none";
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

  const completeQuest = (questId, type) => {
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

    const newPlayerData = {
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

  const generateLevelUpStory = async (newPlayerData, newLevel, currentTitle, previousTitle) => {
    setGeneratingStory(true);
    
    const recentQuests = questHistory.slice(-15);
    const previousChapters = (player.storyChapters || []).slice(-2);
    const goalsText = (player.goals || []).map(g => g.label).join(', ');

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          messages: [{
            role: "user",
            content: `Niveau ${newLevel} (${currentTitle.name}).

Objectifs: ${goalsText || 'Amélioration'}

Quêtes:
${recentQuests.map(q => `- ${q.title}`).join('\n')}

${previousChapters.length > 0 ? `Précédents:
${previousChapters.map(ch => `${ch.level}: "${ch.story.substring(0, 80)}..."`).join('\n')}` : ''}

Récit court (3-5 phrases), ton zen, pas de liste, progression visible.

Uniquement le récit.`
          }]
        })
      });

      const data = await response.json();
      const story = data.content[0].text.trim();

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

  const deleteQuest = (questId, type) => {
    setQuests(prev => ({ ...prev, [type]: prev[type].filter(q => q.id !== questId) }));
  };

  const QuestCard = ({ quest, type }) => {
    const CategoryIcon = categories[quest.category].icon;
    const difficultyColors = {
      easy: 'border-green-500/30 bg-green-500/5',
      medium: 'border-yellow-500/30 bg-yellow-500/5',
      hard: 'border-red-500/30 bg-red-500/5'
    };

    return (
      <div className={`border-2 rounded-lg p-4 ${difficultyColors[quest.difficulty]} ${quest.completed ? 'opacity-50' : ''} transition-all hover:scale-[1.02]`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <CategoryIcon className={`${categories[quest.category].color} mt-1`} size={20} />
            <div className="flex-1">
              <h3 className={`font-semibold ${quest.completed ? 'line-through' : ''}`}>{quest.title}</h3>
              <div className="flex gap-2 mt-2 text-xs">
                <span className="px-2 py-1 rounded bg-white/10">{categories[quest.category].name}</span>
                <span className="px-2 py-1 rounded bg-white/10">+{difficultyXP[quest.difficulty]} XP</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {!quest.completed && (
              <button onClick={() => completeQuest(quest.id, type)} className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors">
                <Check size={18} />
              </button>
            )}
            <button onClick={() => deleteQuest(quest.id, type)} className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const currentTitle = getPlayerTitle(player.level);
  const unlockedBadges = allBadges.filter(b => player.badges && player.badges.includes(b.id));

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">Bienvenue, Aventurier</h1>
            <p className="text-xl text-purple-300">Avant de commencer...</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border-2 border-purple-500/30">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Target className="text-purple-400" />
              Qui veux-tu devenir ?
            </h2>
            <p className="text-gray-300 mb-6">Choisis tes objectifs</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {presetGoals.map(goal => (
                <button
                  key={goal.id}
                  onClick={() => {
                    if (selectedPresetGoals.includes(goal.id)) {
                      setSelectedPresetGoals(selectedPresetGoals.filter(id => id !== goal.id));
                    } else {
                      setSelectedPresetGoals([...selectedPresetGoals, goal.id]);
                    }
                  }}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedPresetGoals.includes(goal.id)
                      ? 'bg-purple-500/30 border-purple-500'
                      : 'bg-white/5 border-white/20 hover:border-purple-500/50'
                  }`}
                >
                  <span className="text-2xl mr-2">{goal.emoji}</span>
                  <span className="font-semibold">{goal.label}</span>
                </button>
              ))}
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Ou ton propre objectif:</label>
              <input
                type="text"
                placeholder="Ex: Voyage au Japon..."
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                className="w-full bg-white/10 rounded-lg px-4 py-3 border border-white/20 focus:border-purple-500 outline-none"
              />
            </div>
            <button
              onClick={completeOnboarding}
              disabled={selectedPresetGoals.length === 0 && !newGoal.trim()}
              className="w-full py-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-bold text-lg transition-all disabled:opacity-50"
            >
              Commencer ✨
            </button>
          </div>
        </div>
      </div>
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
                  <p className="text-lg font-bold">{player.stats[key]}</p>
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
              {quests.daily.length === 0 ? <p className="text-center text-gray-400 py-8">Aucune quête</p> : quests.daily.map(q => <QuestCard key={q.id} quest={q} type="daily" />)}
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border-2 border-green-500/30">
            <h2 className="text-2xl font-bold mb-4">Quêtes Hebdomadaires</h2>
            <div className="space-y-3">
              {quests.weekly.length === 0 ? <p className="text-center text-gray-400 py-8">Aucune quête</p> : quests.weekly.map(q => <QuestCard key={q.id} quest={q} type="weekly" />)}
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-6 border-2 border-purple-500/30">
            <h2 className="text-2xl font-bold mb-4">Quêtes Principales</h2>
            <div className="space-y-3">
              {quests.main.length === 0 ? <p className="text-center text-gray-400 py-8">Aucune quête</p> : quests.main.map(q => <QuestCard key={q.id} quest={q} type="main" />)}
            </div>
          </div>
        </div>

        <button onClick={() => setShowNewQuest(true)} className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-2xl flex items-center justify-center">
          <Plus size={32} />
        </button>

        {levelUpPopup && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50">
            <div className="bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 p-1 rounded-3xl max-w-2xl w-full">
              <div className="bg-slate-900 rounded-3xl p-8">
                <div className="text-center">
                  <div className="text-8xl mb-4 animate-pulse">{levelUpPopup.title.emoji}</div>
                  <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                    NIVEAU {levelUpPopup.level} !
                  </h2>
                  {levelUpPopup.titleChanged && <p className="text-2xl text-purple-300 mt-2 mb-4">Tu es {levelUpPopup.title.name} !</p>}
                </div>
                {levelUpPopup.story ? (
                  <div className="mt-6 p-6 bg-white/5 rounded-2xl">
                    <p className="text-lg leading-relaxed italic">{levelUpPopup.story}</p>
                  </div>
                ) : generatingStory && (
                  <div className="mt-6 flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    <span>Génération...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {badgePopup && (
          <div className="fixed top-6 right-6 z-50">
            <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-600 p-1 rounded-2xl">
              <div className="bg-slate-900 rounded-2xl p-6 flex items-center gap-4">
                <div className="text-5xl animate-bounce">{badgePopup.emoji}</div>
                <div>
                  <p className="text-xs text-yellow-400 font-bold">BADGE !</p>
                  <h3 className="text-xl font-bold">{badgePopup.name}</h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {showHistory && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl max-w-3xl w-full border-2 border-pink-500/50 max-h-[85vh] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h3 className="text-3xl font-bold flex items-center gap-3">
                  <Trophy className="text-pink-400" />
                  Mon Histoire
                </h3>
                <button onClick={() => setShowHistory(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                {player.storyChapters && player.storyChapters.length > 0 ? (
                  <div className="space-y-6">
                    {player.storyChapters.map((ch, i) => {
                      const chTitle = titles.find(t => ch.level <= t.maxLevel) || titles[titles.length - 1];
                      return (
                        <div key={i} className="bg-white/5 rounded-2xl p-6 border-2 border-white/10">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-4xl">{chTitle.emoji}</span>
                            <div>
                              <h4 className="text-xl font-bold">Niveau {ch.level} - {ch.title}</h4>
                              <p className="text-xs text-gray-400">{new Date(ch.date).toLocaleDateString('fr-FR')}</p>
                            </div>
                          </div>
                          <p className="text-gray-200 leading-relaxed italic">{ch.story}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400">Ton histoire commence...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {showRituals && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl max-w-2xl w-full border-2 border-blue-500/50 max-h-[85vh] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h3 className="text-3xl font-bold">Rituels</h3>
                <button onClick={() => setShowRituals(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                {player.rituals && player.rituals.length > 0 && (
                  <div className="space-y-3 mb-6">
                    {player.rituals.map(ritual => {
                      const Icon = categories[ritual.category].icon;
                      return (
                        <div key={ritual.id} className={`flex items-center justify-between bg-white/10 rounded-lg p-4 border-2 ${ritual.completedToday ? 'border-green-500/50' : 'border-white/20'}`}>
                          <div className="flex items-center gap-3 flex-1">
                            <button onClick={() => toggleRitual(ritual.id)} className={`w-6 h-6 rounded border-2 flex items-center justify-center ${ritual.completedToday ? 'bg-green-500 border-green-500' : 'border-white/40'}`}>
                              {ritual.completedToday && <Check size={16} />}
                            </button>
                            <Icon className={categories[ritual.category].color} size={20} />
                            <div className="flex-1">
                              <h4 className={ritual.completedToday ? 'line-through' : ''}>{ritual.title}</h4>
                              {ritual.streak > 0 && <p className="text-xs text-orange-400">🔥 {ritual.streak}</p>}
                            </div>
                          </div>
                          <button onClick={() => deleteRitual(ritual.id)}>
                            <X size={18} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
                <input type="text" placeholder="Nouveau rituel..." value={newRitual.title} onChange={(e) => setNewRitual(prev => ({ ...prev, title: e.target.value }))} className="w-full bg-white/10 rounded-lg px-4 py-3 mb-3 border border-white/20 outline-none" />
                <select value={newRitual.category} onChange={(e) => setNewRitual(prev => ({ ...prev, category: e.target.value }))} className="w-full bg-white/10 rounded-lg px-4 py-3 mb-3 border border-white/20 outline-none">
                  {Object.entries(categories).map(([key, cat]) => (
                    <option key={key} value={key}>{cat.name}</option>
                  ))}
                </select>
                <div className="flex gap-3">
                  <button onClick={addRitual} disabled={!newRitual.title.trim()} className="flex-1 px-4 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50">
                    Ajouter
                  </button>
                  <button onClick={generateRituals} disabled={generatingRituals} className="flex-1 px-4 py-3 rounded-lg bg-purple-500 hover:bg-purple-600 disabled:opacity-50">
                    {generatingRituals ? 'Génération...' : 'Suggérer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showBadges && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl max-w-3xl w-full border-2 border-yellow-500/50 max-h-[85vh] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h3 className="text-3xl font-bold">Badges</h3>
                <button onClick={() => setShowBadges(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4 p-6 overflow-y-auto">
                {allBadges.map(badge => {
                  const unlocked = player.badges && player.badges.includes(badge.id);
                  return (
                    <div key={badge.id} className={`p-4 rounded-xl border-2 text-center ${unlocked ? 'bg-yellow-500/20 border-yellow-500/50' : 'bg-white/5 border-white/10 opacity-50'}`}>
                      <div className={`text-4xl mb-2 ${unlocked ? 'animate-pulse' : 'grayscale'}`}>{badge.emoji}</div>
                      <h4 className="font-bold">{badge.name}</h4>
                      <p className="text-xs text-gray-400">{badge.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {showGoals && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl max-w-2xl w-full border-2 border-purple-500/50 max-h-[85vh] flex flex-col overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h3 className="text-3xl font-bold">Objectifs</h3>
                <button onClick={() => setShowGoals(false)}>
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                {player.goals && player.goals.length > 0 && (
                  <div className="space-y-2 mb-6">
                    {player.goals.map((goal) => (
                      <div key={goal.id} className="bg-white/10 rounded-lg p-4 border border-white/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{goal.label}</span>
                          <button onClick={() => removeGoal(goal.id)}>
                            <X size={18} />
                          </button>
                        </div>
                        {goal.themes && goal.themes.length > 0 && (
                          <div className="mt-3 space-y-1">
                            {goal.themes.map(theme => (
                              <div key={theme.id} className="flex items-center justify-between text-xs">
                                <span className="text-gray-400">{theme.name}</span>
                                <span className={`px-2 py-1 rounded ${
                                  theme.developmentLevel === 'none' ? 'bg-gray-500/20' :
                                  theme.developmentLevel === 'low' ? 'bg-blue-500/20' :
                                  theme.developmentLevel === 'medium' ? 'bg-purple-500/20' :
                                  theme.developmentLevel === 'high' ? 'bg-pink-500/20' :
                                  'bg-yellow-500/20'
                                }`}>
                                  {theme.developmentLevel} ({theme.questsCompleted})
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <input type="text" placeholder="Nouvel objectif..." value={newGoal} onChange={(e) => setNewGoal(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addGoal()} className="w-full bg-white/10 rounded-lg px-4 py-3 mb-3 border border-white/20 outline-none" />
                <button onClick={addGoal} disabled={!newGoal.trim()} className="w-full px-4 py-3 rounded-lg bg-purple-500 hover:bg-purple-600 disabled:opacity-50">
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        )}

        {showNewQuest && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border-2 border-purple-500/50">
              <h3 className="text-2xl font-bold mb-4">Nouvelle Quête</h3>
              <input type="text" placeholder="Titre..." value={newQuest.title} onChange={(e) => setNewQuest(prev => ({ ...prev, title: e.target.value }))} className="w-full bg-white/10 rounded-lg px-4 py-3 mb-3 border border-white/20 outline-none" />
              <select value={newQuest.type} onChange={(e) => setNewQuest(prev => ({ ...prev, type: e.target.value }))} className="w-full bg-white/10 rounded-lg px-4 py-3 mb-3 border border-white/20 outline-none">
                <option value="daily">Quotidienne</option>
                <option value="weekly">Hebdomadaire</option>
                <option value="main">Principale</option>
              </select>
              <select value={newQuest.category} onChange={(e) => setNewQuest(prev => ({ ...prev, category: e.target.value }))} className="w-full bg-white/10 rounded-lg px-4 py-3 mb-3 border border-white/20 outline-none">
                {Object.entries(categories).map(([key, cat]) => (
                  <option key={key} value={key}>{cat.name}</option>
                ))}
              </select>
              <select value={newQuest.difficulty} onChange={(e) => setNewQuest(prev => ({ ...prev, difficulty: e.target.value }))} className="w-full bg-white/10 rounded-lg px-4 py-3 mb-4 border border-white/20 outline-none">
                <option value="easy">Facile (+10 XP)</option>
                <option value="medium">Moyen (+25 XP)</option>
                <option value="hard">Difficile (+50 XP)</option>
              </select>
              <div className="flex gap-3">
                <button onClick={() => setShowNewQuest(false)} className="flex-1 px-4 py-3 rounded-lg bg-white/10">
                  Annuler
                </button>
                <button onClick={addQuest} disabled={!newQuest.title} className="flex-1 px-4 py-3 rounded-lg bg-purple-500 hover:bg-purple-600 disabled:opacity-50">
                  Créer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KaizenQuest;