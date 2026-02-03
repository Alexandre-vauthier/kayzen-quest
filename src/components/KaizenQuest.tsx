import { useState, useMemo } from 'react';
import { Sparkles, Trophy, Award, Target, Loader2, Clock, Settings, BarChart3, Flame, Heart, Brain, Home, Briefcase, Users, ScrollText } from 'lucide-react';

// Hooks
import { useModals } from '../hooks/useModals';
import { usePopups } from '../hooks/usePopups';
import { usePlayer } from '../hooks/usePlayer';
import { useQuests } from '../hooks/useQuests';
import { useFirestoreSync } from '../hooks/useFirestoreSync';

// Components
import QuestSelection from './QuestSelection';
import OnboardingModal from './OnboardingModal';
import LevelUpPopup from './LevelUpPopup';
import BadgePopup from './BadgePopup';
import BadgesModal from './BadgesModal';
import GoalsModal from './GoalsModal';
import HistoryModal from './HistoryModal';
import SettingsModal from './SettingsModal';
import ProgressDashboard from './ProgressDashboard';
import WeeklyRecapModal from './WeeklyRecapModal';

// Utils
import { generateWeeklyRecap } from '../utils/utils';
import type { CategoryType } from '../types/types';

const categoryIcons: Record<CategoryType, any> = {
  body: Heart,
  mind: Brain,
  environment: Home,
  projects: Briefcase,
  social: Users,
};
const categoryLabels: Record<CategoryType, string> = {
  body: 'Corps',
  mind: 'Esprit',
  environment: 'Environnement',
  projects: 'Projets',
  social: 'Social',
};
const categoryColors: Record<CategoryType, string> = {
  body: 'bg-red-500',
  mind: 'bg-purple-500',
  environment: 'bg-green-500',
  projects: 'bg-blue-500',
  social: 'bg-yellow-500',
};

