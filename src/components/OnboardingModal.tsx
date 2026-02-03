import React from 'react';
import { Target, Loader2 } from 'lucide-react';
import { presetGoals } from '../utils/constants';
import type { PresetGoal } from '../types/types';

interface OnboardingModalProps {
  selectedPresetGoal: string | null;
  newGoal: string;
  newGoalContext: string;
  generatingThemes: boolean;
  onSelectPresetGoal: (goalId: string) => void;
  onNewGoalChange: (value: string) => void;
  onContextChange: (value: string) => void;
  onComplete: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({
  selectedPresetGoal,
  newGoal,
  newGoalContext,
  generatingThemes,
  onSelectPresetGoal,
  onNewGoalChange,
  onContextChange,
  onComplete
}) => {
  const hasSelection = selectedPresetGoal !== null || newGoal.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">Bienvenue, Aventurier</h1>
          <p className="text-xl text-purple-300">Avant de commencer...</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border-2 border-purple-500/30">
          <h2 className="text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2">
            <Target className="text-purple-400" />
            Choisis ton objectif principal
          </h2>
          <p className="text-gray-300 mb-6 text-sm">Tes quêtes quotidiennes seront basées sur cet objectif.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {presetGoals.map((goal: PresetGoal) => (
              <button
                key={goal.id}
                onClick={() => onSelectPresetGoal(goal.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedPresetGoal === goal.id
                    ? 'bg-purple-500/30 border-purple-500'
                    : 'bg-white/5 border-white/20 hover:border-purple-500/50'
                }`}
              >
                <span className="text-2xl mr-2">{goal.emoji}</span>
                <span className="font-semibold">{goal.label}</span>
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">Ou définis le tien</label>
            <input
              type="text"
              placeholder="Ex : Apprendre à cuisiner sainement"
              value={newGoal}
              onChange={(e) => onNewGoalChange(e.target.value)}
              className="w-full bg-white/10 rounded-lg px-4 py-3 border border-white/20 focus:border-purple-500 outline-none text-sm"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm text-gray-400 mb-2">Contexte (optionnel)</label>
            <textarea
              placeholder="Aide l'IA à mieux te comprendre : ton niveau actuel, tes contraintes (temps, équipement...), ce que tu aimes ou évites, ta situation particulière..."
              value={newGoalContext}
              onChange={(e) => onContextChange(e.target.value)}
              rows={3}
              className="w-full bg-white/10 rounded-lg px-4 py-3 border border-white/20 focus:border-purple-500 outline-none text-sm resize-none"
            />
          </div>

          <button
            onClick={onComplete}
            disabled={!hasSelection || generatingThemes}
            className="w-full py-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-bold text-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {generatingThemes ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Génération...
              </>
            ) : (
              'Commencer ✨'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingModal;
