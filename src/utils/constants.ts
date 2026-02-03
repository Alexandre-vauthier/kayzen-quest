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
  { id: 'fitness', label: 'Bouger plus au quotidien', emoji: '💪' },
  { id: 'creative', label: 'Pratiquer une activité créative', emoji: '🎨' },
  { id: 'organized', label: 'Mieux structurer mes journées', emoji: '📋' },
  { id: 'learning', label: 'Apprendre quelque chose chaque jour', emoji: '📚' },
  { id: 'wellness', label: 'Prendre du temps pour moi', emoji: '🧘' },
  { id: 'financial', label: 'Mieux gérer mon argent', emoji: '💰' },
];

export const allBadges: Badge[] = [
  // Premiers pas
  { id: 'first-quest', name: 'Premier Pas', emoji: '🔥', description: 'Compléter ta 1ère quête', condition: (p) => p.questsCompleted >= 1 },
  { id: 'ten-quests', name: 'Lancé', emoji: '🚀', description: 'Compléter 10 quêtes', condition: (p) => p.questsCompleted >= 10 },
  { id: 'fifty-quests', name: 'Vétéran', emoji: '🎖️', description: 'Compléter 50 quêtes', condition: (p) => p.questsCompleted >= 50 },
  { id: 'centurion', name: 'Centurion', emoji: '💯', description: 'Compléter 100 quêtes', condition: (p) => p.questsCompleted >= 100 },
  // Niveaux
  { id: 'explorer', name: 'Explorateur', emoji: '🌟', description: 'Atteindre le niveau 5', condition: (p) => p.level >= 5 },
  { id: 'master', name: 'Maître', emoji: '🏆', description: 'Atteindre le niveau 10', condition: (p) => p.level >= 10 },
  { id: 'level-20', name: 'Légende Vivante', emoji: '👑', description: 'Atteindre le niveau 20', condition: (p) => p.level >= 20 },
  // Streaks
  { id: 'dedicated', name: 'Assidu', emoji: '📅', description: '3 jours de suite', condition: (p) => (p.bestStreak || 0) >= 3 },
  { id: 'streak-7', name: 'Flamme Éternelle', emoji: '🔥', description: '7 jours de suite', condition: (p) => (p.bestStreak || 0) >= 7 },
  { id: 'streak-30', name: 'Inarrêtable', emoji: '💫', description: '30 jours de suite', condition: (p) => (p.bestStreak || 0) >= 30 },
  // Journées parfaites
  { id: 'first-perfect', name: 'Sans Faute', emoji: '✨', description: '1ère journée parfaite', condition: (p) => p.perfectDays >= 1 },
  { id: 'five-perfect', name: 'Exemplaire', emoji: '🏅', description: '5 journées parfaites', condition: (p) => p.perfectDays >= 5 },
  // Difficulté
  { id: 'hard-5', name: 'Courageux', emoji: '💪', description: '5 quêtes difficiles', condition: (p) => p.hardQuestsCompleted >= 5 },
  { id: 'perfectionist', name: 'Perfectionniste', emoji: '⚡', description: '25 quêtes difficiles', condition: (p) => p.hardQuestsCompleted >= 25 },
  // Bonus
  { id: 'bonus-10', name: 'Surperformant', emoji: '⭐', description: '10 quêtes bonus complétées', condition: (p) => (p.bonusQuestsCompleted || 0) >= 10 },
];

export const genericCompletionMessages: string[] = [
  'Chaque petit pas compte sur le chemin de ta progression.',
  'Une action de plus vers la meilleure version de toi-même.',
  'La constance est la clé de toute transformation.',
  'Tu construis tes habitudes, une quête à la fois.',
  'Le plus important, c\'est de continuer à avancer.',
  'Ta discipline d\'aujourd\'hui est ta liberté de demain.',
  'Chaque effort te rapproche de ton objectif.',
  'La progression se cache dans la régularité.',
];

export const difficultyColors: Record<DifficultyLevel, string> = {
  easy: 'border-green-500/30 bg-green-500/5',
  medium: 'border-yellow-500/30 bg-yellow-500/5',
  hard: 'border-red-500/30 bg-red-500/5'
};

