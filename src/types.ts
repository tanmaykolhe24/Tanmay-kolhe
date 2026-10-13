export type RankTier = 'Rookie' | 'Explorer' | 'Strategist' | 'Elite' | 'Mastermind' | 'Legend';

export interface AvatarConfig {
  style: string;
  hairstyle: string;
  outfit: string;
  accessory: string;
  frame: string;
  background: string;
  unlockedItems: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  grade: string;
  targetExam: string;
  wakeTime: string;
  bedTime: string;
  preferredFocusLength: number; // in minutes (e.g. 25, 45, 60)
  xp: number;
  level: number;
  rank: RankTier;
  gems: number;
  streak: number;
  longestStreak: number;
  lastActiveDate: string;
  avatar: AvatarConfig;
  completedTaskIds: string[]; // for anti-duplicate XP awards
  theme: 'dark' | 'light';
  soundEnabled: boolean;
}

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low' | 'fixed';
export type TaskCategory = 'study' | 'revision' | 'practice' | 'school' | 'break' | 'personal';

export interface TaskBlock {
  id: string;
  day: string; // e.g. "Monday" or "2026-10-13"
  startTime: string; // "06:00"
  endTime: string; // "07:15"
  subject: string;
  description: string;
  priority: TaskPriority;
  category: TaskCategory;
  isFixed: boolean;
  completed: boolean;
  completedAt?: string;
  aiRationale?: string;
  durationMinutes: number;
}

export interface Mission {
  id: string;
  title: string;
  subject: string;
  durationMinutes: number;
  priority: TaskPriority;
  scheduledTime: string;
  xpReward: number;
  gemsReward: number;
  status: 'pending' | 'in_progress' | 'completed' | 'postponed' | 'cancelled';
  notes?: string;
  completedAt?: string;
}

export interface BossStage {
  stageNumber: number;
  title: string;
  xpReward: number;
  isComplete: boolean;
}

export interface BossBattle {
  id: string;
  title: string;
  subject: string;
  bossHp: number;
  currentHp: number;
  stages: BossStage[];
}

export interface ExamChapter {
  id: string;
  subject: string;
  chapterName: string;
  confidence: 'low' | 'medium' | 'high';
  isCompleted: boolean;
  notes?: string;
}

export interface ExamPlan {
  id: string;
  examName: string;
  examDate: string;
  daysRemaining: number;
  subjects: string[];
  chapters: ExamChapter[];
  feasibilityAssessment?: string;
  dailyTargetChapters?: string;
  recommendedPrioritiesToday: string[];
  mockTestMilestones: { title: string; scheduledDate: string; focus: string; isDone?: boolean }[];
  bossBattles: BossBattle[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  category: 'missions' | 'streak' | 'exams' | 'focus';
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
  xpBonus: number;
}

export interface FriendChallenge {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  rewardGems: number;
  progress: number;
  target: number;
  unit: string;
  expiresInDays: number;
  participants: { name: string; avatar: string; progress: number }[];
  isJoined: boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'outfit' | 'hairstyle' | 'accessory' | 'frame' | 'world_theme';
  costGems: number;
  iconName: string;
  description: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  isUnlocked: boolean;
  isEquipped: boolean;
}

export interface FocusSessionResult {
  taskId?: string;
  taskTitle: string;
  durationMinutes: number;
  actualMinutes: number;
  notes: string;
  completed: boolean;
  timeAccuracy: 'faster' | 'accurate' | 'slower';
}

export interface WeeklyInsight {
  totalPlannedHours: number;
  totalCompletedHours: number;
  completionRate: number;
  subjectsBreakdown: { subject: string; minutes: number }[];
  consistencyScore: number;
  frequentlyPostponedCount: number;
  aiSuggestions: string[];
}

export interface SolvedDoubt {
  id: string;
  subject: string;
  topic: string;
  question: string;
  level: string;
  coreConcept: string;
  stepByStepSolution: {
    stepNumber: number;
    title: string;
    explanation: string;
  }[];
  finalAnswer: string;
  commonExamTrap: string;
  quickPracticeQuestion: string;
  createdAt: string;
  isBookmarked?: boolean;
}

