import { useState, useCallback, useRef } from 'react';
import type { Badge, LevelUpPopupData } from '../types/types';
import { celebrateBadge, celebrateLevelUp, celebratePerfectDay } from '../utils/celebrations';

export function usePopups() {
  const [levelUpPopup, setLevelUpPopup] = useState<LevelUpPopupData | null>(null);
  const [badgePopup, setBadgePopup] = useState<Badge | null>(null);
  const [perfectDayPopup, setPerfectDayPopup] = useState(false);
  const [generatingStory, setGeneratingStory] = useState(false);

  const badgeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const levelUpTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const perfectDayTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const showBadge = useCallback((badge: Badge) => {
    if (badgeTimeoutRef.current) clearTimeout(badgeTimeoutRef.current);
    setBadgePopup(badge);
    celebrateBadge();
    badgeTimeoutRef.current = setTimeout(() => setBadgePopup(null), 4000);
  }, []);

  const showLevelUp = useCallback((data: LevelUpPopupData, duration = 8000) => {
    if (levelUpTimeoutRef.current) clearTimeout(levelUpTimeoutRef.current);
    setLevelUpPopup(data);
    celebrateLevelUp();
    levelUpTimeoutRef.current = setTimeout(() => setLevelUpPopup(null), duration);
  }, []);

  const showPerfectDay = useCallback(() => {
    if (perfectDayTimeoutRef.current) clearTimeout(perfectDayTimeoutRef.current);
    setPerfectDayPopup(true);
    celebratePerfectDay();
    perfectDayTimeoutRef.current = setTimeout(() => setPerfectDayPopup(false), 5000);
  }, []);

  return {
    levelUpPopup,
    badgePopup,
    perfectDayPopup,
    generatingStory,
    showBadge,
    showLevelUp,
    showPerfectDay,
    setGeneratingStory,
  };
}
