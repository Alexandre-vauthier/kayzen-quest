import React from 'react';
import { X, Check } from 'lucide-react';
import { categories } from '../utils/constants';
import type { Ritual, CategoryType } from '../types/types';

interface RitualsModalProps {
  rituals: Ritual[];
  newRitual: { title: string; category: CategoryType };
  generatingRituals: boolean;
  onClose: () => void;
  onToggleRitual: (ritualId: number) => void;
  onDeleteRitual: (ritualId: number) => void;
  onNewRitualChange: (ritual: { title: string; category: CategoryType }) => void;
  onAddRitual: () => void;
  onGenerateRituals: () => void;
}

const RitualsModal: React.FC<RitualsModalProps> = ({
  rituals,
  newRitual,
  generatingRituals,
  onClose,
  onToggleRitual,
  onDeleteRitual,
  onNewRitualChange,
  onAddRitual,
  onGenerateRituals
}) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl max-w-2xl w-full border-2 border-blue-500/50 max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-3xl font-bold">Rituels</h3>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {rituals.length > 0 && (
            <div className="space-y-3 mb-6">
              {rituals.map(ritual => {
                const Icon = categories[ritual.category].icon;
                return (
                  <div key={ritual.id} className={`flex items-center justify-between bg-white/10 rounded-lg p-4 border-2 ${ritual.completedToday ? 'border-green-500/50' : 'border-white/20'}`}>
                    <div className="flex items-center gap-3 flex-1">
                      <button onClick={() => onToggleRitual(ritual.id)} className={`w-6 h-6 rounded border-2 flex items-center justify-center ${ritual.completedToday ? 'bg-green-500 border-green-500' : 'border-white/40'}`}>
                        {ritual.completedToday && <Check size={16} />}
                      </button>
                      <Icon className={categories[ritual.category].color} size={20} />
                      <div className="flex-1">
                        <h4 className={ritual.completedToday ? 'line-through' : ''}>{ritual.title}</h4>
                        {ritual.streak > 0 && <p className="text-xs text-orange-400">🔥 {ritual.streak}</p>}
                      </div>
                    </div>
                    <button onClick={() => onDeleteRitual(ritual.id)}>
                      <X size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <input
            type="text"
            placeholder="Nouveau rituel..."
            value={newRitual.title}
            onChange={(e) => onNewRitualChange({ ...newRitual, title: e.target.value })}
            className="w-full bg-white/10 rounded-lg px-4 py-3 mb-3 border border-white/20 outline-none"
          />
          <select
            value={newRitual.category}
            onChange={(e) => onNewRitualChange({ ...newRitual, category: e.target.value as CategoryType })}
            className="w-full bg-white/10 rounded-lg px-4 py-3 mb-3 border border-white/20 outline-none"
          >
            {Object.entries(categories).map(([key, cat]) => (
              <option key={key} value={key}>{cat.name}</option>
            ))}
          </select>
          <div className="flex gap-3">
            <button onClick={onAddRitual} disabled={!newRitual.title.trim()} className="flex-1 px-4 py-3 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50">
              Ajouter
            </button>
            <button onClick={onGenerateRituals} disabled={generatingRituals} className="flex-1 px-4 py-3 rounded-lg bg-purple-500 hover:bg-purple-600 disabled:opacity-50">
              {generatingRituals ? 'Génération...' : 'Suggérer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RitualsModal;
