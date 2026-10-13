import { Achievement, BossBattle, ExamPlan, FriendChallenge, Mission, ShopItem, TaskBlock, UserProfile, SolvedDoubt } from '../types';

export const INITIAL_USER_PROFILE: UserProfile = {
  id: 'student_1',
  name: 'Aarav Sharma',
  grade: '12th Standard (PCM)',
  targetExam: 'JEE Main & CBSE Board Exam',
  wakeTime: '06:00',
  bedTime: '23:00',
  preferredFocusLength: 30,
  xp: 380,
  level: 4,
  rank: 'Rookie',
  gems: 95,
  streak: 5,
  longestStreak: 8,
  lastActiveDate: new Date().toISOString().split('T')[0],
  avatar: {
    style: 'cyber_scholar',
    hairstyle: 'neon_fade',
    outfit: 'stealth_hoodie',
    accessory: 'hud_glasses',
    frame: 'electric_blue',
    background: 'neon_academy',
    unlockedItems: ['cyber_scholar', 'neon_fade', 'stealth_hoodie', 'hud_glasses', 'electric_blue', 'neon_academy'],
  },
  completedTaskIds: ['m_done_0'],
  theme: 'dark',
  soundEnabled: true,
};

export const INITIAL_TASKS: TaskBlock[] = [
  {
    id: 'tb_1',
    day: 'Today',
    startTime: '06:15',
    endTime: '07:30',
    subject: 'Physics: Current Electricity',
    description: 'Derive Kirchhoff laws and solve 8 previous-year questions.',
    priority: 'urgent',
    category: 'study',
    isFixed: false,
    completed: true,
    completedAt: '07:30',
    aiRationale: 'Scheduled right after morning hydration when analytical reasoning is at its peak.',
    durationMinutes: 75,
  },
  {
    id: 'tb_2',
    day: 'Today',
    startTime: '08:00',
    endTime: '14:30',
    subject: 'School Classes & Practicals',
    description: 'School curriculum, laboratory practicals, and syllabus coverage.',
    priority: 'fixed',
    category: 'school',
    isFixed: true,
    completed: true,
    completedAt: '14:30',
    aiRationale: 'Fixed institutional requirement.',
    durationMinutes: 390,
  },
  {
    id: 'tb_3',
    day: 'Today',
    startTime: '15:00',
    endTime: '15:45',
    subject: 'Recharge & Healthy Meal',
    description: 'Post-school lunch, light stretch, and screen-free rest.',
    priority: 'fixed',
    category: 'break',
    isFixed: true,
    completed: true,
    completedAt: '15:45',
    aiRationale: 'Mandatory neurological reset to prevent afternoon cognitive crash.',
    durationMinutes: 45,
  },
  {
    id: 'tb_4',
    day: 'Today',
    startTime: '16:00',
    endTime: '17:30',
    subject: 'Tuition / Coaching Lecture',
    description: 'Mathematics: Definite Integration techniques and standard integrals.',
    priority: 'fixed',
    category: 'school',
    isFixed: true,
    completed: false,
    aiRationale: 'Fixed evening coaching commitment.',
    durationMinutes: 90,
  },
  {
    id: 'tb_5',
    day: 'Today',
    startTime: '18:00',
    endTime: '19:15',
    subject: 'Mathematics: Problem Solving Sprint',
    description: 'Solve 12 integration questions from DPP (Daily Practice Problem).',
    priority: 'high',
    category: 'practice',
    isFixed: false,
    completed: false,
    aiRationale: 'Active problem solving immediately reinforces coaching concepts into long-term memory.',
    durationMinutes: 75,
  },
  {
    id: 'tb_6',
    day: 'Today',
    startTime: '20:15',
    endTime: '21:30',
    subject: 'Chemistry: Organic Reactions',
    description: 'Aldehydes, Ketones, and Carboxylic Acids name reactions flash recall.',
    priority: 'high',
    category: 'revision',
    isFixed: false,
    completed: false,
    aiRationale: 'High-yield memory retention right before winding down for the night.',
    durationMinutes: 75,
  },
  {
    id: 'tb_7',
    day: 'Today',
    startTime: '21:45',
    endTime: '22:30',
    subject: 'Error Notebook & Day Review',
    description: 'Log mistakes in error diary, plan top 3 missions for tomorrow.',
    priority: 'medium',
    category: 'study',
    isFixed: false,
    completed: false,
    aiRationale: 'Metacognitive reflection cements confidence and removes morning decision fatigue.',
    durationMinutes: 45,
  },
];

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'ms_1',
    title: 'Revise Current Electricity Formulae',
    subject: 'Physics',
    durationMinutes: 30,
    priority: 'urgent',
    scheduledTime: '06:30',
    xpReward: 25,
    gemsReward: 5,
    status: 'completed',
    notes: 'Covered drift velocity, Ohm law microscopic form, and potentiometer theory.',
    completedAt: '07:20',
  },
  {
    id: 'ms_2',
    title: 'Solve 10 Integration DPP Problems',
    subject: 'Mathematics',
    durationMinutes: 45,
    priority: 'high',
    scheduledTime: '18:15',
    xpReward: 40,
    gemsReward: 8,
    status: 'pending',
    notes: 'Focus on substitution and bypass silly arithmetic slips.',
  },
  {
    id: 'ms_3',
    title: 'Review Organic Name Reactions',
    subject: 'Chemistry',
    durationMinutes: 25,
    priority: 'high',
    scheduledTime: '20:30',
    xpReward: 25,
    gemsReward: 5,
    status: 'pending',
    notes: 'Cannizzaro, Aldol, and Clemmensen reduction.',
  },
  {
    id: 'ms_4',
    title: 'Update Error Diary with 3 Missteps',
    subject: 'General Strategy',
    durationMinutes: 15,
    priority: 'medium',
    scheduledTime: '21:50',
    xpReward: 15,
    gemsReward: 3,
    status: 'pending',
    notes: 'Reflect on time spent per numerical.',
  },
];

