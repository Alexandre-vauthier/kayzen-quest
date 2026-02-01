import React from 'react';
import ReactDOM from 'react-dom/client';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import KaizenQuest from './components/KaizenQuest';
import LoginScreen from './components/LoginScreen';
import './index.css';

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-400" size={40} />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return <KaizenQuest />;
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
);
