import React, { useState } from 'react';
import {
  Target,
  Plus,
  Play,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Trash2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Mission, TaskPriority } from '../types';
import { playSound } from '../utils/gameLogic';

interface MissionsTabProps {
  missions: Mission[];
  onToggleMission: (missionId: string) => void;
  onAddMission: (mission: Omit<Mission, 'id'>) => void;
  onDeleteMission: (missionId: string) => void;
  onStartFocus: (title: string, duration?: number) => void;
}

export const MissionsTab: React.FC<MissionsTabProps> = ({
  missions,
  onToggleMission,
  onAddMission,
  onDeleteMission,
  onStartFocus,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isAdding, setIsAdding] = useState(false);

  // New Mission form state
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [duration, setDuration] = useState(30);
  const [priority, setPriority] = useState<TaskPriority>('high');
  const [scheduledTime, setScheduledTime] = useState('18:00');
  const [notes, setNotes] = useState('');

  const completedCount = missions.filter((m) => m.status === 'completed').length;
  const totalXp = missions
    .filter((m) => m.status === 'completed')
    .reduce((acc, m) => acc + m.xpReward, 0);

  const filteredMissions = missions.filter((m) => {
    if (filter === 'pending') return m.status !== 'completed';
    if (filter === 'completed') return m.status === 'completed';
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const xp = duration >= 45 ? 40 : duration >= 25 ? 25 : 15;
    const gems = Math.max(2, Math.floor(xp / 5));

    onAddMission({
      title: title.trim(),
      subject,
      durationMinutes: duration,
      priority,
      scheduledTime,
      xpReward: xp,
      gemsReward: gems,
      status: 'pending',
      notes: notes.trim(),
    });

    setTitle('');
    setNotes('');
    setIsAdding(false);
    playSound('complete');
  };

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto px-4 pt-3">
      {/* 1. Header & Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Daily Missions</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {completedCount} of {missions.length} conquered ·{' '}
            <span className="text-indigo-300 font-semibold">+{totalXp} XP earned today</span>
          </p>
        </div>

        <button
          onClick={() => {
            playSound('click');
            setIsAdding(true);
          }}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Mission</span>
        </button>
      </div>

      {/* 2. Filter tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg w-fit">
        {(['all', 'pending', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              playSound('click');
              setFilter(tab);
            }}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize cursor-pointer ${
              filter === tab
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. Missions List */}
      <div className="space-y-2.5">
        {filteredMissions.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800">
            <Target className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-300">No missions found</h3>
            <p className="text-xs text-slate-400 mt-1">
              Add a study mission to turn your daily timetable into rewarding achievements.
            </p>
          </div>
        ) : (
          filteredMissions.map((mission) => {
            const isCompleted = mission.status === 'completed';

            return (
              <div
                key={mission.id}
                className={`rounded-xl border p-4 transition-all ${
                  isCompleted
                    ? 'bg-slate-950/40 border-slate-800/40 opacity-75'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Checkmark & Content */}
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onToggleMission(mission.id)}
                      className="cursor-pointer focus:outline-none mt-0.5"
                      aria-label={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-medium text-indigo-400">{mission.subject}</span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {mission.durationMinutes}m
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{mission.priority} Priority</span>
                      </div>

                      <h3
                        className={`text-sm font-bold mt-1 ${
                          isCompleted ? 'line-through text-slate-500' : 'text-slate-100'
                        }`}
                      >
                        {mission.title}
                      </h3>

                      {mission.notes && (
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {mission.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: XP/Gems reward & Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-bold text-indigo-400 block">
                        +{mission.xpReward} XP
                      </span>
                      <span className="text-[10px] text-cyan-400 flex items-center justify-end gap-0.5 font-medium">
                        <Sparkles className="w-2.5 h-2.5" />
                        +{mission.gemsReward}
                      </span>
                    </div>

                    {!isCompleted && (
                      <button
                        onClick={() => onStartFocus(mission.title, mission.durationMinutes)}
                        className="p-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all cursor-pointer"
                        title="Start Smart Focus Mode"
                      >
                        <Play className="w-3.5 h-3.5 fill-indigo-400" />
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteMission(mission.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete mission"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Add Mission Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create Daily Mission</h3>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mission Goal *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solve 8 integration questions without checking hints"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Duration (Minutes)
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value={15}>15 mins (+15 XP)</option>
                    <option value={25}>25 mins (+25 XP)</option>
                    <option value={30}>30 mins (+25 XP)</option>
                    <option value={45}>45 mins (+40 XP)</option>
                    <option value={60}>60 mins (+50 XP)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tactical Notes / Focus Target
                </label>
                <input
                  type="text"
                  placeholder="e.g. Focus on accuracy over speed"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  Launch Mission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
