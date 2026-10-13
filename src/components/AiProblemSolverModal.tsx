import React, { useState } from 'react';
import {
  Sparkles,
  X,
  CheckCircle2,
  Clock,
  Send,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Brain,
} from 'lucide-react';
import { TaskBlock, UserProfile } from '../types';
import { playSound, fireCelebrationConfetti } from '../utils/gameLogic';

interface AiProblemSolverModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onApplyPlan: (tasks: TaskBlock[]) => void;
}

export const AiProblemSolverModal: React.FC<AiProblemSolverModalProps> = ({
  isOpen,
  onClose,
  profile,
  onApplyPlan,
}) => {
  const [problemText, setProblemText] = useState(
    'I wake up at 6 AM. My school finishes at 3 PM. I have tuition from 5 to 7 PM, 4 Physics chapters pending, and a Maths exam in 15 days. I get distracted scrolling on my phone and get tired in the evening.'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [solution, setSolution] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleSolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemText.trim()) return;

    setIsLoading(true);
    playSound('click');

    try {
      const response = await fetch('/api/ai/solve-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemText,
          studentProfile: profile,
        }),
      });

      const resData = await response.json();
      if (resData.success && resData.data) {
        setSolution(resData.data);
        playSound('stage_clear');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToTimetable = () => {
    if (!solution || !solution.proposedPlan) return;

    const newTasks: TaskBlock[] = solution.proposedPlan.map((p: any, idx: number) => ({
      id: `ai_plan_${Date.now()}_${idx}`,
      day: 'Today',
      startTime: p.startTime || '17:00',
      endTime: p.endTime || '18:15',
      subject: p.subject,
      description: p.description,
      priority: p.priority || 'high',
      category: p.category || 'study',
      isFixed: false,
      completed: false,
      aiRationale: p.rationale || 'Engineered by TIMEGENIUS AI Problem Solver',
      durationMinutes: 60,
    }));

    fireCelebrationConfetti();
    playSound('complete');
    onApplyPlan(newTasks);
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
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 p-[2px] flex items-center justify-center flex-shrink-0">
            <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
              <Brain className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Personalized AI Problem Solver</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                CORE
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Explain your real situation in plain words. Get a tailored, realistic strategy.
            </p>
          </div>
        </div>

        {!solution ? (
          <form onSubmit={handleSolve} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Describe your daily commitments, exam deadlines, and time struggles:
              </label>
              <textarea
                rows={5}
                required
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                placeholder="e.g. I wake up at 5 AM. School finishes at 6:30 PM. I have tuition, 5 Physics chapters pending, and a Maths exam in 20 days. I get distracted on my phone..."
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            {/* Quick Prompt Presets */}
            <div>
              <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                Try a realistic scenario:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '12th Board student with heavy tuition & low energy in evening',
                  'JEE Aspirant with backlog in Mechanics and phone addiction',
                  'NEET candidate balancing 10 hours coaching and Biology memory fatigue',
                ].map((sample, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setProblemText(sample)}
                    className="text-[11px] bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors cursor-pointer text-left"
                  >
                    "{sample.slice(0, 40)}..."
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'Synthesizing Tactical Plan...' : 'Analyze & Solve My Problem'}</span>
            </button>
          </form>
        ) : (
          /* Strategy & Timetable Proposal */
          <div className="space-y-4">
            {/* Core Summary & Distraction Strategy */}
            <div className="bg-indigo-950/30 border border-indigo-500/40 rounded-2xl p-4 text-xs space-y-2">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 tracking-wider uppercase block">
                  SITUATION ASSESSMENT
                </span>
                <p className="text-slate-200 font-semibold mt-0.5">{solution.summary}</p>
              </div>

              {solution.distractionStrategy && (
                <div className="pt-2 border-t border-indigo-900/60">
                  <span className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase block">
                    ANTI-PROCRASTINATION TACTIC
                  </span>
                  <p className="text-slate-300 mt-0.5 leading-relaxed">
                    {solution.distractionStrategy}
                  </p>
                </div>
              )}
            </div>

            {/* Proposed Timetable Blocks */}
            <div>
              <h3 className="text-xs font-bold text-white mb-2 flex items-center justify-between">
                <span>PROPOSED REALISTIC TIMETABLE</span>
                <span className="text-indigo-400 font-mono text-[11px]">
                  {solution.availableHoursDaily}
                </span>
              </h3>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {solution.proposedPlan?.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                        <span>{item.time || `${item.startTime} - ${item.endTime}`}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-indigo-400 font-bold uppercase">{item.priority}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white mt-0.5">{item.subject}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.description}</p>
                      {item.rationale && (
                        <p className="text-[10px] text-indigo-300/80 italic mt-1">
                          💡 {item.rationale}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Scheduling Reasoning */}
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed space-y-1">
              <span className="font-bold text-slate-300 block">Why this plan works:</span>
              <p>{solution.reasoning}</p>
              {solution.adjustmentsAllowed && (
                <p className="text-[11px] text-indigo-300 pt-1 border-t border-slate-800/80">
                  ✏️ {solution.adjustmentsAllowed}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSolution(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl bg-slate-800 cursor-pointer"
              >
                Refine Query
              </button>
              <button
                onClick={handleApplyToTimetable}
                className="flex-1 py-2 text-xs font-bold text-white rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply to My Timetable</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
