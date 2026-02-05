import React, { useState } from 'react';
import { Target, Loader2, ExternalLink } from 'lucide-react';
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
  onComplete: (acceptedTerms: boolean) => void;
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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showCGU, setShowCGU] = useState(false);
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
              rows={4}
              className="w-full bg-white/10 rounded-lg px-4 py-3 border border-white/20 focus:border-purple-500 outline-none text-sm resize-none"
            />
          </div>

          {/* CGU Acceptance */}
          <div className="mb-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer"
              />
              <span className="text-sm text-gray-300">
                J'accepte les{' '}
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setShowCGU(true); }}
                  className="text-purple-400 hover:text-purple-300 underline inline-flex items-center gap-1"
                >
                  Conditions Générales d'Utilisation
                  <ExternalLink size={12} />
                </button>
                {' '}et la Politique de confidentialité
              </span>
            </label>
          </div>

          <button
            onClick={() => onComplete(acceptedTerms)}
            disabled={!hasSelection || !acceptedTerms || generatingThemes}
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

      {/* CGU Modal */}
      {showCGU && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xl font-bold">Conditions Générales d'Utilisation</h3>
              <button
                onClick={() => setShowCGU(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto text-sm text-gray-300 space-y-4">
              <p className="text-xs text-gray-500">Dernière mise à jour : janvier 2025</p>

              <section>
                <h4 className="font-bold text-white mb-2">1. Objet</h4>
                <p>Les présentes CGU régissent l'utilisation de Kaizen Quest, une application de gamification du développement personnel.</p>
              </section>

              <section>
                <h4 className="font-bold text-white mb-2">2. Description du service</h4>
                <p>Kaizen Quest propose :</p>
                <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                  <li>Des quêtes quotidiennes personnalisées basées sur vos objectifs</li>
                  <li>Un système de progression (XP, niveaux, badges)</li>
                  <li>Un suivi de vos accomplissements</li>
                </ul>
              </section>

              <section>
                <h4 className="font-bold text-white mb-2">3. Compte utilisateur</h4>
                <p>L'utilisation nécessite un compte Google. Vous êtes responsable de la confidentialité de vos identifiants.</p>
              </section>

              <section>
                <h4 className="font-bold text-white mb-2">4. Données personnelles</h4>
                <p>Nous collectons uniquement :</p>
                <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                  <li>Votre profil Google (nom, email, photo)</li>
                  <li>Vos objectifs et progression dans l'application</li>
                </ul>
                <p className="mt-2">Vos données sont stockées de manière sécurisée via Firebase/Firestore et ne sont jamais vendues à des tiers.</p>
              </section>

              <section>
                <h4 className="font-bold text-white mb-2">5. Propriété intellectuelle</h4>
                <p>L'application et son contenu sont protégés par le droit d'auteur. Toute reproduction non autorisée est interdite.</p>
              </section>

              <section>
                <h4 className="font-bold text-white mb-2">6. Limitation de responsabilité</h4>
                <p>Kaizen Quest est fourni "tel quel". Nous ne garantissons pas l'atteinte de vos objectifs personnels.</p>
              </section>

              <section>
                <h4 className="font-bold text-white mb-2">7. Modification des CGU</h4>
                <p>Nous nous réservons le droit de modifier ces CGU. Les utilisateurs seront informés des changements significatifs.</p>
              </section>

              <section>
                <h4 className="font-bold text-white mb-2">8. Contact</h4>
                <p>Pour toute question : contact@kaizenquest.app</p>
              </section>
            </div>
            <div className="p-4 border-t border-white/10">
              <button
                onClick={() => setShowCGU(false)}
                className="w-full py-3 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 font-semibold transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnboardingModal;
