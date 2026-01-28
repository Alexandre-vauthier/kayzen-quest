import React from 'react';
import { Loader2 } from 'lucide-react';
import type { LevelUpPopupData } from '../types/types';

interface LevelUpPopupProps {
  data: LevelUpPopupData;
  generatingStory: boolean;
}

const LevelUpPopup: React.FC<LevelUpPopupProps> = ({ data, generatingStory }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/50">
      <div className="bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 p-1 rounded-3xl max-w-2xl w-full">
        <div className="bg-slate-900 rounded-3xl p-8">
          <div className="text-center">
            <div className="text-8xl mb-4 animate-pulse">{data.title.emoji}</div>
            <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
              NIVEAU {data.level} !
            </h2>
            {data.titleChanged && <p className="text-2xl text-purple-300 mt-2 mb-4">Tu es {data.title.name} !</p>}
          </div>
          {data.story ? (
            <div className="mt-6 p-6 bg-white/5 rounded-2xl">
              <p className="text-lg leading-relaxed italic">{data.story}</p>
            </div>
          ) : generatingStory && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Loader2 className="animate-spin" size={20} />
              <span>Génération...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LevelUpPopup;