const KaizenQuest = () => {
  const modals = useModals();
  const popups = usePopups();
  const {
    player, setPlayer, isPremium, currentTitle, questCount,
    generatingThemes, newGoal, setNewGoal, selectedPresetGoal, setSelectedPresetGoal,
    completeOnboarding, addGoal, removeGoal, archiveGoal, togglePremium, togglePinnedQuest,
  } = usePlayer();

  const {
    dailyQuests, setDailyQuests, questHistory, setQuestHistory,
    generating, timeToReset,
    generateQuests, refreshQuests, selectQuest, completeQuest,
    undoSnapshot, undoLastCompletion, setQuestFeedback,
  } = useQuests(player, isPremium, questCount, {
    setPlayer,
    onBadgeEarned: popups.showBadge,
    onPerfectDay: popups.showPerfectDay,
    onLevelUp: popups.showLevelUp,
    setGeneratingStory: popups.setGeneratingStory,
  });

  useFirestoreSync({
    player,
    dailyQuests,
    questHistory,
    setPlayer: (p) => setPlayer(p),
    setDailyQuests: (d) => setDailyQuests(d),
    setQuestHistory: (h) => setQuestHistory(h),
    openOnboarding: () => modals.open('onboarding'),
  });

  // Weekly recap state
  const [weeklyRecap, setWeeklyRecap] = useState<string | null>(null);
  const [generatingRecap, setGeneratingRecap] = useState(false);

  const handleWeeklyRecap = async () => {
    setGeneratingRecap(true);
    modals.open('weeklyRecap');
    const recap = await generateWeeklyRecap(questHistory, player.goals, player.level);
    setWeeklyRecap(recap);
    setGeneratingRecap(false);
  };

  // Category stats from quest history
  const categoryStats = useMemo(() => {
    const stats: Record<CategoryType, number> = { body: 0, mind: 0, environment: 0, projects: 0, social: 0 };
    questHistory.forEach(q => {
      if (q.category && stats[q.category] !== undefined) {
        stats[q.category]++;
      }
    });
    return stats;
  }, [questHistory]);
  const maxCategoryStat = Math.max(...Object.values(categoryStats), 1);

  // Onboarding handler
  const handleOnboarding = async () => {
    modals.close('onboarding');
    await completeOnboarding();
  };

  if (modals.isOpen('onboarding')) {
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
        onComplete={handleOnboarding}
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
              <div className="flex items-center gap-2">
                {/* Streak */}
                {(player.currentStreak || 0) > 0 && (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30">
                    <Flame className="text-orange-400" size={16} />
                    <span className="text-sm font-bold text-orange-300">{player.currentStreak}j</span>
                  </div>
                )}
                <button
                  onClick={() => modals.open('settings')}
                  className="p-2 text-purple-400 hover:text-purple-300 transition-colors"
                  title="Paramètres"
                >
                  <Settings size={20} />
                </button>
              </div>
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
            <button onClick={() => modals.open('history')} className="bg-pink-500/20 hover:bg-pink-500/30 rounded-lg p-4 transition-colors flex flex-col items-center gap-2">
              <Trophy className="text-pink-400" size={28} />
              <p className="text-xs text-gray-300">Histoire</p>
            </button>
            <button onClick={() => modals.open('goals')} className="bg-purple-500/20 hover:bg-purple-500/30 rounded-lg p-4 transition-colors flex flex-col items-center gap-2">
              <Target className="text-purple-400" size={28} />
              <p className="text-xs text-gray-300">Objectifs</p>
            </button>
            <button onClick={() => modals.open('badges')} className="bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg p-4 transition-colors flex flex-col items-center gap-2">
              <Award className="text-yellow-400" size={28} />
              <p className="text-xs text-gray-300">Succès</p>
            </button>
          </div>
          <div className="flex gap-3 mt-3">
            {isPremium && (
              <button
                onClick={() => modals.open('dashboard')}
                className="flex-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-lg p-3 transition-colors flex items-center justify-center gap-2"
              >
                <BarChart3 className="text-purple-400" size={20} />
                <p className="text-sm text-purple-300 font-semibold">Ma progression</p>
              </button>
            )}
            {questHistory.length > 0 && (
              <button
                onClick={handleWeeklyRecap}
                className="flex-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 rounded-lg p-3 transition-colors flex items-center justify-center gap-2"
              >
                <ScrollText className="text-blue-400" size={20} />
                <p className="text-sm text-blue-300 font-semibold">Récap semaine</p>
              </button>
            )}
          </div>
        </div>

        {/* Category Stats */}
        {questHistory.length > 0 && (
          <div className="bg-white/5 rounded-2xl p-5 mb-6 border border-white/10">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Répartition par catégorie</h3>
            <div className="space-y-2">
              {(Object.keys(categoryStats) as CategoryType[]).map(cat => {
                const Icon = categoryIcons[cat];
                const count = categoryStats[cat];
                const pct = maxCategoryStat > 0 ? (count / maxCategoryStat) * 100 : 0;
                return (
                  <div key={cat} className="flex items-center gap-2">
                    <Icon size={14} className="text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-400 w-24 shrink-0">{categoryLabels[cat]}</span>
                    <div className="flex-1 h-2 bg-black/30 rounded-full overflow-hidden">
                      <div className={`h-full ${categoryColors[cat]} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-6 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Daily Quests Section */}
        <div className="bg-white/5 rounded-2xl p-6 border-2 border-blue-500/30 mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Quêtes du jour</h2>
            {dailyQuests.quests.length > 0 && dailyQuests.quests.every(q => q.status === 'completed') && (
              <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
                <Clock size={14} />
                <span>Prochaines quêtes dans {timeToReset}</span>
              </div>
            )}
          </div>

          {dailyQuests.quests.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              {generatingThemes ? (
                <>
                  <Loader2 className="animate-spin mx-auto mb-4 text-purple-400" size={32} />
                  <p className="text-lg mb-2">Préparation de tes objectifs...</p>
                  <p className="text-sm">Tes quêtes seront prêtes dans un instant</p>
                </>
              ) : player.goals.filter(g => !g.archivedAt).length === 0 ? (
                <>
                  <Target className="mx-auto mb-4 text-purple-400" size={32} />
                  <p className="text-lg mb-2">Définis un objectif pour commencer</p>
                  <p className="text-sm mb-6">Tes quêtes quotidiennes seront basées sur ton objectif</p>
                  <div className="flex justify-center">
                    <button
                      onClick={() => modals.open('goals')}
                      className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex items-center gap-2 text-white transition-all"
                    >
                      <Target size={18} />
                      Définir mon objectif
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-lg mb-2">Génère tes {questCount} quêtes quotidiennes</p>
                  <p className="text-sm mb-6">Choisis-en 1 comme ta quête du jour, les {questCount - 1} autres seront des quêtes bonus (+50% XP)</p>
                  <div className="flex justify-center">
                    <button
                      onClick={generateQuests}
                      disabled={generating}
                      className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex items-center gap-2 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                </>
              )}
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
              onFeedback={setQuestFeedback}
              onTogglePin={togglePinnedQuest}
              pinnedQuests={player.pinnedQuests || []}
              undoSnapshot={undoSnapshot}
              onUndo={undoLastCompletion}
            />
          )}
        </div>

        {/* Pinned quests indicator */}
        {(player.pinnedQuests || []).length > 0 && (
          <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-purple-500/20">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Quêtes épinglées ({player.pinnedQuests!.length})</h3>
            <div className="flex flex-wrap gap-2">
              {player.pinnedQuests!.map((q, i) => (
                <span key={i} className="text-xs px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 flex items-center gap-1">
                  📌 {q}
                  <button onClick={() => togglePinnedQuest(q)} className="ml-1 text-gray-500 hover:text-gray-300">×</button>
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Ces quêtes seront incluses lors de la prochaine génération</p>
          </div>
        )}

        {/* Popups */}
        {popups.levelUpPopup && <LevelUpPopup data={popups.levelUpPopup} generatingStory={popups.generatingStory} />}
        {popups.badgePopup && <BadgePopup badge={popups.badgePopup} />}

        {popups.perfectDayPopup && (
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
        {modals.isOpen('history') && <HistoryModal storyChapters={player.storyChapters} onClose={() => modals.close('history')} />}
        {modals.isOpen('badges') && <BadgesModal player={player} onClose={() => modals.close('badges')} />}
        {modals.isOpen('goals') && (
          <GoalsModal
            goals={player.goals}
            newGoal={newGoal}
            generatingThemes={generatingThemes}
            isPremium={isPremium}
            onClose={() => modals.close('goals')}
            onNewGoalChange={setNewGoal}
            onAddGoal={addGoal}
            onRemoveGoal={removeGoal}
            onArchiveGoal={archiveGoal}
          />
        )}
        {modals.isOpen('settings') && (
          <SettingsModal
            onClose={() => modals.close('settings')}
            isPremium={isPremium}
            onTogglePremium={togglePremium}
          />
        )}
        {modals.isOpen('dashboard') && (
          <ProgressDashboard
            player={player}
            history={questHistory}
            onClose={() => modals.close('dashboard')}
          />
        )}
        {modals.isOpen('weeklyRecap') && (
          <WeeklyRecapModal
            recap={weeklyRecap}
            generating={generatingRecap}
            onClose={() => { modals.close('weeklyRecap'); setWeeklyRecap(null); }}
          />
        )}
      </div>
    </div>
  );
};

export default KaizenQuest;
