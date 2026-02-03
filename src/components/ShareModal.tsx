import React, { useRef, useState } from 'react';
import { X, Share2, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import type { Player, Title } from '../types/types';

interface ShareModalProps {
  player: Player;
  currentTitle: Title;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ player, currentTitle, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const generateImage = async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    setGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#1e1b4b',
        scale: 2,
      });
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      });
    } catch (error) {
      console.error('Failed to generate image:', error);
      return null;
    } finally {
      setGenerating(false);
    }
  };

  const handleShare = async () => {
    const blob = await generateImage();
    if (!blob) return;

    const file = new File([blob], 'kaizen-quest-progress.png', { type: 'image/png' });

    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'Ma progression Kaizen Quest',
          text: `J'ai atteint le niveau ${player.level} sur Kaizen Quest ! 🎮`,
          files: [file],
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: download the image
      handleDownload();
    }
  };

  const handleDownload = async () => {
    const blob = await generateImage();
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kaizen-quest-progress.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const unlockedBadges = player.badges?.length || 0;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl max-w-md w-full border-2 border-purple-500/50 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-2xl font-bold">Partager ma progression</h3>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Shareable Card */}
          <div
            ref={cardRef}
            className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl p-6 mb-6"
          >
            <div className="text-center mb-4">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                ⚔️ Kaizen Quest ⚔️
              </h2>
            </div>

            <div className="bg-white/10 rounded-xl p-4 mb-4">
              <div className="text-center">
                <div className="text-5xl mb-2">{currentTitle.emoji}</div>
                <h3 className="text-xl font-bold">{player.name}</h3>
                <p className="text-purple-300">Niveau {player.level}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div className="bg-white/10 rounded-lg p-2">
                <p className="text-2xl font-bold text-pink-400">{player.questsCompleted}</p>
                <p className="text-xs text-gray-400">Quêtes</p>
              </div>
              <div className="bg-white/10 rounded-lg p-2">
                <p className="text-2xl font-bold text-yellow-400">{unlockedBadges}</p>
                <p className="text-xs text-gray-400">Succès</p>
              </div>
              <div className="bg-white/10 rounded-lg p-2">
                <p className="text-2xl font-bold text-orange-400">{player.bestStreak || 0}</p>
                <p className="text-xs text-gray-400">Best streak</p>
              </div>
            </div>

            <p className="text-center text-xs text-gray-500 mt-4">kaizen-quest.app</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleShare}
              disabled={generating}
              className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Share2 size={18} />
              )}
              Partager
            </button>
            <button
              onClick={handleDownload}
              disabled={generating}
              className="px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
