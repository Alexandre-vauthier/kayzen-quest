import React from 'react';
import { X, Loader2, Crown, Sparkles, RefreshCw, Target } from 'lucide-react';
import type { Goal } from '../types/types';

interface GoalsModalProps {
  goals: Goal[];
  newGoal: string;
  generatingThemes: boolean;
  isPremium: boolean;
  onClose: () => void;
  onNewGoalChange: (value: string) => void;
  onAddGoal: () => void;
  onRemoveGoal: (goalId: string) => void;
}

const developmentLevelLabels: Record<string, string> = {
  none: 'Nouveau',
  low: 'Débutant',
  medium: 'Intermédiaire',
  high: 'Avancé',
  advanced: 'Expert'
};

const GoalsModal: React.FC<GoalsModalProps> = ({
  goals,
  newGoal,
  generatingThemes,
  isPremium,
  onClose,
  onNewGoalChange,
  onAddGoal,
  onRemoveGoal
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onAddGoal();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl max-w-2xl w-full border-2 border-purple-500/50 max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-3xl font-bold">Objectifs</h3>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {goals.length > 0 && (
            <div className="space-y-2 mb-6">
              {goals.map((goal) => (
                <div key={goal.id} className="bg-white/10 rounded-lg p-4 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{goal.label}</span>
                    {(isPremium || goals.length > 1) && (
                      <button onClick={() => onRemoveGoal(goal.id)}>
                        <X size={18} />
                      </button>
                    )}
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
                            {developmentLevelLabels[theme.developmentLevel] || theme.developmentLevel} ({theme.questsCompleted})
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {isPremium || goals.length === 0 ? (
            <>
              <input
                type="text"
                placeholder="Nouvel objectif..."
                value={newGoal}
                onChange={(e) => onNewGoalChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full bg-white/10 rounded-lg px-4 py-3 mb-3 border border-white/20 outline-none"
              />
              <button onClick={onAddGoal} disabled={!newGoal.trim() || generatingThemes} className="w-full px-4 py-3 rounded-lg bg-purple-500 hover:bg-purple-600 disabled:opacity-50 flex items-center justify-center gap-2">
                {generatingThemes ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Génération...
                  </>
                ) : (
                  'Ajouter'
                )}
              </button>
            </>
          ) : (
            <div className="bg-gradient-to-br from-yellow-500/10 to-purple-500/10 border-2 border-yellow-500/30 rounded-xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Crown className="text-yellow-400" size={22} />
                <h3 className="text-lg font-bold text-yellow-400">Passe en Premium</h3>
              </div>
              <p className="text-sm text-gray-300">
                Ajoute plusieurs objectifs et profite de tous les avantages Premium :
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-gray-200">
                  <Target size={14} className="text-purple-400 shrink-0" />
                  Objectifs multiples
                </li>
                <li className="flex items-center gap-2 text-gray-200">
                  <Sparkles size={14} className="text-purple-400 shrink-0" />
                  5 quêtes par jour (au lieu de 3)
                </li>
                <li className="flex items-center gap-2 text-gray-200">
                  <RefreshCw size={14} className="text-purple-400 shrink-0" />
                  Changer ses quêtes (2x/jour)
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalsModal;
