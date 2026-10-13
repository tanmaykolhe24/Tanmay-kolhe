import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  AlertTriangle,
  Play,
  CheckCircle2,
  Circle,
  Trash2,
  Edit2,
  Sparkles,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { TaskBlock, TaskCategory, TaskPriority } from '../types';
import { detectScheduleConflicts } from '../utils/initialData';
import { playSound } from '../utils/gameLogic';

interface TimetableTabProps {
  tasks: TaskBlock[];
  onToggleTaskComplete: (taskId: string) => void;
  onAddTask: (task: Omit<TaskBlock, 'id'>) => void;
  onDeleteTask: (taskId: string) => void;
  onStartFocus: (subject: string, duration?: number) => void;
  onOpenScheduleGenerator: () => void;
}

export const TimetableTab: React.FC<TimetableTabProps> = ({
  tasks,
  onToggleTaskComplete,
  onAddTask,
  onDeleteTask,
  onStartFocus,
  onOpenScheduleGenerator,
}) => {
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'calendar'>('daily');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // New task form state
  const [newSubject, setNewSubject] = useState('');
  const [newStartTime, setNewStartTime] = useState('17:00');
  const [newEndTime, setNewEndTime] = useState('18:00');
  const [newCategory, setNewCategory] = useState<TaskCategory>('study');
  const [newPriority, setNewPriority] = useState<TaskPriority>('high');
  const [newDescription, setNewDescription] = useState('');
  const [newIsFixed, setNewIsFixed] = useState(false);

  // Check conflicts
  const conflicts = detectScheduleConflicts(tasks);

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (selectedCategory === 'all') return true;
    return task.category === selectedCategory;
  });

  // Calculate planned study hours
  const studyMinutes = tasks
    .filter((t) => t.category === 'study' || t.category === 'practice' || t.category === 'revision')
    .reduce((acc, t) => acc + (t.durationMinutes || 60), 0);
  const studyHours = (studyMinutes / 60).toFixed(1);

  const completedStudyMinutes = tasks
    .filter((t) => (t.category === 'study' || t.category === 'practice' || t.category === 'revision') && t.completed)
    .reduce((acc, t) => acc + (t.durationMinutes || 60), 0);
  const completedHours = (completedStudyMinutes / 60).toFixed(1);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    // Calculate duration
    const [h1, m1] = newStartTime.split(':').map(Number);
    const [h2, m2] = newEndTime.split(':').map(Number);
    const duration = Math.max(15, (h2 * 60 + m2) - (h1 * 60 + m1));

    onAddTask({
      day: 'Today',
      startTime: newStartTime,
      endTime: newEndTime,
      subject: newSubject.trim(),
      description: newDescription.trim() || 'Focused study block',
      category: newCategory,
      priority: newPriority,
      isFixed: newIsFixed,
      completed: false,
      durationMinutes: duration > 0 ? duration : 60,
      aiRationale: 'Custom student scheduled session',
    });

    setNewSubject('');
    setNewDescription('');
    setIsAddingTask(false);
    playSound('complete');
  };

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto px-4 pt-3">
      {/* 1. Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Dynamic Timetable</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Planned study: <span className="text-indigo-300 font-semibold">{studyHours} hrs</span> · Completed: <span className="text-emerald-400 font-semibold">{completedHours} hrs</span>
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* AI Generator button */}
          <button
            onClick={() => {
              playSound('click');
              onOpenScheduleGenerator();
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold px-3 py-2 rounded-xl shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Generate</span>
          </button>

          {/* Add Task manual */}
          <button
            onClick={() => {
              playSound('click');
              setIsAddingTask(true);
            }}
            className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* 2. View Mode & Category Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
        {/* View Mode Segmented Selector */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
          {(['daily', 'weekly', 'calendar'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => {
                playSound('click');
                setViewMode(mode);
              }}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize cursor-pointer ${
                viewMode === mode
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'study', label: 'Theory' },
            { id: 'practice', label: 'Practice' },
            { id: 'revision', label: 'Revision' },
            { id: 'school', label: 'Institutions' },
            { id: 'break', label: 'Buffers' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                playSound('click');
                setSelectedCategory(cat.id);
              }}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-slate-800 text-indigo-300 font-semibold border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Schedule Conflict Warning Banner */}
      {conflicts.length > 0 && (
        <div className="rounded-xl bg-amber-950/40 border border-amber-500/40 p-3.5 flex items-start gap-3 text-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <h3 className="font-bold text-amber-300">
              Schedule Conflict Detected ({conflicts.length})
            </h3>
            <p className="text-amber-200/90 mt-0.5">
              "{conflicts[0].task1.subject}" overlaps with "{conflicts[0].task2.subject}" at {conflicts[0].task1.startTime}. Adjust timings to maintain stress-free flow.
            </p>
          </div>
        </div>
      )}

      {/* 4. Weekly View Summary (if active) */}
      {viewMode === 'weekly' && (
        <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
            <div
              key={day}
              className={`p-2.5 rounded-xl border text-center ${
                idx === 0
                  ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-200'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
            >
              <span className="text-xs font-bold block">{day}</span>
              <span className="text-[11px] block mt-1 font-mono">
                {idx === 0 ? `${studyHours}h study` : '4.0h study'}
              </span>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {idx === 0 ? 'Today' : idx === 5 ? 'Mock Test' : 'Planned'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 5. Calendar View Summary (if active) */}
      {viewMode === 'calendar' && (
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-300 font-semibold">
            <span>October 2026 Academic Calendar</span>
            <span className="text-indigo-400 font-mono">103 Days to JEE Main</span>
          </div>
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <span key={i} className="text-[11px] text-slate-400 font-bold py-1">
                {d}
              </span>
            ))}
            {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => {
              const isToday = date === 13;
              const isExam = date === 24;
              return (
                <div
                  key={date}
                  className={`py-2 rounded-lg text-xs font-mono transition-all ${
                    isToday
                      ? 'bg-indigo-600 text-white font-bold ring-2 ring-indigo-400'
                      : isExam
                      ? 'bg-purple-900/50 text-purple-300 border border-purple-500/40 font-bold'
                      : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {date}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Tasks Timeline List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-10 bg-slate-900/40 rounded-2xl border border-slate-800">
            <Calendar className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-300">No tasks in this category</h3>
            <p className="text-xs text-slate-400 mt-1">Tap "Add Task" or use AI to generate your plan.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.completed;
            const isBreak = task.category === 'break';

            return (
              <div
                key={task.id}
                className={`group rounded-xl border p-3.5 transition-all ${
                  isCompleted
                    ? 'bg-slate-950/40 border-slate-800/40 opacity-70'
                    : isBreak
                    ? 'bg-slate-900/30 border-slate-800/50'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Checkbox & Info */}
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onToggleTaskComplete(task.id)}
                      className="cursor-pointer focus:outline-none mt-0.5"
                      aria-label={isCompleted ? 'Mark task pending' : 'Mark task completed'}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500 hover:text-slate-300" />
                      )}
                    </button>

                    <div>
                      {/* Time & Category line */}
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="font-mono font-medium text-slate-300">
                          {task.startTime} – {task.endTime}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{task.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize font-medium text-slate-400">
                          {task.priority} Priority
                        </span>
                        {task.isFixed && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-slate-400 font-medium">Fixed</span>
                          </>
                        )}
                      </div>

                      {/* Subject Title */}
                      <h3
                        className={`text-sm font-bold mt-1 ${
                          isCompleted ? 'line-through text-slate-500' : 'text-slate-100'
                        }`}
                      >
                        {task.subject}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        {task.description}
                      </p>

                      {/* AI Rationale footnote */}
                      {task.aiRationale && (
                        <div className="mt-1.5 text-[11px] text-indigo-300/80 bg-indigo-950/20 border border-indigo-900/30 px-2 py-0.5 rounded-md inline-block">
                          💡 {task.aiRationale}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {!isCompleted && !isBreak && (
                      <button
                        onClick={() => onStartFocus(task.subject, task.durationMinutes)}
                        className="flex items-center gap-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                        title="Enter Focus Mode"
                      >
                        <Play className="w-3.5 h-3.5 fill-indigo-400" />
                        <span className="hidden sm:inline">Focus</span>
                      </button>
                    )}

                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Delete task"
                      aria-label="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 7. Add Task Modal */}
      {isAddingTask && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Add Schedule Block</h3>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subject or Activity Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics Formula Recall or Maths Mock DPP"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as TaskCategory)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="study">Study / Theory</option>
                    <option value="practice">Problem Practice</option>
                    <option value="revision">Active Revision</option>
                    <option value="school">School / Coaching</option>
                    <option value="break">Buffer / Meal</option>
                    <option value="personal">Personal Routine</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    <option value="fixed">Fixed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Specific Task Goal / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Complete 10 questions on Kirchhoff laws"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="fixedCheck"
                  checked={newIsFixed}
                  onChange={(e) => setNewIsFixed(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="fixedCheck" className="text-xs text-slate-300 cursor-pointer">
                  Fixed commitment (cannot be moved during Smart Rescue)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  Add to Timetable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