export const INITIAL_BOSS_BATTLES: BossBattle[] = [
  {
    id: 'boss_integration',
    title: 'Integration Titan: Calculus Boss Battle',
    subject: 'Mathematics',
    bossHp: 500,
    currentHp: 380,
    stages: [
      { stageNumber: 1, title: 'Fundamental Integration Formulas & Substitution', xpReward: 30, isComplete: true },
      { stageNumber: 2, title: 'Definite Integral King Property [f(a+b-x)]', xpReward: 40, isComplete: true },
      { stageNumber: 3, title: 'Integration by Parts & Special Algebraic Forms', xpReward: 50, isComplete: false },
      { stageNumber: 4, title: 'Leibnitz Rule & Modulus / Periodic Integrals', xpReward: 60, isComplete: false },
      { stageNumber: 5, title: 'Final Boss Arena: 5 JEE Advanced Past Questions in 25m', xpReward: 100, isComplete: false },
    ],
  },
  {
    id: 'boss_rotational',
    title: 'Rotational Motion: Torque & Angular Momentum',
    subject: 'Physics',
    bossHp: 500,
    currentHp: 470,
    stages: [
      { stageNumber: 1, title: 'Moment of Inertia of Symmetrical & Cut Bodies', xpReward: 30, isComplete: true },
      { stageNumber: 2, title: 'Torque Equilibrium & Instantaneous Center of Rotation', xpReward: 40, isComplete: false },
      { stageNumber: 3, title: 'Angular Momentum Conservation in Collisions', xpReward: 50, isComplete: false },
      { stageNumber: 4, title: 'Rolling Without Slipping on Rough Inclined Plane', xpReward: 60, isComplete: false },
      { stageNumber: 5, title: 'Final Boss Showdown: 6 Toughest Numericals in 30m', xpReward: 100, isComplete: false },
    ],
  },
];

