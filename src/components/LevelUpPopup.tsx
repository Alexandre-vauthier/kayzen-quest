import React from 'react';
import { Loader2 } from 'lucide-react';
import type { LevelUpPopupData } from '../types/types';

interface LevelUpPopupProps {
  data: LevelUpPopupData;
  generatingStory: boolean;
}

const LevelUpPopup: React.FC<LevelUpPopupProps> = ({ data, generatingStory }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/60">
      <div className="animate-pop-in max-w-2xl w-full">
        <div className="animate-glow-pulse bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 p-1 rounded-3xl">
          <div className="bg-slate-900 rounded-3xl p-8">
            <div className="text-center">
              <div className="text-8xl animate-float mb-4">{data.title.emoji}</div>
              <p className="text-sm text-purple-400 font-bold tracking-widest mb-2">FÉLICITATIONS !</p>
              <h2 className="text-5xl font-bold mb-2 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                NIVEAU {data.level}
              </h2>
              {data.titleChanged && (
                <div className="mt-4 mb-2">
                  <p className="text-sm text-gray-400">Nouveau titre :</p>
                  <p className="text-2xl text-purple-300 font-bold">{data.title.emoji} {data.title.name}</p>
                </div>
              )}
            </div>
            {data.story ? (
              <div className="mt-6 p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20">
                <p className="text-lg leading-relaxed italic text-gray-200">{data.story}</p>
              </div>
            ) : generatingStory && (
              <div className="mt-6 flex items-center justify-center gap-2 text-purple-400">
                <Loader2 className="animate-spin" size={20} />
                <span>Création de ton histoire...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelUpPopup;
