import React, { useState, useEffect } from 'react';
import { Check, Star, ChevronDown, ChevronUp } from 'lucide-react';
import { categories, difficultyColors, difficultyXP, BONUS_QUEST_MULTIPLIER } from '../utils/constants';
import type { Quest } from '../types/types';

interface QuestSelectionProps {
  quests: Quest[];
  selectedQuestId: number | null;
  onSelectQuest: (questId: number) => void;
  onCompleteQuest: (questId: number) => void;
}

const QuestSelection: React.FC<QuestSelectionProps> = ({
  quests,
  selectedQuestId,
  onSelectQuest,
  onCompleteQuest
}) => {
  const [showBonusQuests, setShowBonusQuests] = useState(true);

  useEffect(() => {
    if (selectedQuestId !== null) {
      setShowBonusQuests(false);
    }
  }, [selectedQuestId]);

  const selectedQuest = quests.find(q => q.id === selectedQuestId);
  const availableQuests = quests.filter(q => q.status === 'available');
  const bonusQuests = quests.filter(q => q.status === 'bonus');

  const renderQuestCard = (quest: Quest, isMain: boolean = false) => {
    const CategoryIcon = categories[quest.category].icon;
    const xp = isMain ? difficultyXP[quest.difficulty] : Math.floor(difficultyXP[quest.difficulty] * BONUS_QUEST_MULTIPLIER);
    const isCompleted = quest.status === 'completed';

    return (
      <div
        key={quest.id}
        className={`border-2 rounded-xl p-5 transition-all ${difficultyColors[quest.difficulty]} ${
          isCompleted ? 'opacity-60' : 'hover:scale-[1.02]'
        } ${isMain ? 'border-purple-500/50' : ''}`}
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
          {!isMain && !isCompleted && (
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
            <div className="flex-1 px-4 py-2 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center gap-2">
              <Check size={18} />
              Complété
            </div>
          )}
        </div>
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
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <span className="text-purple-400">⭐</span>
            Choisis ta quête du jour
          </h2>
          <div className="space-y-3">
            {availableQuests.map(quest => renderQuestCard(quest))}
          </div>
        </div>
      ) : null}

      {/* Section quêtes bonus (collapsible) */}
      {bonusQuests.length > 0 && (
        <div>
          <button
            onClick={() => setShowBonusQuests(!showBonusQuests)}
            className="flex items-center justify-between w-full mb-4"
          >
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Star className="text-yellow-400" />
              Quêtes bonus (+50% XP)
              <span className="text-sm text-gray-400">({bonusQuests.filter(q => q.status !== 'completed').length} restantes)</span>
            </h2>
            {showBonusQuests ? <ChevronUp /> : <ChevronDown />}
          </button>
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
