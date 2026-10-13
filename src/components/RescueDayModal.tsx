import React, { useState } from 'react';
import {
  LifeBuoy,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Calendar,
} from 'lucide-react';
import { TaskBlock, UserProfile } from '../types';
import { playSound, fireCelebrationConfetti } from '../utils/gameLogic';

interface RescueDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskBlock[];
  profile: UserProfile;
  onApplyRescheduledTasks: (rescheduled: TaskBlock[], explanation: string) => void;
}

export const RescueDayModal: React.FC<RescueDayModalProps> = ({
  isOpen,
  onClose,
  tasks,
  profile,
  onApplyRescheduledTasks,
}) => {
  const [currentTime, setCurrentTime] = useState('17:00');
  const [interruptionReason, setInterruptionReason] = useState('coaching_overtime');
  const [customReason, setCustomReason] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [rescueResult, setRescueResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const unfinishedTasks = tasks.filter((t) => !t.completed && t.category !== 'break');

  const handleRunRescue = async () => {
    setIsGenerating(true);
    playSound('rescue');

    const reasonText =
      interruptionReason === 'overslept'
        ? 'Overslept / morning delay'
        : interruptionReason === 'coaching_overtime'
        ? 'Coaching or school extra class overtime'
        : interruptionReason === 'exhausted'
        ? 'Low physical energy / headache'
        : interruptionReason === 'phone_distraction'
        ? 'Phone procrastination lapse'
        : customReason || 'Unexpected schedule disruption';

    try {
      const response = await fetch('/api/ai/rescue-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentTime,
          unfinishedTasks,
          reason: reasonText,
          bedTime: profile.bedTime,
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setRescueResult(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmRescue = () => {
    if (!rescueResult) return;

    // Convert rescheduledToday to TaskBlock
    const newTasks: TaskBlock[] = (rescueResult.rescheduledToday || []).map((t: any, idx: number) => ({
      id: `rescued_${Date.now()}_${idx}`,
      day: 'Today',
      startTime: t.startTime,
      endTime: t.endTime,
      subject: t.subject,
      description: t.description,
      priority: t.priority || 'high',
      category: t.category || 'study',
      isFixed: false,
      completed: false,
      aiRationale: t.aiRationale || 'Rescheduled during Smart Rescue to preserve sanity',
      durationMinutes: t.durationMinutes || 60,
    }));

    fireCelebrationConfetti();
    playSound('complete');
    onApplyRescheduledTasks(newTasks, rescueResult.rescueExplanation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-rose-500/30 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative my-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 flex-shrink-0">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Rescue My Day</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                ANTI-BURNOUT
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Zero guilt. Recalibrate remaining hours without sleep sacrifice.
            </p>
          </div>
        </div>

        {!rescueResult ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                What time is it right now?
              </label>
              <input
                type="time"
                value={currentTime}
                onChange={(e) => setCurrentTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                What interrupted your schedule?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'coaching_overtime', label: 'Coaching Extra Class' },
                  { id: 'exhausted', label: 'Exhausted / Headache' },
                  { id: 'phone_distraction', label: 'Distracted by Phone' },
                  { id: 'overslept', label: 'Overslept / Commute' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setInterruptionReason(item.id)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-left transition-colors cursor-pointer ${
                      interruptionReason === item.id
                        ? 'bg-rose-950/40 border-rose-500 text-rose-300'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-xs text-slate-300 space-y-1">
              <span className="font-semibold text-slate-400 block">Pending tasks detected:</span>
              <p className="text-white font-medium">
                {unfinishedTasks.length} unfinished tasks queueing today.
              </p>
              <p className="text-[11px] text-slate-400">
                Protected Bedtime: <strong className="text-slate-200">{profile.bedTime}</strong> (will NOT be compromised).
              </p>
            </div>

            <button
              onClick={handleRunRescue}
              disabled={isGenerating}
              className="w-full py-3 bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Recalibrating Schedule...' : 'Analyze & Rescue Remaining Hours'}</span>
            </button>
          </div>
        ) : (
          /* Rescue Result Review */
          <div className="space-y-4">
            {/* Compassionate Message */}
            <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-3.5 text-xs text-rose-200">
              <p className="font-semibold">{rescueResult.rescueMessage}</p>
            </div>

            {/* Rescheduled for Today */}
            <div>
              <h3 className="text-xs font-bold text-white mb-2 flex items-center justify-between">
                <span>RECALIBRATED FOR TONIGHT</span>
                <span className="text-indigo-400 font-mono text-[11px]">
                  {rescueResult.remainingHoursAvailable} hours available
                </span>
              </h3>

              <div className="space-y-2">
                {rescueResult.rescheduledToday?.map((task: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                        <span>{task.startTime} – {task.endTime}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-rose-400 font-bold uppercase">{task.priority}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-0.5">{task.subject}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{task.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deferred Tasks to Buffer Slot */}
            {rescueResult.deferredTasks?.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-400 mb-2">
                  MOVED TO BUFFER RECOVERY (NO OVERLOAD)
                </h3>
                <div className="space-y-1.5">
                  {rescueResult.deferredTasks.map((def: any, i: number) => (
                    <div
                      key={i}
                      className="p-2.5 bg-slate-950/40 border border-slate-800/60 rounded-xl text-xs text-slate-400 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-medium text-slate-300 block">{def.subject}</span>
                        <span className="text-[11px] text-slate-400">{def.reason}</span>
                      </div>
                      <span className="text-[10px] text-indigo-300 bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-900/40">
                        {def.deferredTo}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Explanation */}
            <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/50 p-2.5 rounded-xl border border-slate-800">
              💡 {rescueResult.rescueExplanation}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setRescueResult(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl bg-slate-800 cursor-pointer"
              >
                Tweak Inputs
              </button>
              <button
                onClick={handleConfirmRescue}
                className="flex-1 py-2 text-xs font-bold text-white rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply Rescheduled Plan</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
