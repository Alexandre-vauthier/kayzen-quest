import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AccountPage: React.FC = () => {
  const { user, signOut } = useAuth();

  if (!user) return null;

  const provider = user.providerData[0]?.providerId === 'apple.com' ? 'Apple' : 'Google';

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
    </div>
  );
};

export default AccountPage;
