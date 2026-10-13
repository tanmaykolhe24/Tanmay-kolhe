/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { HomeTab } from './components/HomeTab';
import { TimetableTab } from './components/TimetableTab';
import { MissionsTab } from './components/MissionsTab';
import { ProgressTab } from './components/ProgressTab';
import { ProfileTab } from './components/ProfileTab';
import { SmartFocusModal } from './components/SmartFocusModal';
import { RescueDayModal } from './components/RescueDayModal';
import { AiProblemSolverModal } from './components/AiProblemSolverModal';
import { ScheduleGeneratorModal } from './components/ScheduleGeneratorModal';
import { ExamCommandCenterModal } from './components/ExamCommandCenterModal';
import { AiVoiceAssistantModal } from './components/AiVoiceAssistantModal';
import { WelcomeOnboardingModal } from './components/WelcomeOnboardingModal';
import { AiDoubtSolverModal } from './components/AiDoubtSolverModal';
import { FloatingDoubtButton } from './components/FloatingDoubtButton';

import {
  INITIAL_USER_PROFILE,
  INITIAL_TASKS,
  INITIAL_MISSIONS,
  INITIAL_EXAM_PLAN,
  INITIAL_ACHIEVEMENTS,
  INITIAL_SHOP_ITEMS,
  INITIAL_FRIEND_CHALLENGES,
  INITIAL_SAVED_DOUBTS,
} from './utils/initialData';
import {
  getLevelFromXp,
  getRankFromLevel,
  playSound,
  fireCelebrationConfetti,
} from './utils/gameLogic';
import { TaskBlock, Mission, UserProfile, ShopItem, ExamPlan, Achievement, FriendChallenge, SolvedDoubt } from './types';

