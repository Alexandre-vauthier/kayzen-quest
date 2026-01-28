import React from 'react';
import { X, Trophy } from 'lucide-react';
import { titles } from '../utils/constants';
import type { StoryChapter } from '../types/types';

interface HistoryModalProps {
  storyChapters: StoryChapter[];
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ storyChapters, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl max-w-3xl w-full border-2 border-pink-500/50 max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-3xl font-bold flex items-center gap-3">
            <Trophy className="text-pink-400" />
            Mon Histoire
          </h3>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {storyChapters && storyChapters.length > 0 ? (
            <div className="space-y-6">
              {storyChapters.map((ch, i) => {
                const chTitle = titles.find(t => ch.level <= t.maxLevel) || titles[titles.length - 1];
                return (
                  <div key={i} className="bg-white/5 rounded-2xl p-6 border-2 border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-4xl">{chTitle.emoji}</span>
                      <div>
                        <h4 className="text-xl font-bold">Niveau {ch.level} - {ch.title}</h4>
                        <p className="text-xs text-gray-400">{new Date(ch.date).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                    <p className="text-gray-200 leading-relaxed italic">{ch.story}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">Ton histoire commence...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
