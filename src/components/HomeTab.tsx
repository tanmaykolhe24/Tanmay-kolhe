import React from 'react';
import {
  LifeBuoy,
  Sparkles,
  Play,
  CheckCircle2,
  Circle,
  Swords,
  ChevronRight,
  Flame,
  Clock,
  Compass,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { BossBattle, Mission, TaskBlock, UserProfile } from '../types';
import { getLevelProgress, playSound } from '../utils/gameLogic';

interface HomeTabProps {
  profile: UserProfile;
  tasks: TaskBlock[];
  missions: Mission[];
  bossBattles: BossBattle[];
  onOpenRescueModal: () => void;
  onOpenProblemSolver: () => void;
  onStartFocus: (taskTitle: string, duration?: number) => void;
  onToggleMission: (missionId: string) => void;
  onNavigateToTab: (tab: any) => void;
  onOpenExamCenter: () => void;
  onOpenDoubtSolver?: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  profile,
  tasks,
  missions,
  bossBattles,
  onOpenRescueModal,
  onOpenProblemSolver,
  onStartFocus,
  onToggleMission,
  onNavigateToTab,
  onOpenExamCenter,
  onOpenDoubtSolver,
}) => {
  const levelInfo = getLevelProgress(profile.xp);

  // Find next upcoming pending task
  const pendingTasks = tasks.filter((t) => !t.completed && t.category !== 'break');
  const nextTask = pendingTasks[0] || tasks[0];

  const activeBoss = bossBattles[0];
  const completedMissionsCount = missions.filter((m) => m.status === 'completed').length;

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto px-4 pt-3">
      {/* 1. Hero Player Profile & Rank Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#10172A] to-[#151C33] border border-slate-800 p-4 sm:p-5 shadow-xl">
        {/* Subtle background ambient glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Avatar icon frame */}
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[2px] shadow-lg shadow-indigo-500/25">
                <div className="w-full h-full bg-[#0F172A] rounded-[14px] flex items-center justify-center text-2xl select-none">
                  {profile.avatar.style === 'quantum_prodigy' ? '🧬' : profile.avatar.style === 'astro_genius' ? '🚀' : '🧑‍💻'}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-[10px] font-extrabold text-white px-1.5 py-0.5 rounded-full border border-slate-900">
                Lv.{levelInfo.currentLevel}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight">
                  {profile.name}
                </h1>
                <span className="text-xs font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-md">
                  {levelInfo.rank}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {profile.targetExam} · {profile.grade}
              </p>
              <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                <span className="flex items-center gap-1 text-amber-300 font-medium">
                  <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {profile.streak} Day Streak
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1 text-cyan-300 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  {profile.gems} Gems
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="w-full sm:w-auto flex flex-wrap items-center gap-2">
            {onOpenDoubtSolver && (
              <button
                onClick={() => {
                  playSound('click');
                  onOpenDoubtSolver();
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-purple-600/25 hover:bg-purple-600/35 text-purple-200 border border-purple-500/50 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
              >
                <HelpCircle className="w-4 h-4 text-purple-300" />
                <span>AI Doubt Solver</span>
              </button>
            )}

            <button
              onClick={() => {
                playSound('click');
                onOpenProblemSolver();
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>AI Problem Solver</span>
            </button>
          </div>
        </div>

        {/* Level XP Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-medium text-slate-300">
              Rank Progression: <span className="text-white font-semibold">{levelInfo.rank}</span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              {levelInfo.xpEarnedInLevel} / {levelInfo.xpNeeded} XP ({levelInfo.percent}%)
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800/90 rounded-full overflow-hidden p-[1px]">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${levelInfo.percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. SMART RESCUE BANNER (One-Tap Day Recovery) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950/40 via-purple-950/30 to-indigo-950/40 border border-rose-500/30 p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <LifeBuoy className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">
                Missed a task or schedule disrupted?
              </h2>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                1-TAP
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              Don't stress or cram. TIMEGENIUS will salvage your remaining hours without sleep deprivation.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            playSound('rescue');
            onOpenRescueModal();
          }}
          className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-rose-600/25 transition-all cursor-pointer"
        >
          <LifeBuoy className="w-4 h-4" />
          <span>Rescue My Day</span>
        </button>
      </div>

      {/* 3. Next Up on Timetable */}
      {nextTask && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
              <Clock className="w-4 h-4" />
              <span>CURRENT / NEXT UP ON TIMETABLE</span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {nextTask.startTime} – {nextTask.endTime}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-1">
            <div>
              <h3 className="text-base font-bold text-white">
                {nextTask.subject}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {nextTask.description}
              </p>
              {nextTask.aiRationale && (
                <p className="text-[11px] text-indigo-300/80 italic mt-1">
                  💡 {nextTask.aiRationale}
                </p>
              )}
            </div>

            <button
              onClick={() => {
                playSound('click');
                onStartFocus(nextTask.subject, nextTask.durationMinutes || 30);
              }}
              className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start in Focus Mode</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Daily Missions Snapshot */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white">
              Today's Missions
            </h2>
            <span className="text-xs text-slate-400">
              ({completedMissionsCount}/{missions.length} complete)
            </span>
          </div>
          <button
            onClick={() => {
              playSound('click');
              onNavigateToTab('missions');
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2">
          {missions.slice(0, 3).map((mission) => {
            const isCompleted = mission.status === 'completed';
            return (
              <div
                key={mission.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isCompleted
                    ? 'bg-slate-950/40 border-slate-800/40 text-slate-500'
                    : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onToggleMission(mission.id)}
                    className="cursor-pointer focus:outline-none"
                    aria-label={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                    )}
                  </button>
                  <div>
                    <h3
                      className={`text-xs font-semibold ${
                        isCompleted ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      {mission.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{mission.subject}</span>
                      <span aria-hidden="true">·</span>
                      <span>{mission.durationMinutes} mins</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded-md">
                    +{mission.xpReward} XP
                  </span>
                  {!isCompleted && (
                    <button
                      onClick={() => onStartFocus(mission.title, mission.durationMinutes)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 cursor-pointer"
                      title="Focus on this mission"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Active Boss Battle Arena Teaser */}
      {activeBoss && (
        <div className="rounded-2xl bg-gradient-to-br from-purple-950/30 via-slate-900 to-indigo-950/30 border border-purple-800/40 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-400">
              <Swords className="w-4 h-4" />
              <span>CHAPTER BOSS BATTLE</span>
            </div>
            <span className="text-xs text-purple-300 font-mono">
              HP: {activeBoss.currentHp}/{activeBoss.bossHp}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">
                {activeBoss.title}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeBoss.stages.filter((s) => s.isComplete).length} of {activeBoss.stages.length} stages conquered.
              </p>
              {/* HP Bar */}
              <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${(activeBoss.currentHp / activeBoss.bossHp) * 100}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => {
                playSound('click');
                onOpenExamCenter();
              }}
              className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-md shadow-purple-600/30"
            >
              <span>Enter Arena</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Developer Credit Footer */}
      <div className="pt-2 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-1">
        <p className="font-medium text-slate-400">
          Developed by <span className="text-slate-300 font-semibold">Tanmay Mangesh Kolhe</span> · Maharashtra, India
        </p>
        <p className="text-[11px] text-slate-400">
          Proudly Made in India 🇮🇳 · TIMEGENIUS AI
        </p>
      </div>
    </div>
  );
};
