export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type QuestType = 'daily' | 'weekly' | 'main';
export type CategoryType = 'body' | 'mind' | 'environment' | 'projects' | 'social';
export type DevelopmentLevel = 'none' | 'low' | 'medium' | 'high' | 'advanced';

export interface PlayerStats {
  body: number;
  mind: number;
  environment: number;
  projects: number;
  social: number;
}

export interface Theme {
  id: string;
  name: string;
  questsCompleted: number;
  lastTouched: string | null;
  developmentLevel: DevelopmentLevel;
}

export interface Goal {
  id: string;
  label: string;
  themes: Theme[];
  createdAt: string;
}

export interface StoryChapter {
  level: number;
  title: string;
  story: string;
  date: string;
}

export interface Player {
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  stats: PlayerStats;
  badges: string[];
  questsCompleted: number;
  hardQuestsCompleted: number;
  dailyStreak: number;
  lastCompletionDate: string | null;
  goals: Goal[];
  rituals: Ritual[];
  storyChapters: StoryChapter[];
  onboardingComplete: boolean;
}

export interface Quest {
  id: number;
  title: string;
  category: CategoryType;
  difficulty: DifficultyLevel;
  completed: boolean;
  type: QuestType;
  goalId: string | null;
  themeId: string | null;
}

export interface Quests {
  daily: Quest[];
  weekly: Quest[];
  main: Quest[];
}

export interface QuestHistory {
  title: string;
  date: string;
  goalId: string | null;
  themeId: string | null;
}

export interface Ritual {
  id: number;
  title: string;
  category: CategoryType;
  streak: number;
  completedToday: boolean;
  lastCompletedDate?: string;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  condition: (player: Player) => boolean;
}

export interface Title {
  maxLevel: number;
  name: string;
  emoji: string;
}

export interface PresetGoal {
  id: string;
  label: string;
  emoji: string;
}

export interface Category {
  icon: any;
  color: string;
  name: string;
}

export interface LevelUpPopupData {
  level: number;
  title: Title;
  titleChanged: boolean;
  story: string | null;
}

export interface LastReset {
  daily: string;
  weekly: string;
}
