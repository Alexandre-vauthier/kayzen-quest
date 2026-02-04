import React, { useState, useEffect } from 'react';
import { Check, Star, ChevronDown, ChevronUp, RefreshCw, Loader2, Clock, ThumbsUp, ThumbsDown, Pin, Undo2 } from 'lucide-react';
import { categories, difficultyColors, difficultyXP, BONUS_QUEST_MULTIPLIER } from '../utils/constants';
import type { Quest } from '../types/types';

interface QuestSelectionProps {
  quests: Quest[];
  selectedQuestId: number | null;
  onSelectQuest: (questId: number) => void;
  onCompleteQuest: (questId: number) => void;
  isPremium?: boolean;
  refreshesUsed?: number;
  refreshingQuestId?: number | null;
  onRefreshSingleQuest?: (questId: number) => void;
  onFeedback?: (questId: number, feedback: 'up' | 'down') => void;
  onTogglePin?: (questTitle: string) => void;
  pinnedQuests?: string[];
  undoSnapshot?: { questId: number } | null;
  onUndo?: () => void;
}

const QuestSelection: React.FC<QuestSelectionProps> = ({
  quests,
  selectedQuestId,
  onSelectQuest,
  onCompleteQuest,
  isPremium = false,
  refreshesUsed = 0,
  refreshingQuestId = null,
  onRefreshSingleQuest,
  onFeedback,
  onTogglePin,
  pinnedQuests = [],
  undoSnapshot,
  onUndo,
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
  const canRefreshQuest = isPremium && onRefreshSingleQuest && refreshesUsed < 3;
  const refreshesRemaining = 3 - refreshesUsed;

  const renderQuestCard = (quest: Quest, isMain: boolean = false) => {
    const CategoryIcon = categories[quest.category].icon;
    const isOrWasBonus = quest.status === 'bonus' || (quest.status === 'completed' && quest.wasBonus);
    const xp = isOrWasBonus ? Math.floor(difficultyXP[quest.difficulty] * BONUS_QUEST_MULTIPLIER) : difficultyXP[quest.difficulty];
    const isCompleted = quest.status === 'completed';
    const isPinned = pinnedQuests.includes(quest.title) || quest.isPinned;

    return (
      <div
        key={quest.id}
        className={`border-2 rounded-xl p-5 transition-all ${
          isCompleted ? 'bg-purple-500/20 border-purple-500/50' : `${difficultyColors[quest.difficulty]} hover:scale-[1.02]`
        } ${isMain && !isCompleted ? 'border-purple-500/50' : ''}`}
      >
        <div className="flex items-start gap-3 mb-2">
          <CategoryIcon className={`${categories[quest.category].color} mt-1`} size={24} />
          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-bold ${isCompleted ? 'line-through' : ''} flex items-center gap-2`}>
              {quest.title}
              {isPinned && !isCompleted && (
                <span title="Quête récurrente">
                  <Pin size={14} className="text-purple-400 fill-current shrink-0" />
                </span>
              )}
            </h3>
            {quest.description && (
              <p className="text-sm text-white/70 mt-1">{quest.description}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-4 text-sm flex-wrap">
          <span className="px-3 py-1 rounded-full bg-white/10 font-bold">
            +{xp} XP
          </span>
          {quest.estimatedTime && (
            <span className="px-3 py-1 rounded-full bg-white/10 text-gray-300 flex items-center gap-1">
              <Clock size={12} />
              {quest.estimatedTime}
            </span>
          )}
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
            <>
              <button
                onClick={() => onSelectQuest(quest.id)}
                className="flex-1 px-4 py-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 transition-colors"
              >
                Choisir
              </button>
              {canRefreshQuest && (
                <button
                  onClick={() => onRefreshSingleQuest!(quest.id)}
                  disabled={refreshingQuestId !== null}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50"
                  title={`Changer cette quête (${refreshesRemaining} restant${refreshesRemaining > 1 ? 's' : ''})`}
                >
                  {refreshingQuestId === quest.id ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <RefreshCw size={18} />
                  )}
                </button>
              )}
            </>
          )}
          {!isCompleted && quest.status === 'bonus' && (
            <div className="flex gap-2 flex-1">
              <button
                onClick={() => onCompleteQuest(quest.id)}
                className="flex-1 px-4 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Valider
              </button>
              {canRefreshQuest && (
                <button
                  onClick={() => onRefreshSingleQuest!(quest.id)}
                  disabled={refreshingQuestId !== null}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50"
                  title={`Changer cette quête (${refreshesRemaining} restant${refreshesRemaining > 1 ? 's' : ''})`}
                >
                  {refreshingQuestId === quest.id ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <RefreshCw size={18} />
                  )}
                </button>
              )}
            </div>
          )}
          {!isCompleted && quest.status === 'selected' && (
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
          <div className="mt-3 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 animate-fade-in">
            <p className="text-purple-100 text-sm italic leading-relaxed">✨ {quest.completionMessage}</p>
          </div>
        )}

        {/* Feedback + Pin on all quests (not just completed) */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onFeedback && (
              <>
                <button
                  onClick={() => onFeedback(quest.id, 'up')}
                  className={`p-1.5 rounded-lg transition-colors ${quest.feedback === 'up' ? 'bg-green-500/30 text-green-400' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
                  title="Bonne quête"
                >
                  <ThumbsUp size={16} />
                </button>
                <button
                  onClick={() => onFeedback(quest.id, 'down')}
                  className={`p-1.5 rounded-lg transition-colors ${quest.feedback === 'down' ? 'bg-red-500/30 text-red-400' : 'text-white/50 hover:text-white hover:bg-white/10'}`}
                  title="Pas pertinente"
                >
                  <ThumbsDown size={16} />
                </button>
              </>
            )}
          </div>
          {onTogglePin && (
            <button
              onClick={() => onTogglePin(quest.title)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                isPinned ? 'bg-purple-500/30 text-purple-300' : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
              title={isPinned ? 'Retirer des récurrentes' : 'Épingler comme récurrente'}
            >
              <Pin size={14} className={isPinned ? 'fill-current' : ''} />
              {isPinned ? 'Épinglée' : 'Épingler'}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Undo toast */}
      {undoSnapshot && onUndo && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-800 border border-purple-500/50 rounded-xl px-5 py-3 shadow-2xl flex items-center gap-3 animate-slide-up">
          <span className="text-sm">Quête validée</span>
          <button
            onClick={onUndo}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-500/30 hover:bg-purple-500/40 text-purple-300 text-sm font-semibold transition-colors"
          >
            <Undo2 size={14} />
            Annuler
          </button>
        </div>
      )}

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
            {canRefreshQuest && (
              <span className="text-xs text-gray-500">
                {refreshesRemaining} changement{refreshesRemaining > 1 ? 's' : ''} restant{refreshesRemaining > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="space-y-3">
            {availableQuests.map(quest => renderQuestCard(quest))}
          </div>
        </div>
      ) : null}

      {/* Section quêtes bonus (collapsible) */}
      {bonusQuests.length > 0 && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <button
              onClick={() => setShowBonusQuests(!showBonusQuests)}
              className="flex items-center gap-2 min-w-0"
            >
              <Star className="text-yellow-400 shrink-0" size={20} />
              <span className="text-xl font-bold">Quêtes bonus</span>
              <span className="text-sm text-gray-400 whitespace-nowrap">({bonusQuests.filter(q => q.status !== 'completed').length} restantes)</span>
              {showBonusQuests ? <ChevronUp className="shrink-0" size={18} /> : <ChevronDown className="shrink-0" size={18} />}
            </button>
            {canRefreshQuest && selectedQuest && bonusQuests.some(q => q.status !== 'completed') && (
              <span className="text-xs text-gray-500">
                {refreshesRemaining} changement{refreshesRemaining > 1 ? 's' : ''} restant{refreshesRemaining > 1 ? 's' : ''}
              </span>
            )}
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