export const INITIAL_EXAM_PLAN: ExamPlan = {
  id: 'exam_jee_2027',
  examName: 'JEE Main & 12th Board Examinations',
  examDate: '2027-01-24',
  daysRemaining: 103,
  subjects: ['Physics', 'Mathematics', 'Chemistry'],
  chapters: [
    { id: 'ch_1', subject: 'Physics', chapterName: 'Current Electricity', confidence: 'high', isCompleted: true },
    { id: 'ch_2', subject: 'Physics', chapterName: 'Rotational Dynamics', confidence: 'low', isCompleted: false },
    { id: 'ch_3', subject: 'Physics', chapterName: 'Ray Optics', confidence: 'medium', isCompleted: false },
    { id: 'ch_4', subject: 'Mathematics', chapterName: 'Definite Integration', confidence: 'medium', isCompleted: false },
    { id: 'ch_5', subject: 'Mathematics', chapterName: 'Matrices & Determinants', confidence: 'high', isCompleted: true },
    { id: 'ch_6', subject: 'Mathematics', chapterName: 'Vector & 3D Geometry', confidence: 'low', isCompleted: false },
    { id: 'ch_7', subject: 'Chemistry', chapterName: 'Aldehydes, Ketones & Acids', confidence: 'medium', isCompleted: false },
    { id: 'ch_8', subject: 'Chemistry', chapterName: 'Coordination Compounds', confidence: 'high', isCompleted: true },
    { id: 'ch_9', subject: 'Chemistry', chapterName: 'Electrochemistry', confidence: 'low', isCompleted: false },
  ],
  feasibilityAssessment: 'Balanced workload: 9 core high-weightage chapters mapped across 103 days. Daily requirement: ~3.5 hours focused study + weekend mock review.',
  dailyTargetChapters: 'Complete 1 high-yield chapter revision every 3 days + 25 questions daily.',
  recommendedPrioritiesToday: [
    'Conquer Definite Integration Stage 3 Boss Battle',
    'Revise Kirchhoff Loop Rules for Current Electricity test',
    'Write 5 Aldol Condensation mechanism steps on paper',
  ],
  mockTestMilestones: [
    { title: 'Full Part Syllabus Mock Test 1', scheduledDate: 'This Sunday (09:00 AM)', focus: 'Time per question & Negative Marks elimination', isDone: false },
    { title: 'Physics Speed & Accuracy Drill', scheduledDate: 'Next Wednesday', focus: 'Mechanics & Electrodynamics', isDone: false },
    { title: 'Full 3-Hour Simulation Exam', scheduledDate: 'In 3 Weeks', focus: 'Real Exam Temperament', isDone: false },
  ],
  bossBattles: INITIAL_BOSS_BATTLES,
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_mission',
    title: 'First Blood',
    description: 'Complete your first study mission.',
    iconName: 'Zap',
    category: 'missions',
    unlocked: true,
    unlockedAt: '2 days ago',
    progress: 1,
    maxProgress: 1,
    xpBonus: 50,
  },
  {
    id: 'ach_streak_3',
    title: 'Consistency Cadet',
    description: 'Maintain a 3-day productive streak.',
    iconName: 'Flame',
    category: 'streak',
    unlocked: true,
    unlockedAt: 'Yesterday',
    progress: 5,
    maxProgress: 3,
    xpBonus: 75,
  },
  {
    id: 'ach_chapter_master',
    title: 'Chapter Conqueror',
    description: 'Master 3 full chapters with high confidence.',
    iconName: 'BookOpen',
    category: 'exams',
    unlocked: true,
    unlockedAt: 'Today',
    progress: 3,
    maxProgress: 3,
    xpBonus: 100,
  },
  {
    id: 'ach_boss_slayer',
    title: 'Boss Destroyer',
    description: 'Clear all 5 stages of any Chapter Boss Battle.',
    iconName: 'Swords',
    category: 'missions',
    unlocked: false,
    progress: 2,
    maxProgress: 5,
    xpBonus: 150,
  },
  {
    id: 'ach_focus_100',
    title: 'Flow Master',
    description: 'Accumulate 100 minutes of Smart Focus Mode.',
    iconName: 'Clock',
    category: 'focus',
    unlocked: false,
    progress: 60,
    maxProgress: 100,
    xpBonus: 100,
  },
  {
    id: 'ach_comeback',
    title: 'Comeback Champion',
    description: 'Successfully use Rescue My Day to salvage a disrupted schedule.',
    iconName: 'ShieldAlert',
    category: 'streak',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    xpBonus: 80,
  },
];

