import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { TaskBlock, UserProfile } from '../types';
import { playSound, fireCelebrationConfetti } from '../utils/gameLogic';

interface ScheduleGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onApplySchedule: (tasks: TaskBlock[]) => void;
}

export const ScheduleGeneratorModal: React.FC<ScheduleGeneratorModalProps> = ({
  isOpen,
  onClose,
  profile,
  onApplySchedule,
}) => {
  const [wakeTime, setWakeTime] = useState(profile.wakeTime || '06:00');
  const [bedTime, setBedTime] = useState(profile.bedTime || '23:00');
  const [schoolHours, setSchoolHours] = useState('08:00 - 14:30');
  const [tuitionHours, setTuitionHours] = useState('16:00 - 17:30');
  const [targetStudyHours, setTargetStudyHours] = useState('4.5');
  const [breakDuration, setBreakDuration] = useState('15');
  const [subjects, setSubjects] = useState('Physics Current Electricity, Maths Integration, Chemistry Organic Reactions');
  const [isLoading, setIsLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    playSound('click');

    try {
      const response = await fetch('/api/ai/generate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputs: {
            wakeTime,
            bedTime,
            schoolHours,
            tuitionHours,
            targetStudyHours,
            breakDuration,
            subjects,
          },
          studentProfile: profile,
        }),
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        setPreviewResult(resData.data);
        playSound('stage_clear');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!previewResult || !previewResult.schedule) return;

    const generatedTasks: TaskBlock[] = previewResult.schedule.map((t: any, idx: number) => ({
      id: `sched_${Date.now()}_${idx}`,
      day: 'Today',
      startTime: t.startTime,
      endTime: t.endTime,
      subject: t.subject,
      description: t.description,
      priority: t.priority || 'high',
      category: t.category || 'study',
      isFixed: t.isFixed || false,
      completed: false,
      aiRationale: t.aiRationale || 'Optimized by TIMEGENIUS AI Schedule Generator',
      durationMinutes: t.durationMinutes || 60,
    }));

    fireCelebrationConfetti();
    playSound('complete');
    onApplySchedule(generatedTasks);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative my-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              AI Timetable Generator
            </h2>
            <p className="text-xs text-slate-400">
              Calculate balanced, conflict-free study slots around your fixed commitments.
            </p>
          </div>
        </div>

        {!previewResult ? (
          <form onSubmit={handleGenerate} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Wake Up Time
                </label>
                <input
                  type="time"
                  required
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bed Time (Rest Protected)
                </label>
                <input
                  type="time"
                  required
                  value={bedTime}
                  onChange={(e) => setBedTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  School / College Timings
                </label>
                <input
                  type="text"
                  placeholder="e.g. 08:00 - 14:30"
                  value={schoolHours}
                  onChange={(e) => setSchoolHours(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tuition / Coaching Timings
                </label>
                <input
                  type="text"
                  placeholder="e.g. 16:00 - 17:30"
                  value={tuitionHours}
                  onChange={(e) => setTuitionHours(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Daily Self-Study Hours
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="8"
                  value={targetStudyHours}
                  onChange={(e) => setTargetStudyHours(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Preferred Break Duration (Mins)
                </label>
                <select
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="10">10 mins micro-break</option>
                  <option value="15">15 mins standard break</option>
                  <option value="20">20 mins walking/snack</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Subjects / Chapters Needing Work
              </label>
              <input
                type="text"
                placeholder="e.g. Physics Current Electricity, Maths Integration, Chemistry Organic"
                value={subjects}
                onChange={(e) => setSubjects(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'Optimizing Schedule Logic...' : 'Generate Conflict-Free Schedule'}</span>
            </button>
          </form>
        ) : (
          /* Preview Generated Timetable */
          <div className="space-y-4">
            <div className="bg-indigo-950/30 border border-indigo-500/40 rounded-2xl p-3.5 text-xs">
              <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase block">
                TACTICAL PHILOSOPHY
              </span>
              <p className="text-white font-semibold mt-0.5">{previewResult.dailyPhilosophy}</p>
              <p className="text-slate-400 mt-1">
                Total planned study: <strong className="text-cyan-300">{previewResult.totalStudyHours} hours</strong>
              </p>
            </div>

            {/* Schedule Blocks */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {previewResult.schedule?.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <span>{item.startTime} – {item.endTime}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-indigo-400 font-bold uppercase">{item.priority}</span>
                      {item.isFixed && <span className="text-slate-500">(Fixed)</span>}
                    </div>
                    <h4 className="font-bold text-white mt-0.5">{item.subject}</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">{item.description}</p>
                    {item.aiRationale && (
                      <p className="text-[10px] text-indigo-300/80 italic mt-1">
                        💡 {item.aiRationale}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
              {previewResult.reasoningSummary}
            </p>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setPreviewResult(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl bg-slate-800 cursor-pointer"
              >
                Adjust Parameters
              </button>
              <button
                onClick={handleApply}
                className="flex-1 py-2 text-xs font-bold text-white rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Replace Current Schedule</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
