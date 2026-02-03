import React, { useState } from 'react';
import { X, Loader2, Crown, Sparkles, RefreshCw, Target, AlertTriangle, BarChart3, MessageCircle, Archive, Trophy } from 'lucide-react';
import type { Goal } from '../types/types';

interface GoalsModalProps {
  goals: Goal[];
  newGoal: string;
  newGoalContext: string;
  generatingThemes: boolean;
  isPremium: boolean;
  onClose: () => void;
  onNewGoalChange: (value: string) => void;
  onContextChange: (value: string) => void;
  onAddGoal: () => void;
  onRemoveGoal: (goalId: string) => void;
  onArchiveGoal?: (goalId: string) => void;
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
  newGoalContext,
  generatingThemes,
  isPremium,
  onClose,
  onNewGoalChange,
  onContextChange,
  onAddGoal,
  onRemoveGoal,
  onArchiveGoal,
}) => {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [justArchived, setJustArchived] = useState<string | null>(null);

  const activeGoals = goals.filter(g => !g.archivedAt);
  const archivedGoals = goals.filter(g => g.archivedAt);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onAddGoal();
    }
  };

  const handleConfirmDelete = (goalId: string) => {
    onRemoveGoal(goalId);
    setConfirmDeleteId(null);
  };

  const handleArchive = (goalId: string) => {
    if (onArchiveGoal) {
      onArchiveGoal(goalId);
      setJustArchived(goalId);
      setTimeout(() => setJustArchived(null), 3000);
    }
  };

  const canArchive = (goal: Goal) => {
    return goal.themes && goal.themes.length > 0 &&
      goal.themes.every(t => t.developmentLevel === 'high' || t.developmentLevel === 'advanced');
  };

  const renderGoalCard = (goal: Goal, isArchived: boolean) => (
    <div
      key={goal.id}
      className={`rounded-lg p-4 border ${isArchived ? 'bg-white/5 border-white/10 opacity-70' : 'bg-white/10 border-white/20'}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{goal.label}</span>
          {isArchived && <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">Terminé</span>}
        </div>
        {!isArchived && (
          <button onClick={() => setConfirmDeleteId(goal.id)}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Archive celebration */}
      {justArchived === goal.id && (
        <div className="mb-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
          <Trophy className="text-yellow-400 mx-auto mb-1" size={24} />
          <p className="text-sm text-green-300 font-semibold">Objectif accompli !</p>
        </div>
      )}

      {confirmDeleteId === goal.id && (
        <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-red-400" />
            <span className="text-sm text-red-300 font-semibold">Supprimer cet objectif ?</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">Toute la progression de cet objectif sera perdue.</p>
          <div className="flex gap-2">
            <button
              onClick={() => handleConfirmDelete(goal.id)}
              className="flex-1 px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-semibold transition-colors"
            >
              Supprimer
            </button>
            <button
              onClick={() => setConfirmDeleteId(null)}
              className="flex-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 text-sm font-semibold transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

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

      {/* Archive button */}
      {!isArchived && canArchive(goal) && onArchiveGoal && (
        <button
          onClick={() => handleArchive(goal.id)}
          className="w-full mt-3 px-3 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Archive size={14} />
          Objectif atteint - Archiver
        </button>
      )}
    </div>
  );

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
          {activeGoals.length > 0 && (
            <div className="space-y-2 mb-6">
              {activeGoals.map((goal) => renderGoalCard(goal, false))}
            </div>
          )}

          {/* Archived goals */}
          {archivedGoals.length > 0 && (
            <div className="mb-6">
              <button
                onClick={() => setShowArchived(!showArchived)}
                className="text-sm text-gray-500 hover:text-gray-300 transition-colors flex items-center gap-1 mb-2"
              >
                <Archive size={14} />
                {showArchived ? 'Masquer' : 'Voir'} les objectifs terminés ({archivedGoals.length})
              </button>
              {showArchived && (
                <div className="space-y-2">
                  {archivedGoals.map((goal) => renderGoalCard(goal, true))}
                </div>
              )}
            </div>
          )}

          {isPremium || activeGoals.length === 0 ? (
            <>
              <input
                type="text"
                placeholder="Nouvel objectif..."
                value={newGoal}
                onChange={(e) => onNewGoalChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full bg-white/10 rounded-lg px-4 py-3 mb-3 border border-white/20 outline-none"
              />
              <textarea
                placeholder="Contexte (optionnel) : ton niveau actuel, tes contraintes (temps, équipement...), ce que tu aimes ou évites..."
                value={newGoalContext}
                onChange={(e) => onContextChange(e.target.value)}
                rows={2}
                className="w-full bg-white/10 rounded-lg px-4 py-3 mb-3 border border-white/20 outline-none resize-none text-sm"
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
                <li className="flex items-center gap-2 text-gray-200">
                  <BarChart3 size={14} className="text-purple-400 shrink-0" />
                  Dashboard de progression
                </li>
                <li className="flex items-center gap-2 text-gray-200">
                  <MessageCircle size={14} className="text-purple-400 shrink-0" />
                  Message personnalisé à chaque quête validée
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
