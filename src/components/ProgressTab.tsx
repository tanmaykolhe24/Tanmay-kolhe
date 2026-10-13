import React, { useState } from 'react';
import {
  TrendingUp,
  Award,
  Users,
  CheckCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Flame,
  Zap,
  BarChart2,
  Lock,
} from 'lucide-react';
import { Achievement, FriendChallenge, TaskBlock, UserProfile } from '../types';
import { playSound } from '../utils/gameLogic';

interface ProgressTabProps {
  profile: UserProfile;
  tasks: TaskBlock[];
  achievements: Achievement[];
  challenges: FriendChallenge[];
  onJoinChallenge: (challengeId: string) => void;
}

export const ProgressTab: React.FC<ProgressTabProps> = ({
  profile,
  tasks,
  achievements,
  challenges,
  onJoinChallenge,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'insights' | 'achievements' | 'challenges'>('insights');

  // Calculate statistics
  const totalCompleted = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length || 1;
  const completionRate = Math.round((totalCompleted / totalTasks) * 100);

  const completedHours = (
    tasks.filter((t) => t.completed).reduce((acc, t) => acc + (t.durationMinutes || 45), 0) / 60
  ).toFixed(1);

  const plannedHours = (
    tasks.reduce((acc, t) => acc + (t.durationMinutes || 45), 0) / 60
  ).toFixed(1);

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto px-4 pt-3">
      {/* 1. Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Productivity & Achievements
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Level {profile.level} {profile.rank} · {profile.streak} Day Consistency Record
        </p>
      </div>

      {/* 2. Sub Tabs Segmented Control */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg w-fit">
        {[
          { id: 'insights', label: 'Weekly Report', icon: BarChart2 },
          { id: 'achievements', label: 'Badges & Medals', icon: Award },
          { id: 'challenges', label: 'Friend Challenges', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playSound('click');
                setActiveSubTab(tab.id as any);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Sub-Tab 1: Weekly Report & Productivity Insights */}
      {activeSubTab === 'insights' && (
        <div className="space-y-4">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3">
              <span className="text-[11px] text-slate-400 font-medium block">
                Completion Rate
              </span>
              <span className="text-xl font-bold text-white mt-1 block">
                {completionRate}%
              </span>
              <span className="text-[10px] text-emerald-400 mt-0.5 block">
                {totalCompleted} of {totalTasks} tasks done
              </span>
            </div>

            <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3">
              <span className="text-[11px] text-slate-400 font-medium block">
                Hours Studied
              </span>
              <span className="text-xl font-bold text-indigo-400 mt-1 block">
                {completedHours}h
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                of {plannedHours}h planned
              </span>
            </div>

            <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3">
              <span className="text-[11px] text-slate-400 font-medium block">
                Consistency Score
              </span>
              <span className="text-xl font-bold text-amber-400 mt-1 block">
                92 / 100
              </span>
              <span className="text-[10px] text-amber-300 mt-0.5 block">
                {profile.streak} days active
              </span>
            </div>

            <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3">
              <span className="text-[11px] text-slate-400 font-medium block">
                Total XP Earned
              </span>
              <span className="text-xl font-bold text-cyan-400 mt-1 block">
                {profile.xp} XP
              </span>
              <span className="text-[10px] text-cyan-300 mt-0.5 block">
                {profile.gems} Gems bank
              </span>
            </div>
          </div>

          {/* Subject Distribution */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
            <h2 className="text-xs font-bold text-slate-300 tracking-wider mb-3">
              SUBJECT TIME ALLOCATION THIS WEEK
            </h2>

            <div className="space-y-3">
              {[
                { subject: 'Mathematics (Calculus & Vectors)', hours: 14.5, percent: 38, color: 'from-indigo-500 to-indigo-600' },
                { subject: 'Physics (Electricity & Mechanics)', hours: 12.0, percent: 32, color: 'from-purple-500 to-purple-600' },
                { subject: 'Chemistry (Organic Reactions)', hours: 8.5, percent: 22, color: 'from-cyan-500 to-cyan-600' },
                { subject: 'Mock Tests & Error Analysis', hours: 3.0, percent: 8, color: 'from-emerald-500 to-emerald-600' },
              ].map((item) => (
                <div key={item.subject}>
                  <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                    <span className="font-medium">{item.subject}</span>
                    <span className="font-mono text-slate-400">
                      {item.hours} hrs ({item.percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Productivity Observations & Suggestions */}
          <div className="rounded-2xl bg-slate-900/80 border border-indigo-900/40 p-4 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-indigo-400">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>TIMEGENIUS AI WEEKLY OBSERVATIONS</span>
            </div>

            <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <p>
                • <strong>Peak Alertness Pattern:</strong> Your focus completion is highest between 06:00 AM and 07:30 AM (94% accuracy). Scheduling difficult derivations in the morning continues to pay off.
              </p>
              <p>
                • <strong>Estimation Calibration:</strong> Mathematics problem sprints tend to take 15 minutes longer than initially estimated. We have automatically adjusted future recommendations to add a 15-minute buffer.
              </p>
              <p>
                • <strong>Next Week Suggestion:</strong> Add one dedicated 45-minute "Error Log Clearing" block on Thursday evening before your weekend mock test to review question traps.
              </p>
            </div>
            <p className="text-[11px] text-slate-400 italic mt-3 pt-2 border-t border-slate-800">
              Note: Historical productivity patterns are empirical observations to help you calibrate your plan, not fixed predictions of future performance.
            </p>
          </div>
        </div>
      )}

      {/* 4. Sub-Tab 2: Achievements & Badges */}
      {activeSubTab === 'achievements' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`rounded-2xl border p-4 transition-all flex items-start gap-3.5 ${
                ach.unlocked
                  ? 'bg-slate-900/90 border-slate-700/80'
                  : 'bg-slate-950/40 border-slate-800/40 opacity-70'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  ach.unlocked
                    ? 'bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 text-indigo-400'
                    : 'bg-slate-800/50 border border-slate-700/40 text-slate-500'
                }`}
              >
                {ach.unlocked ? (
                  <Award className="w-6 h-6 text-indigo-400" />
                ) : (
                  <Lock className="w-5 h-5 text-slate-500" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">{ach.title}</h3>
                  <span className="text-[11px] font-bold text-indigo-400 font-mono">
                    +{ach.xpBonus} XP
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{ach.description}</p>

                <div className="mt-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>{ach.unlocked ? 'Unlocked' : 'In Progress'}</span>
                    <span className="font-mono">
                      {ach.progress}/{ach.maxProgress}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        ach.unlocked
                          ? 'bg-emerald-400'
                          : 'bg-indigo-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (ach.progress / ach.maxProgress) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Sub-Tab 3: Friend Challenges */}
      {activeSubTab === 'challenges' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-indigo-950/20 border border-indigo-900/30 p-3.5 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300">
              <h2 className="font-bold text-white">
                Privacy-First Study Challenges
              </h2>
              <p className="mt-0.5 text-slate-400 leading-relaxed">
                Compete on weekly consistency and focus sprints with your peers. Your personal timetable, private error logs, and AI conversations are never visible to others.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {challenges.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white">{c.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{c.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-2 py-0.5 rounded-md">
                      +{c.rewardXp} XP
                    </span>
                    <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      +{c.rewardGems}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>
                      Your progress: <strong className="text-white">{c.progress} / {c.target} {c.unit}</strong>
                    </span>
                    <span>Expires in {c.expiresInDays} days</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                      style={{ width: `${Math.min(100, (c.progress / c.target) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Participants */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Pod Leaderboard:</span>
                    <div className="flex items-center gap-1.5">
                      {c.participants.map((p, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded-md text-[11px] text-slate-300"
                        >
                          <span>{p.avatar}</span>
                          <span>{p.name.split(' ')[0]}</span>
                          <span className="text-indigo-400 font-mono font-bold">({p.progress})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!c.isJoined && (
                    <button
                      onClick={() => {
                        playSound('complete');
                        onJoinChallenge(c.id);
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-sm"
                    >
                      Join Challenge
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
