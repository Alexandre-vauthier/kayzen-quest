import React from 'react';
import { X } from 'lucide-react';
import { categories } from '../utils/constants';
import type { CategoryType, DifficultyLevel, QuestType } from '../types/types';

interface NewQuestModalProps {
  newQuest: {
    title: string;
    category: CategoryType;
    difficulty: DifficultyLevel;
    type: QuestType;
  };
  onClose: () => void;
  onQuestChange: (quest: {
    title: string;
    category: CategoryType;
    difficulty: DifficultyLevel;
    type: QuestType;
  }) => void;
  onAddQuest: () => void;
}

const NewQuestModal: React.FC<NewQuestModalProps> = ({
  newQuest,
  onClose,
  onQuestChange,
  onAddQuest
}) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full border-2 border-purple-500/50">
        <h3 className="text-2xl font-bold mb-4">Nouvelle Quête</h3>
        <input
          type="text"
          placeholder="Titre..."
          value={newQuest.title}
          onChange={(e) => onQuestChange({ ...newQuest, title: e.target.value })}
          className="w-full bg-white/10 rounded-lg px-4 py-3 mb-3 border border-white/20 outline-none"
        />
        <select
          value={newQuest.type}
          onChange={(e) => onQuestChange({ ...newQuest, type: e.target.value as QuestType })}
          className="w-full bg-white/10 rounded-lg px-4 py-3 mb-3 border border-white/20 outline-none"
        >
          <option value="daily">Quotidienne</option>
          <option value="weekly">Hebdomadaire</option>
          <option value="main">Principale</option>
        </select>
        <select
          value={newQuest.category}
          onChange={(e) => onQuestChange({ ...newQuest, category: e.target.value as CategoryType })}
          className="w-full bg-white/10 rounded-lg px-4 py-3 mb-3 border border-white/20 outline-none"
        >
          {Object.entries(categories).map(([key, cat]) => (
            <option key={key} value={key}>{cat.name}</option>
          ))}
        </select>
        <select
          value={newQuest.difficulty}
          onChange={(e) => onQuestChange({ ...newQuest, difficulty: e.target.value as DifficultyLevel })}
          className="w-full bg-white/10 rounded-lg px-4 py-3 mb-4 border border-white/20 outline-none"
        >
          <option value="easy">Facile (+10 XP)</option>
          <option value="medium">Moyen (+25 XP)</option>
          <option value="hard">Difficile (+50 XP)</option>
        </select>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-lg bg-white/10">
            Annuler
          </button>
          <button onClick={onAddQuest} disabled={!newQuest.title} className="flex-1 px-4 py-3 rounded-lg bg-purple-500 hover:bg-purple-600 disabled:opacity-50">
            Créer
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewQuestModal;
