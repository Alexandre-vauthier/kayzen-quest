import React, { useState, useEffect } from 'react';
import { Check, Star, ChevronDown, ChevronUp, RefreshCw, Loader2 } from 'lucide-react';
import { categories, difficultyColors, difficultyXP, BONUS_QUEST_MULTIPLIER } from '../utils/constants';
import type { Quest } from '../types/types';

interface QuestSelectionProps {
  quests: Quest[];
  selectedQuestId: number | null;
  onSelectQuest: (questId: number) => void;
  onCompleteQuest: (questId: number) => void;
  isPremium?: boolean;
  refreshesUsed?: number;
  refreshing?: boolean;
  onRefreshQuests?: () => void;
}

const QuestSelection: React.FC<QuestSelectionProps> = ({
  quests,
  selectedQuestId,
  onSelectQuest,
  onCompleteQuest,
  isPremium = false,
  refreshesUsed = 0,
  refreshing = false,
  onRefreshQuests
}) => {
  const [showBonusQuests, setShowBonusQuests] = useState(true);

  useEffect(() => {
    if (selectedQuestId !== null) {
      setShowBonusQuests(false);
    }
  }, [selectedQuestId]);

  const selectedQuest = quests.find(q => q.id === selectedQuestId);
  const availableQuests = quests.filter(q => q.status === 'available');
  const bonusQuests = quests.filter(q => q.status === 'bonus' || (q.status === 'completed' && q.wasBonus));
  const hasRefreshableQuests = quests.some(q => q.status === 'available' || q.status === 'bonus');
  const canRefresh = isPremium && onRefreshQuests && refreshesUsed < 2 && hasRefreshableQuests;

  const refreshButton = canRefresh ? (
    <button
      onClick={onRefreshQuests}
      disabled={refreshing}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-sm font-semibold transition-colors disabled:opacity-50"
    >
      {refreshing ? (
        <Loader2 className="animate-spin" size={14} />
      ) : (
        <RefreshCw size={14} />
      )}
      Changer ({2 - refreshesUsed} restant{2 - refreshesUsed > 1 ? 's' : ''})
    </button>
  ) : null;

  const renderQuestCard = (quest: Quest, isMain: boolean = false) => {
    const CategoryIcon = categories[quest.category].icon;
    const isOrWasBonus = quest.status === 'bonus' || (quest.status === 'completed' && quest.wasBonus);
    const xp = isOrWasBonus ? Math.floor(difficultyXP[quest.difficulty] * BONUS_QUEST_MULTIPLIER) : difficultyXP[quest.difficulty];
    const isCompleted = quest.status === 'completed';

    return (
      <div
        key={quest.id}
        className={`border-2 rounded-xl p-5 transition-all ${
          isCompleted ? 'bg-purple-500/20 border-purple-500/50' : `${difficultyColors[quest.difficulty]} hover:scale-[1.02]`
        } ${isMain && !isCompleted ? 'border-purple-500/50' : ''}`}
      >
        <div className="flex items-start gap-3 mb-3">
          <CategoryIcon className={`${categories[quest.category].color} mt-1`} size={24} />
          <h3 className={`text-lg font-bold flex-1 ${isCompleted ? 'line-through' : ''}`}>
            {quest.title}
          </h3>
        </div>

        <div className="flex gap-2 mb-4 text-sm flex-wrap">
          <span className="px-3 py-1 rounded-full bg-white/10 font-bold">
            +{xp} XP
          </span>
          {isOrWasBonus && (
            <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 font-bold flex items-center gap-1">
              <Star size={14} />
              Bonus +50%
            </span>
          )}
          {isMain && (
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 font-bold">
              Quête du jour
            </span>
          )}
        </div>

        <div className="flex gap-2">
          {!isCompleted && quest.status !== 'selected' && quest.status !== 'bonus' && (
            <button
              onClick={() => onSelectQuest(quest.id)}
              className="flex-1 px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-colors"
            >
              Choisir
            </button>
          )}
          {!isCompleted && (quest.status === 'selected' || quest.status === 'bonus') && (
            <button
              onClick={() => onCompleteQuest(quest.id)}
              className="flex-1 px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors flex items-center justify-center gap-2"
            >
              <Check size={18} />
              Valider la quête
            </button>
          )}
          {isCompleted && (
            <div className="flex-1 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center gap-2">
              <Check size={18} />
              Complété
            </div>
          )}
        </div>

        {isCompleted && quest.completionMessage && (
          <div className="mt-3 px-4 py-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <p className="text-purple-200/80 text-sm italic">{quest.completionMessage}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Section quête sélectionnée */}
      {selectedQuest ? (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Star className="text-purple-400" />
            Ta quête du jour
          </h2>
          {renderQuestCard(selectedQuest, true)}
        </div>
      ) : availableQuests.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-purple-400">⭐</span>
              Choisis ta quête du jour
            </h2>
            {refreshButton}
          </div>
          <div className="space-y-3">
            {availableQuests.map(quest => renderQuestCard(quest))}
          </div>
        </div>
      ) : null}

      {/* Section quêtes bonus (collapsible) */}
      {bonusQuests.length > 0 && (
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <button
              onClick={() => setShowBonusQuests(!showBonusQuests)}
              className="flex items-center gap-2 min-w-0"
            >
              <Star className="text-yellow-400 shrink-0" size={20} />
              <span className="text-xl font-bold">Quêtes bonus</span>
              <span className="text-sm text-gray-400 whitespace-nowrap">({bonusQuests.filter(q => q.status !== 'completed').length} restantes)</span>
              {showBonusQuests ? <ChevronUp className="shrink-0" size={18} /> : <ChevronDown className="shrink-0" size={18} />}
            </button>
            {selectedQuest && refreshButton}
          </div>
          {showBonusQuests && (
            <div className="space-y-3">
              {bonusQuests.map(quest => renderQuestCard(quest, false))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default QuestSelection;
