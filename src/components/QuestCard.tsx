import React from 'react';
import { Check, X } from 'lucide-react';
import { categories, difficultyColors, difficultyXP } from '../utils/constants';
import type { Quest, QuestType } from '../types/types';

interface QuestCardProps {
  quest: Quest;
  type: QuestType;
  onComplete: (questId: number, type: QuestType) => void;
  onDelete: (questId: number, type: QuestType) => void;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest, type, onComplete, onDelete }) => {
  const CategoryIcon = categories[quest.category].icon;

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
            <button onClick={() => onComplete(quest.id, type)} className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors">
              <Check size={18} />
            </button>
          )}
          <button onClick={() => onDelete(quest.id, type)} className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestCard;
