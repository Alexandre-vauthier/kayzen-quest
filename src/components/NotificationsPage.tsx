import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  isPushSupported,
  getPermissionState,
  enableNotifications,
  disableNotifications,
  updateNotificationTime,
  loadNotificationSettings,
} from '../services/notificationService';

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState('08:00');
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supported = isPushSupported();
  const permissionDenied = getPermissionState() === 'denied';

  useEffect(() => {
    if (!user || !supported) {
      setLoading(false);
      return;
    }
    loadNotificationSettings(user.uid).then((settings) => {
      if (settings) {
        setEnabled(settings.enabled);
        setTime(settings.time);
      }
      setLoading(false);
    });
  }, [user, supported]);

  const handleToggle = async () => {
    if (!user) return;
    setToggling(true);
    setError(null);

    try {
      if (enabled) {
        await disableNotifications(user.uid);
        setEnabled(false);
      } else {
        const success = await enableNotifications(user.uid, time);
        if (success) {
          setEnabled(true);
        } else {
          setError('Permission refusée par le navigateur. Vérifie les paramètres de ton navigateur.');
        }
      }
    } catch {
      setError('Une erreur est survenue. Réessaie plus tard.');
    } finally {
      setToggling(false);
    }
  };

  const handleTimeChange = async (newTime: string) => {
    setTime(newTime);
    if (!user || !enabled) return;
    try {
      await updateNotificationTime(user.uid, newTime);
    } catch {
      // Silent fail for time update
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-purple-400" size={24} />
      </div>
    );
  }

  if (!supported) {
    return (
      <div className="text-center py-8">
        <BellOff className="mx-auto mb-4 text-gray-500" size={32} />
        <p className="text-gray-400 mb-2">Notifications non supportées</p>
        <p className="text-sm text-gray-500">
          Ton navigateur ne supporte pas les notifications push. Essaie avec Chrome ou Safari 16.4+.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
        <div className="flex items-center gap-3">
          <Bell size={20} className={enabled ? 'text-purple-400' : 'text-gray-400'} />
          <div>
            <p className="font-semibold">Rappel quotidien</p>
            <p className="text-sm text-gray-400">Reçois une notification pour tes quêtes</p>
          </div>
        </div>
        <button
          onClick={handleToggle}
          disabled={toggling || permissionDenied}
          className={`relative w-12 h-7 rounded-full transition-colors ${
            enabled ? 'bg-purple-500' : 'bg-gray-600'
          } ${toggling || permissionDenied ? 'opacity-50' : ''}`}
        >
          {toggling ? (
            <Loader2 className="absolute top-1 left-1 animate-spin text-white" size={20} />
          ) : (
            <div
              className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          )}
        </button>
      </div>

      {/* Time picker */}
      {enabled && (
        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-purple-400" />
            <div>
              <p className="font-semibold">Heure du rappel</p>
              <p className="text-sm text-gray-400">Choisis l'heure de ta notification</p>
            </div>
          </div>
          <input
            type="time"
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white outline-none"
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Permission denied warning */}
      {permissionDenied && !error && (
        <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
          <p className="text-sm text-yellow-300">
            Les notifications sont bloquées par ton navigateur. Pour les activer, modifie les permissions du site dans les paramètres de ton navigateur.
          </p>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
