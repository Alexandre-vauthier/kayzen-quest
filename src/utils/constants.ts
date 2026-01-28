import { Heart, Brain, Home, Briefcase, Users } from 'lucide-react';
import type { Badge, Title, PresetGoal, Category, DifficultyLevel } from '../types/types';

export const difficultyXP: Record<DifficultyLevel, number> = {
  easy: 10,
  medium: 25,
  hard: 50
};

// Bonus XP multiplier pour les quêtes bonus
export const BONUS_QUEST_MULTIPLIER = 1.5;

export const categories: Record<string, Category> = {
  body: { icon: Heart, color: 'text-red-400', name: 'Corps' },
  mind: { icon: Brain, color: 'text-purple-400', name: 'Esprit' },
  environment: { icon: Home, color: 'text-green-400', name: 'Environnement' },
  projects: { icon: Briefcase, color: 'text-blue-400', name: 'Projets' },
  social: { icon: Users, color: 'text-yellow-400', name: 'Social' }
};

export const titles: Title[] = [
  { maxLevel: 5, name: 'Aventurier', emoji: '🌱' },
  { maxLevel: 10, name: 'Disciple', emoji: '🎋' },
  { maxLevel: 15, name: 'Voyageur', emoji: '🗺️' },
  { maxLevel: 20, name: 'Maître', emoji: '⛩️' },
  { maxLevel: 30, name: 'Sage', emoji: '🧘' },
  { maxLevel: Infinity, name: 'Légende', emoji: '✨' }
];

export const presetGoals: PresetGoal[] = [
  { id: 'fitness', label: 'Être en meilleure forme physique', emoji: '💪' },
  { id: 'creative', label: 'Être plus créatif', emoji: '🎨' },
  { id: 'organized', label: 'Être plus organisé', emoji: '📋' },
  { id: 'learning', label: 'Apprendre et me cultiver', emoji: '📚' },
  { id: 'social', label: 'Développer ma vie sociale', emoji: '👥' },
  { id: 'career', label: 'Faire avancer ma carrière', emoji: '💼' },
  { id: 'wellness', label: 'Prendre soin de mon bien-être mental', emoji: '🧘' },
  { id: 'financial', label: 'Améliorer mes finances', emoji: '💰' },
];

// 5 badges simplifiés - focus sur la vraie progression
export const allBadges: Badge[] = [
  {
    id: 'first-quest',
    name: 'Premier Pas',
    emoji: '🔥',
    description: 'Compléter la 1ère quête',
    condition: (p) => p.questsCompleted >= 1
  },
  {
    id: 'explorer',
    name: 'Explorateur',
    emoji: '🌟',
    description: 'Atteindre le niveau 5',
    condition: (p) => p.level >= 5
  },
  {
    id: 'master',
    name: 'Maître',
    emoji: '🏆',
    description: 'Atteindre le niveau 10',
    condition: (p) => p.level >= 10
  },
  {
    id: 'centurion',
    name: 'Centurion',
    emoji: '💯',
    description: 'Compléter 100 quêtes',
    condition: (p) => p.questsCompleted >= 100
  },
  {
    id: 'perfectionist',
    name: 'Perfectionniste',
    emoji: '⚡',
    description: 'Compléter 25 quêtes difficiles',
    condition: (p) => p.hardQuestsCompleted >= 25
  },
];

export const difficultyColors: Record<DifficultyLevel, string> = {
  easy: 'border-green-500/30 bg-green-500/5',
  medium: 'border-yellow-500/30 bg-yellow-500/5',
  hard: 'border-red-500/30 bg-red-500/5'
};
