import React from 'react';
import type { Badge } from '../types/types';

interface BadgePopupProps {
  badge: Badge;
}

const BadgePopup: React.FC<BadgePopupProps> = ({ badge }) => {
  return (
    <div className="fixed top-6 right-6 z-50">
      <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-600 p-1 rounded-2xl">
        <div className="bg-slate-900 rounded-2xl p-6 flex items-center gap-4">
          <div className="text-5xl animate-bounce">{badge.emoji}</div>
          <div>
            <p className="text-xs text-yellow-400 font-bold">BADGE !</p>
            <h3 className="text-xl font-bold">{badge.name}</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BadgePopup;
