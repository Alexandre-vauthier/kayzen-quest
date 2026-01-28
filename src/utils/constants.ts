import { Heart, Brain, Home, Briefcase, Users } from 'lucide-react';
import type { Badge, Title, PresetGoal, Category, DifficultyLevel } from '../types/types';

export const difficultyXP: Record<DifficultyLevel, number> = {
  easy: 10,
  medium: 25,
  hard: 50
};

export const ritualXP = 5;

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

export const allBadges: Badge[] = [
  { id: 'first-quest', name: 'Premier Pas', emoji: '🔥', description: 'Première quête', condition: (p) => p.questsCompleted >= 1 },
  { id: 'streak-7', name: 'Régularité', emoji: '📅', description: '7 jours consécutifs', condition: (p) => p.dailyStreak >= 7 },
  { id: 'body-100', name: 'Athlète', emoji: '💪', description: '100 XP Corps', condition: (p) => p.stats.body >= 100 },
  { id: 'mind-100', name: 'Érudit', emoji: '🧠', description: '100 XP Esprit', condition: (p) => p.stats.mind >= 100 },
  { id: 'env-100', name: 'Organisé', emoji: '🏠', description: '100 XP Environnement', condition: (p) => p.stats.environment >= 100 },
  { id: 'proj-100', name: 'Productif', emoji: '💼', description: '100 XP Projets', condition: (p) => p.stats.projects >= 100 },
  { id: 'social-100', name: 'Social', emoji: '👥', description: '100 XP Social', condition: (p) => p.stats.social >= 100 },
  { id: 'hard-10', name: 'Perfectionniste', emoji: '🌟', description: '10 quêtes difficiles', condition: (p) => p.hardQuestsCompleted >= 10 },
  { id: 'total-50', name: 'Conquérant', emoji: '🎯', description: '50 quêtes', condition: (p) => p.questsCompleted >= 50 },
  { id: 'level-10', name: 'Légende', emoji: '🏆', description: 'Niveau 10', condition: (p) => p.level >= 10 },
];

export const difficultyColors: Record<DifficultyLevel, string> = {
  easy: 'border-green-500/30 bg-green-500/5',
  medium: 'border-yellow-500/30 bg-yellow-500/5',
  hard: 'border-red-500/30 bg-red-500/5'
};