export const INITIAL_SHOP_ITEMS: ShopItem[] = [
  {
    id: 'outfit_neon_coat',
    name: 'Cyber Trenchcoat',
    category: 'outfit',
    costGems: 60,
    iconName: 'Shirt',
    description: 'High-tech illuminated overcoat for late-night study sessions.',
    rarity: 'Rare',
    isUnlocked: true,
    isEquipped: true,
  },
  {
    id: 'outfit_scholar_robe',
    name: 'Quantum Scholar Robe',
    category: 'outfit',
    costGems: 120,
    iconName: 'Sparkles',
    description: 'Woven with digital fiber optics. Unlocks at Strategist rank.',
    rarity: 'Epic',
    isUnlocked: false,
    isEquipped: false,
  },
  {
    id: 'hair_hologram_spike',
    name: 'Prism Neon Spikes',
    category: 'hairstyle',
    costGems: 50,
    iconName: 'Flame',
    description: 'Dynamic gradient hairstyle radiating intellectual energy.',
    rarity: 'Rare',
    isUnlocked: true,
    isEquipped: true,
  },
  {
    id: 'accessory_hud_visor',
    name: 'Quantum HUD Visor',
    category: 'accessory',
    costGems: 80,
    iconName: 'Glasses',
    description: 'Projects formula cheatsheets directly onto your peripheral vision.',
    rarity: 'Rare',
    isUnlocked: true,
    isEquipped: true,
  },
  {
    id: 'frame_plasma_ring',
    name: 'Plasma Halo Frame',
    category: 'frame',
    costGems: 150,
    iconName: 'Shield',
    description: 'Crackling blue plasma aura surrounding your profile avatar.',
    rarity: 'Legendary',
    isUnlocked: false,
    isEquipped: false,
  },
  {
    id: 'world_cyber_city',
    name: 'Cyber City World',
    category: 'world_theme',
    costGems: 180,
    iconName: 'Building',
    description: 'Futuristic metropolis theme with rain-slicked neon streets.',
    rarity: 'Epic',
    isUnlocked: false,
    isEquipped: false,
  },
  {
    id: 'world_cosmic_library',
    name: 'Cosmic Library World',
    category: 'world_theme',
    costGems: 250,
    iconName: 'Orbit',
    description: 'An ancient galaxy-spanning archive floating in deep space.',
    rarity: 'Legendary',
    isUnlocked: false,
    isEquipped: false,
  },
];

export const INITIAL_FRIEND_CHALLENGES: FriendChallenge[] = [
  {
    id: 'fc_1',
    title: 'The 5-Sprint Focus Odyssey',
    description: 'Complete five 30+ minute deep focus sessions this week without phone distractions.',
    rewardXp: 120,
    rewardGems: 25,
    progress: 3,
    target: 5,
    unit: 'sessions',
    expiresInDays: 3,
    isJoined: true,
    participants: [
      { name: 'Aarav (You)', avatar: '🧑‍💻', progress: 3 },
      { name: 'Rohan P.', avatar: '⚡', progress: 4 },
      { name: 'Ananya S.', avatar: '🎯', progress: 5 },
      { name: 'Dev K.', avatar: '🚀', progress: 2 },
    ],
  },
  {
    id: 'fc_2',
    title: 'Chapter Boss Decimator',
    description: 'Clear at least 3 stages in any Chapter Boss Battle before Sunday midnight.',
    rewardXp: 150,
    rewardGems: 30,
    progress: 2,
    target: 3,
    unit: 'stages',
    expiresInDays: 5,
    isJoined: true,
    participants: [
      { name: 'Aarav (You)', avatar: '🧑‍💻', progress: 2 },
      { name: 'Priya M.', avatar: '⭐', progress: 3 },
      { name: 'Siddharth T.', avatar: '🔥', progress: 1 },
    ],
  },
  {
    id: 'fc_3',
    title: 'Formula Mastery Marathon',
    description: 'Log 4 consecutive daily Error Notebook reviews without breaking the chain.',
    rewardXp: 100,
    rewardGems: 20,
    progress: 2,
    target: 4,
    unit: 'days',
    expiresInDays: 4,
    isJoined: false,
    participants: [
      { name: 'Neha V.', avatar: '📚', progress: 3 },
      { name: 'Kunal G.', avatar: '💡', progress: 2 },
    ],
  },
];

