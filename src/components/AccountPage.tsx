import React, { useState } from 'react';
import { LogOut, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AccountPage: React.FC = () => {
  const { user, signOut, deleteAccount } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const provider = user.providerData[0]?.providerId === 'apple.com' ? 'Apple' : 'Google';

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await deleteAccount();
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/requires-recent-login') {
        setError('Pour des raisons de sécurité, reconnecte-toi puis réessaie.');
      } else {
        setError('Une erreur est survenue. Réessaie.');
      }
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt="Photo de profil"
            className="w-16 h-16 rounded-full border-2 border-purple-500"
            referrerPolicy="no-referrer"
          />
        )}
        <div>
          <p className="font-bold text-lg">{user.displayName || 'Aventurier'}</p>
          <p className="text-gray-400 text-sm">{user.email}</p>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-4">
        <p className="text-sm text-gray-400 mb-1">Connexion via</p>
        <p className="text-sm">{provider}</p>
      </div>

      <button
        onClick={signOut}
        className="w-full py-3 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 font-bold flex items-center justify-center gap-2 transition-colors"
      >
        <LogOut size={18} />
        Se déconnecter
      </button>

      <div className="border-t border-white/10 pt-6">
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full py-3 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-300 text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 size={16} />
            Supprimer mon compte
          </button>
        ) : (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle size={18} />
              <p className="font-bold text-sm">Suppression définitive</p>
            </div>
            <p className="text-sm text-gray-300">
              Toutes tes données seront supprimées : personnage, quêtes, historique. Cette action est irréversible.
            </p>
            {error && (
              <p className="text-sm text-red-400 bg-red-900/30 rounded p-2">{error}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowConfirm(false); setError(null); }}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-bold transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition-colors disabled:opacity-50"
              >
                {deleting ? 'Suppression...' : 'Confirmer'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;
