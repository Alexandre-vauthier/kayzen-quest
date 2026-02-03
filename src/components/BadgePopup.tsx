import React from 'react';
import type { Badge } from '../types/types';

interface BadgePopupProps {
  badge: Badge;
}

const BadgePopup: React.FC<BadgePopupProps> = ({ badge }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/60">
      <div className="animate-pop-in">
        <div className="animate-glow-pulse bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-600 p-1 rounded-3xl">
          <div className="bg-slate-900 rounded-3xl p-8 text-center min-w-[280px]">
            <div className="relative">
              <div className="text-8xl animate-float mb-4">{badge.emoji}</div>
              <div className="absolute inset-0 animate-shimmer rounded-full pointer-events-none" />
            </div>
            <p className="text-sm text-yellow-400 font-bold tracking-widest mb-2">SUCCÈS DÉBLOQUÉ !</p>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-2">
              {badge.name}
            </h3>
            <p className="text-gray-400 text-sm">{badge.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgePopup;
