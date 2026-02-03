export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type QuestStatus = 'available' | 'selected' | 'bonus' | 'completed';
export type CategoryType = 'body' | 'mind' | 'environment' | 'projects' | 'social';
export type DevelopmentLevel = 'none' | 'low' | 'medium' | 'high' | 'advanced';

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
  archivedAt?: string;
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
  badges: string[];
  questsCompleted: number;
  hardQuestsCompleted: number;
  perfectDays: number;
  goals: Goal[];
  storyChapters: StoryChapter[];
  onboardingComplete: boolean;
  premium?: boolean;
  currentStreak?: number;
  bestStreak?: number;
  bonusQuestsCompleted?: number;
  pinnedQuests?: string[];
  streakFreezeUsedAt?: string;
  streakFreezeDays?: string[];
}

export interface Quest {
  id: number;
  title: string;
  description?: string;
  estimatedTime?: string;
  category: CategoryType;
  difficulty: DifficultyLevel;
  status: QuestStatus;
  isSelectedQuest: boolean;
  goalId: string | null;
  themeId: string | null;
  completedAt?: string;
  wasBonus?: boolean;
  completionMessage?: string;
  feedback?: 'up' | 'down';
  isPinned?: boolean;
}

export interface DailyQuests {
  quests: Quest[];
  selectedQuestId: number | null;
  date: string;
  questRefreshesUsed?: number;
}

export interface QuestHistory {
  title: string;
  date: string;
  goalId: string | null;
  themeId: string | null;
  wasPerfectDay: boolean;
  category?: CategoryType;
  difficulty?: DifficultyLevel;
  feedback?: 'up' | 'down';
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
