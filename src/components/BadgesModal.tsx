import React from 'react';
import { X } from 'lucide-react';
import { allBadges } from '../utils/constants';
import type { Player } from '../types/types';

interface BadgesModalProps {
  player: Player;
  onClose: () => void;
}

const BadgesModal: React.FC<BadgesModalProps> = ({ player, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl max-w-3xl w-full border-2 border-yellow-500/50 max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-3xl font-bold">Succès</h3>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 p-6 border-b border-white/10">
          <div className="bg-black/20 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{player.questsCompleted}</p>
            <p className="text-sm text-gray-400">Quêtes complétées</p>
          </div>
          <div className="bg-black/20 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold">{player.perfectDays}</p>
            <p className="text-sm text-gray-400">Journées parfaites</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 p-6 overflow-y-auto">
          {allBadges.map(badge => {
            const unlocked = player.badges && player.badges.includes(badge.id);
            return (
              <div key={badge.id} className={`p-4 rounded-xl border-2 text-center ${unlocked ? 'bg-yellow-500/20 border-yellow-500/50' : 'bg-white/5 border-white/10 opacity-50'}`}>
                <div className={`text-4xl mb-2 ${unlocked ? 'animate-pulse' : 'grayscale'}`}>{badge.emoji}</div>
                <h4 className="font-bold">{badge.name}</h4>
                <p className="text-xs text-gray-400">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BadgesModal;
