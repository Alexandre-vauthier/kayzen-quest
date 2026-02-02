import { useState, useCallback } from 'react';

export type ModalName = 'badges' | 'goals' | 'history' | 'onboarding' | 'settings' | 'dashboard';

export function useModals() {
  const [openModals, setOpenModals] = useState<Record<string, boolean>>({});

  const isOpen = useCallback((name: ModalName) => !!openModals[name], [openModals]);
  const open = useCallback((name: ModalName) => setOpenModals(prev => ({ ...prev, [name]: true })), []);
  const close = useCallback((name: ModalName) => setOpenModals(prev => ({ ...prev, [name]: false })), []);

  return { isOpen, open, close };
}
