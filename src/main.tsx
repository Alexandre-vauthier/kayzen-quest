import React from 'react'
import ReactDOM from 'react-dom/client'
import KaizenQuest from './components/KaizenQuest'
import './index.css'

// Mock storage API pour le navigateur
if (typeof window !== 'undefined' && !(window as any).storage) {
  (window as any).storage = {
    get: async (key: string) => {
      const value = localStorage.getItem(key);
      return value ? { value } : null;
    },
    set: async (key: string, value: string) => {
      localStorage.setItem(key, value);
    }
  };
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <KaizenQuest />
  </React.StrictMode>,
)