// Helper to detect conflicting task time intervals
export function detectScheduleConflicts(tasks: TaskBlock[]): { task1: TaskBlock; task2: TaskBlock }[] {
  const conflicts: { task1: TaskBlock; task2: TaskBlock }[] = [];

  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  for (let i = 0; i < tasks.length; i++) {
    for (let j = i + 1; j < tasks.length; j++) {
      const t1 = tasks[i];
      const t2 = tasks[j];

      // Ignore breaks or empty days
      if (t1.category === 'break' && t2.category === 'break') continue;

      const t1Start = timeToMinutes(t1.startTime);
      const t1End = timeToMinutes(t1.endTime);
      const t2Start = timeToMinutes(t2.startTime);
      const t2End = timeToMinutes(t2.endTime);

      if (Math.max(t1Start, t2Start) < Math.min(t1End, t2End)) {
        conflicts.push({ task1: t1, task2: t2 });
      }
    }
  }

  return conflicts;
}

export const INITIAL_SAVED_DOUBTS: SolvedDoubt[] = [
  {
    id: 'doubt_init_1',
    subject: 'Physics',
    topic: 'Rotational Dynamics (Torque & Axis of Rotation)',
    question: 'Why does torque depend on the chosen origin or axis of rotation?',
    level: 'JEE Main & Boards',
    coreConcept: 'Torque τ = r × F depends on the position vector r from the chosen reference point to the point of force application.',
    stepByStepSolution: [
      {
        stepNumber: 1,
        title: 'Define Lever Arm Vector r',
        explanation: 'Changing the origin shifts the position vector r to (r - r_0), altering the net vector cross product magnitude and direction.'
      },
      {
        stepNumber: 2,
        title: 'Couples Exception (Equal & Opposite Forces)',
        explanation: 'Only for a pure couple (net force F_net = 0) is torque invariant and completely independent of the reference origin.'
      }
    ],
    finalAnswer: 'Torque is only unique and origin-independent when ΣF_net = 0 (Pure couple). In all other cases, you must specify the reference origin.',
    commonExamTrap: 'Exam Pitfall: Calculating torque equilibrium without stating the chosen pivot point causes immediate mark deduction.',
    quickPracticeQuestion: 'What is the torque of a couple consisting of forces +F and -F separated by perpendicular distance d?',
    createdAt: 'Yesterday',
    isBookmarked: true,
  },
  {
    id: 'doubt_init_2',
    subject: 'Mathematics',
    topic: 'Definite Integration (King’s Property)',
    question: 'Explain King’s property in definite integrals with a step-by-step proof.',
    level: 'JEE Main & Boards',
    coreConcept: 'King’s Property states that ∫[a to b] f(x) dx = ∫[a to b] f(a + b - x) dx. It reflects the function about the midpoint of the interval [a, b].',
    stepByStepSolution: [
      {
        stepNumber: 1,
        title: 'Apply Substitution Variable',
        explanation: 'Let t = a + b - x. Then dx = -dt. When x = a, t = b; when x = b, t = a.'
      },
      {
        stepNumber: 2,
        title: 'Invert Limits with Negative Sign',
        explanation: '∫[b to a] f(a + b - t) (-dt) = ∫[a to b] f(a + b - t) dt = ∫[a to b] f(a + b - x) dx.'
      }
    ],
    finalAnswer: 'Proved: ∫[a to b] f(x) dx = ∫[a to b] f(a + b - x) dx.',
    commonExamTrap: 'Exam Pitfall: When adding the two integrals, forgetting that the LHS becomes 2I rather than I.',
    quickPracticeQuestion: 'What is ∫[0 to π/2] ln(tan x) dx using King\'s Property?',
    createdAt: '2 days ago',
    isBookmarked: true,
  }
];
