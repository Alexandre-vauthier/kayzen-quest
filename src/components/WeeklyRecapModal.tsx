import React from 'react';
import { X, Loader2, ScrollText } from 'lucide-react';

interface WeeklyRecapModalProps {
  recap: string | null;
  generating: boolean;
  onClose: () => void;
}

const WeeklyRecapModal: React.FC<WeeklyRecapModalProps> = ({ recap, generating, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl max-w-lg w-full border-2 border-blue-500/50 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ScrollText className="text-blue-400" size={24} />
            <h3 className="text-2xl font-bold">Récap de la semaine</h3>
          </div>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          {generating ? (
            <div className="text-center py-8">
              <Loader2 className="animate-spin mx-auto mb-4 text-blue-400" size={32} />
              <p className="text-gray-400">Analyse de ta semaine...</p>
            </div>
          ) : recap ? (
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl p-5 border border-blue-500/20">
              <p className="text-gray-200 leading-relaxed whitespace-pre-line">{recap}</p>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">Aucune donnée disponible</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WeeklyRecapModal;