export const dailyQuotes: { text: string; author: string }[] = [
  { text: "Le voyage de mille lieues commence par un pas.", author: "Lao Tseu" },
  { text: "La seule façon de faire du bon travail est d'aimer ce que vous faites.", author: "Steve Jobs" },
  { text: "Chaque jour est une nouvelle chance de changer ta vie.", author: "Anonyme" },
  { text: "Le succès n'est pas final, l'échec n'est pas fatal. C'est le courage de continuer qui compte.", author: "Winston Churchill" },
  { text: "Sois le changement que tu veux voir dans le monde.", author: "Gandhi" },
  { text: "L'avenir appartient à ceux qui croient à la beauté de leurs rêves.", author: "Eleanor Roosevelt" },
  { text: "Ce n'est pas parce que les choses sont difficiles que nous n'osons pas, c'est parce que nous n'osons pas qu'elles sont difficiles.", author: "Sénèque" },
  { text: "La discipline est le pont entre les objectifs et les accomplissements.", author: "Jim Rohn" },
  { text: "Petit à petit, l'oiseau fait son nid.", author: "Proverbe français" },
  { text: "La motivation vous fait commencer, l'habitude vous fait continuer.", author: "Jim Ryun" },
  { text: "Ne remets pas à demain ce que tu peux faire aujourd'hui.", author: "Benjamin Franklin" },
  { text: "Celui qui déplace une montagne commence par déplacer de petites pierres.", author: "Confucius" },
  { text: "La perfection n'est pas atteignable, mais si nous visons la perfection, nous pouvons atteindre l'excellence.", author: "Vince Lombardi" },
  { text: "Le meilleur moment pour planter un arbre était il y a 20 ans. Le deuxième meilleur moment est maintenant.", author: "Proverbe chinois" },
  { text: "Fais de ta vie un rêve, et d'un rêve, une réalité.", author: "Antoine de Saint-Exupéry" },
  { text: "La simplicité est la sophistication suprême.", author: "Léonard de Vinci" },
  { text: "Vis comme si tu devais mourir demain. Apprends comme si tu devais vivre éternellement.", author: "Gandhi" },
  { text: "Le plus grand voyage commence toujours par un premier pas.", author: "Bouddha" },
  { text: "Ce qui ne nous tue pas nous rend plus fort.", author: "Nietzsche" },
  { text: "La vie est 10% ce qui nous arrive et 90% comment nous y réagissons.", author: "Charles R. Swindoll" },
  { text: "Chaque expert était autrefois un débutant.", author: "Helen Hayes" },
  { text: "Le secret du changement est de concentrer toute ton énergie non pas à lutter contre le passé, mais à construire l'avenir.", author: "Socrate" },
  { text: "La seule limite à notre réalisation de demain sera nos doutes d'aujourd'hui.", author: "Franklin D. Roosevelt" },
  { text: "Un objectif sans plan n'est qu'un souhait.", author: "Antoine de Saint-Exupéry" },
  { text: "Crois en toi et tout devient possible.", author: "Anonyme" },
  { text: "L'échec est simplement l'opportunité de recommencer, cette fois plus intelligemment.", author: "Henry Ford" },
  { text: "Les grandes choses ne sont jamais faites par une seule personne. Elles sont faites par une équipe.", author: "Steve Jobs" },
  { text: "Le bonheur n'est pas quelque chose de prêt à l'emploi. Il vient de tes propres actions.", author: "Dalai Lama" },
  { text: "Commence là où tu es. Utilise ce que tu as. Fais ce que tu peux.", author: "Arthur Ashe" },
  { text: "La persévérance n'est pas une longue course; c'est plusieurs petites courses, l'une après l'autre.", author: "Walter Elliot" },
  { text: "Ton attitude détermine ton altitude.", author: "Zig Ziglar" },
];

// Get quote of the day based on date (deterministic)
export function getDailyQuote(): { text: string; author: string } {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  return dailyQuotes[dayOfYear % dailyQuotes.length];
}