export default function App() {
  // 1. Persistent State Initialization with localStorage
  const [profile, setProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('timegenius_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_USER_PROFILE;
  });

  const [tasks, setTasks] = useState<TaskBlock[]>(() => {
    try {
      const saved = localStorage.getItem('timegenius_tasks');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_TASKS;
  });

  const [missions, setMissions] = useState<Mission[]>(() => {
    try {
      const saved = localStorage.getItem('timegenius_missions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_MISSIONS;
  });

  const [examPlan, setExamPlan] = useState<ExamPlan>(() => {
    try {
      const saved = localStorage.getItem('timegenius_exam_plan');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_EXAM_PLAN;
  });

  const [achievements, setAchievements] = useState<Achievement[]>(() => {
    try {
      const saved = localStorage.getItem('timegenius_achievements');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_ACHIEVEMENTS;
  });

  const [shopItems, setShopItems] = useState<ShopItem[]>(() => {
    try {
      const saved = localStorage.getItem('timegenius_shop');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SHOP_ITEMS;
  });

  const [challenges, setChallenges] = useState<FriendChallenge[]>(() => {
    try {
      const saved = localStorage.getItem('timegenius_challenges');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_FRIEND_CHALLENGES;
  });

  const [savedDoubts, setSavedDoubts] = useState<SolvedDoubt[]>(() => {
    try {
      const saved = localStorage.getItem('timegenius_saved_doubts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SAVED_DOUBTS;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    return !localStorage.getItem('timegenius_welcomed');
  });

  // Modals state
  const [focusModalOpen, setFocusModalOpen] = useState(false);
  const [focusTaskTitle, setFocusTaskTitle] = useState('Deep Focus Sprint');
  const [focusDuration, setFocusDuration] = useState(30);

  const [rescueModalOpen, setRescueModalOpen] = useState(false);
  const [problemSolverOpen, setProblemSolverOpen] = useState(false);
  const [scheduleGenOpen, setScheduleGenOpen] = useState(false);
  const [examCenterOpen, setExamCenterOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [doubtModalOpen, setDoubtModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('timegenius_profile', JSON.stringify(profile));
    } catch {}
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem('timegenius_tasks', JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem('timegenius_missions', JSON.stringify(missions));
    } catch {}
  }, [missions]);

  useEffect(() => {
    try {
      localStorage.setItem('timegenius_exam_plan', JSON.stringify(examPlan));
    } catch {}
  }, [examPlan]);

  useEffect(() => {
    try {
      localStorage.setItem('timegenius_achievements', JSON.stringify(achievements));
    } catch {}
  }, [achievements]);

  useEffect(() => {
    try {
      localStorage.setItem('timegenius_shop', JSON.stringify(shopItems));
    } catch {}
  }, [shopItems]);

  useEffect(() => {
    try {
      localStorage.setItem('timegenius_challenges', JSON.stringify(challenges));
    } catch {}
  }, [challenges]);

  useEffect(() => {
    try {
      localStorage.setItem('timegenius_saved_doubts', JSON.stringify(savedDoubts));
    } catch {}
  }, [savedDoubts]);

  // Anti-Duplicate XP and Level Award Engine
  const awardXpAndGems = (xpAmount: number, gemsAmount: number, uniqueEventId?: string) => {
    if (uniqueEventId && profile.completedTaskIds.includes(uniqueEventId)) {
      // Prevent duplicate reward
      return;
    }

    setProfile((prev) => {
      const newXp = prev.xp + xpAmount;
      const newGems = prev.gems + gemsAmount;
      const newLevel = getLevelFromXp(newXp);
      const newRank = getRankFromLevel(newLevel);
      const updatedTaskIds = uniqueEventId
        ? [...prev.completedTaskIds, uniqueEventId]
        : prev.completedTaskIds;

      if (newLevel > prev.level) {
        playSound('level_up');
        fireCelebrationConfetti();
      } else {
        playSound('complete');
      }

      return {
        ...prev,
        xp: newXp,
        gems: newGems,
        level: newLevel,
        rank: newRank,
        completedTaskIds: updatedTaskIds,
      };
    });
  };

  // Toggle mission completion
  const handleToggleMission = (missionId: string) => {
    setMissions((prev) =>
      prev.map((m) => {
        if (m.id === missionId) {
          const willComplete = m.status !== 'completed';
          if (willComplete) {
            awardXpAndGems(m.xpReward, m.gemsReward, `mission_${missionId}`);
            fireCelebrationConfetti();
          }
          return {
            ...m,
            status: willComplete ? 'completed' : 'pending',
            completedAt: willComplete ? new Date().toISOString() : undefined,
          };
        }
        return m;
      })
    );
  };

  // Toggle task completion
  const handleToggleTaskComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const willComplete = !t.completed;
          if (willComplete) {
            const xp = t.priority === 'urgent' ? 40 : t.priority === 'high' ? 25 : 15;
            awardXpAndGems(xp, Math.max(2, Math.floor(xp / 5)), `task_${taskId}`);
          }
          return {
            ...t,
            completed: willComplete,
            completedAt: willComplete ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  // Add custom task
  const handleAddTask = (newTask: Omit<TaskBlock, 'id'>) => {
    const task: TaskBlock = {
      ...newTask,
      id: `task_${Date.now()}`,
    };
    setTasks((prev) => [...prev, task]);
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    playSound('click');
  };

  // Add custom mission
  const handleAddMission = (newMission: Omit<Mission, 'id'>) => {
    const mission: Mission = {
      ...newMission,
      id: `ms_${Date.now()}`,
    };
    setMissions((prev) => [mission, ...prev]);
  };

  // Delete mission
  const handleDeleteMission = (missionId: string) => {
    setMissions((prev) => prev.filter((m) => m.id !== missionId));
    playSound('click');
  };

  // Start Focus Mode
  const handleStartFocus = (title: string, duration?: number) => {
    setFocusTaskTitle(title);
    setFocusDuration(duration || profile.preferredFocusLength || 30);
    setFocusModalOpen(true);
  };

  // Finish Focus Mode
  const handleFinishFocusSession = (result: {
    taskTitle: string;
    completed: boolean;
    accuracy: 'faster' | 'accurate' | 'slower';
    notes: string;
    xpEarned: number;
    gemsEarned: number;
  }) => {
    awardXpAndGems(result.xpEarned, result.gemsEarned);

    // Update achievement progress for focus
    setAchievements((prev) =>
      prev.map((ach) => {
        if (ach.id === 'ach_focus_100') {
          const newProg = Math.min(ach.maxProgress, ach.progress + 30);
          const unlocked = newProg >= ach.maxProgress;
          return { ...ach, progress: newProg, unlocked };
        }
        return ach;
      })
    );
  };

  // Apply Rescheduled Tasks from Rescue My Day
  const handleApplyRescheduledTasks = (rescheduled: TaskBlock[], explanation: string) => {
    setTasks((prev) => {
      // Keep fixed commitments (like school, tuition, meals), replace unfinished flexible tasks with rescued ones
      const fixedTasks = prev.filter((t) => t.isFixed || t.completed);
      return [...fixedTasks, ...rescheduled];
    });

    // Award comeback champion progress
    setAchievements((prev) =>
      prev.map((ach) => {
        if (ach.id === 'ach_comeback') {
          return { ...ach, progress: 1, unlocked: true, unlockedAt: 'Just now' };
        }
        return ach;
      })
    );
  };

  // Toggle Exam Chapter
  const handleToggleChapter = (chapterId: string) => {
    setExamPlan((prev) => ({
      ...prev,
      chapters: prev.chapters.map((ch) => {
        if (ch.id === chapterId) {
          const willComplete = !ch.isCompleted;
          if (willComplete) {
            awardXpAndGems(50, 10, `chapter_${chapterId}`);
            fireCelebrationConfetti();
          }
          return { ...ch, isCompleted: willComplete };
        }
        return ch;
      }),
    }));
  };

  // Toggle Boss Battle Stage
  const handleToggleBossStage = (bossId: string, stageNumber: number) => {
    setExamPlan((prev) => ({
      ...prev,
      bossBattles: prev.bossBattles.map((boss) => {
        if (boss.id === bossId) {
          const updatedStages = boss.stages.map((stage) => {
            if (stage.stageNumber === stageNumber) {
              const willComplete = !stage.isComplete;
              if (willComplete) {
                awardXpAndGems(stage.xpReward, 10, `boss_${bossId}_stage_${stageNumber}`);
                fireCelebrationConfetti();
                playSound('stage_clear');
              }
              return { ...stage, isComplete: willComplete };
            }
            return stage;
          });

          // Calculate new Boss HP
          const completedCount = updatedStages.filter((s) => s.isComplete).length;
          const hpDeduction = completedCount * (boss.bossHp / updatedStages.length);
          const currentHp = Math.max(0, Math.round(boss.bossHp - hpDeduction));

          return {
            ...boss,
            stages: updatedStages,
            currentHp,
          };
        }
        return boss;
      }),
    }));
  };

  // Buy or Equip Shop Item
  const handleBuyOrEquipItem = (itemId: string) => {
    const item = shopItems.find((i) => i.id === itemId);
    if (!item) return;

    if (!item.isUnlocked) {
      if (profile.gems < item.costGems) return;

      // Buy item
      setProfile((prev) => ({ ...prev, gems: prev.gems - item.costGems }));
      setShopItems((prev) =>
        prev.map((i) => (i.id === itemId ? { ...i, isUnlocked: true, isEquipped: true } : i))
      );
      playSound('stage_clear');
      fireCelebrationConfetti();
    } else {
      // Toggle Equip
      setShopItems((prev) =>
        prev.map((i) => {
          if (i.id === itemId) return { ...i, isEquipped: !i.isEquipped };
          if (i.category === item.category && !i.isEquipped) return i;
          if (i.category === item.category) return { ...i, isEquipped: false };
          return i;
        })
      );
      playSound('complete');
    }
  };

  // Join friend challenge
  const handleJoinChallenge = (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((c) => (c.id === challengeId ? { ...c, isJoined: true } : c))
    );
  };

  // Save Doubt to Notebook
  const handleSaveDoubt = (doubt: SolvedDoubt) => {
    setSavedDoubts((prev) => [doubt, ...prev.filter((d) => d.id !== doubt.id)]);
  };

  // Convert Doubt into Daily Mission with XP
  const handleConvertDoubtToMission = (title: string, subject: string) => {
    const newMission: Mission = {
      id: `ms_doubt_${Date.now()}`,
      title,
      subject,
      durationMinutes: 30,
      priority: 'high',
      scheduledTime: '19:00',
      xpReward: 35,
      gemsReward: 7,
      status: 'pending',
      notes: 'Master concept derived from Doubt Solver',
    };
    setMissions((prev) => [newMission, ...prev]);
    awardXpAndGems(25, 5, `doubt_mission_bonus_${Date.now()}`);
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <Header
        profile={profile}
        onToggleSound={() =>
          setProfile((p) => ({ ...p, soundEnabled: !p.soundEnabled }))
        }
        onOpenExamCenter={() => setExamCenterOpen(true)}
        onOpenAssistant={() => setAssistantOpen(true)}
        onOpenDoubtSolver={() => setDoubtModalOpen(true)}
      />

      {/* Main Tab Screen View */}
      <main className="max-w-6xl mx-auto pt-2">
        {activeTab === 'home' && (
          <HomeTab
            profile={profile}
            tasks={tasks}
            missions={missions}
            bossBattles={examPlan.bossBattles}
            onOpenRescueModal={() => setRescueModalOpen(true)}
            onOpenProblemSolver={() => setProblemSolverOpen(true)}
            onOpenDoubtSolver={() => setDoubtModalOpen(true)}
            onStartFocus={handleStartFocus}
            onToggleMission={handleToggleMission}
            onNavigateToTab={setActiveTab}
            onOpenExamCenter={() => setExamCenterOpen(true)}
          />
        )}

        {activeTab === 'timetable' && (
          <TimetableTab
            tasks={tasks}
            onToggleTaskComplete={handleToggleTaskComplete}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onStartFocus={handleStartFocus}
            onOpenScheduleGenerator={() => setScheduleGenOpen(true)}
          />
        )}

        {activeTab === 'missions' && (
          <MissionsTab
            missions={missions}
            onToggleMission={handleToggleMission}
            onAddMission={handleAddMission}
            onDeleteMission={handleDeleteMission}
            onStartFocus={handleStartFocus}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressTab
            profile={profile}
            tasks={tasks}
            achievements={achievements}
            challenges={challenges}
            onJoinChallenge={handleJoinChallenge}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            profile={profile}
            shopItems={shopItems}
            onUpdateProfile={(updated) => setProfile((p) => ({ ...p, ...updated }))}
            onBuyOrEquipItem={handleBuyOrEquipItem}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenAssistant={() => setAssistantOpen(true)}
      />

      {/* Modals & Workspaces */}
      <SmartFocusModal
        isOpen={focusModalOpen}
        onClose={() => setFocusModalOpen(false)}
        taskTitle={focusTaskTitle}
        initialMinutes={focusDuration}
        onFinishSession={handleFinishFocusSession}
      />

      <RescueDayModal
        isOpen={rescueModalOpen}
        onClose={() => setRescueModalOpen(false)}
        tasks={tasks}
        profile={profile}
        onApplyRescheduledTasks={handleApplyRescheduledTasks}
      />

      <AiProblemSolverModal
        isOpen={problemSolverOpen}
        onClose={() => setProblemSolverOpen(false)}
        profile={profile}
        onApplyPlan={(newTasks) => {
          setTasks(newTasks);
          setActiveTab('timetable');
        }}
      />

      <ScheduleGeneratorModal
        isOpen={scheduleGenOpen}
        onClose={() => setScheduleGenOpen(false)}
        profile={profile}
        onApplySchedule={(newTasks) => {
          setTasks(newTasks);
          setActiveTab('timetable');
        }}
      />

      <ExamCommandCenterModal
        isOpen={examCenterOpen}
        onClose={() => setExamCenterOpen(false)}
        examPlan={examPlan}
        onToggleChapter={handleToggleChapter}
        onToggleBossStage={handleToggleBossStage}
      />

      <AiVoiceAssistantModal
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        profile={profile}
        tasks={tasks}
        onAddTask={handleAddTask}
        onOpenRescueModal={() => setRescueModalOpen(true)}
        onStartFocus={handleStartFocus}
      />

      <WelcomeOnboardingModal
        isOpen={showWelcome}
        onComplete={(newProfile) => {
          setProfile((p) => ({ ...p, ...newProfile }));
          localStorage.setItem('timegenius_welcomed', 'true');
          setShowWelcome(false);
        }}
      />

      {/* Floating Action Button for All-Subject Doubt Solver */}
      <FloatingDoubtButton
        onOpen={() => setDoubtModalOpen(true)}
        doubtsCount={savedDoubts.length}
      />

      {/* All-Subject AI Doubt Solver Modal */}
      <AiDoubtSolverModal
        isOpen={doubtModalOpen}
        onClose={() => setDoubtModalOpen(false)}
        profile={profile}
        savedDoubts={savedDoubts}
        onSaveDoubt={handleSaveDoubt}
        onStartFocus={handleStartFocus}
        onConvertDoubtToMission={handleConvertDoubtToMission}
      />
    </div>
  );
}
