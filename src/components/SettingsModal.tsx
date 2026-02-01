import React, { useState } from 'react';
import { X, ChevronRight, User, Bell, FileText, HelpCircle, ArrowLeft } from 'lucide-react';
import AccountPage from './AccountPage';

interface SettingsModalProps {
  onClose: () => void;
}

type SettingsPage = 'menu' | 'account' | 'notifications' | 'cgu' | 'support';

const settingsItems: { id: SettingsPage; label: string; icon: React.FC<any> }[] = [
  { id: 'account', label: 'Mon compte', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'cgu', label: 'CGU', icon: FileText },
  { id: 'support', label: 'Support', icon: HelpCircle },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [page, setPage] = useState<SettingsPage>('menu');

  const renderPage = () => {
    if (page === 'menu') {
      return (
        <div className="space-y-2">
          {settingsItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className="w-full flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} className="text-gray-400" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight size={18} className="text-gray-500" />
              </button>
            );
          })}
        </div>
      );
    }

    if (page === 'account') {
      return <AccountPage />;
    }

    return (
      <div className="text-center py-12 text-gray-400">
        <p>Cette section sera bientôt disponible.</p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-2xl max-w-lg w-full border-2 border-purple-500/50 max-h-[85vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            {page !== 'menu' && (
              <button onClick={() => setPage('menu')} className="hover:text-purple-400 transition-colors">
                <ArrowLeft size={20} />
              </button>
            )}
            <h3 className="text-2xl font-bold">
              {page === 'menu' ? 'Paramètres' : settingsItems.find(i => i.id === page)?.label}
            </h3>
          </div>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {renderPage()}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
