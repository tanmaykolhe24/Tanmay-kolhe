import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { playSound, fireCelebrationConfetti } from '../utils/gameLogic';

interface SmartFocusModalProps {
  taskTitle: string;
  initialMinutes: number;
  isOpen: boolean;
  onClose: () => void;
  onFinishSession: (result: {
    taskTitle: string;
    completed: boolean;
    accuracy: 'faster' | 'accurate' | 'slower';
    notes: string;
    xpEarned: number;
    gemsEarned: number;
  }) => void;
}

export const SmartFocusModal: React.FC<SmartFocusModalProps> = ({
  taskTitle,
  initialMinutes,
  isOpen,
  onClose,
  onFinishSession,
}) => {
  const [totalSeconds, setTotalSeconds] = useState(initialMinutes * 60);
  const [secondsRemaining, setSecondsRemaining] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [ambientHumOn, setAmbientHumOn] = useState(false);
  const [notes, setNotes] = useState('');
  const [showReflection, setShowReflection] = useState(false);

  // Reflection options
  const [isCompleted, setIsCompleted] = useState(true);
  const [accuracy, setAccuracy] = useState<'faster' | 'accurate' | 'slower'>('accurate');

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // Sync when initialMinutes changes
  useEffect(() => {
    setTotalSeconds(initialMinutes * 60);
    setSecondsRemaining(initialMinutes * 60);
    setIsRunning(false);
    setShowReflection(false);
  }, [initialMinutes, isOpen]);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning(false);
            playSound('level_up');
            setShowReflection(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsRemaining]);

  // Ambient sound synth
  useEffect(() => {
    if (ambientHumOn) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // 136.1 Hz (Om / deep meditation frequency) soft drone
        osc.type = 'sine';
        osc.frequency.setValueAtTime(136.1, ctx.currentTime);

        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        oscRef.current = osc;
        gainRef.current = gain;
      } catch {
        // audio context failed
      }
    } else {
      if (oscRef.current) {
        try {
          oscRef.current.stop();
          oscRef.current.disconnect();
        } catch {}
        oscRef.current = null;
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
        audioCtxRef.current = null;
      }
    }

    return () => {
      if (oscRef.current) {
        try {
          oscRef.current.stop();
        } catch {}
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [ambientHumOn]);

  if (!isOpen) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const progressPercent = Math.round(((totalSeconds - secondsRemaining) / totalSeconds) * 100);

  const handleCompleteSession = () => {
    const xp = isCompleted ? 35 : 15;
    const gems = isCompleted ? 7 : 3;

    fireCelebrationConfetti();
    playSound('stage_clear');

    onFinishSession({
      taskTitle,
      completed: isCompleted,
      accuracy,
      notes,
      xpEarned: xp,
      gemsEarned: gems,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F19]/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors"
          aria-label="Close Focus Mode"
        >
          <X className="w-4 h-4" />
        </button>

        {!showReflection ? (
          <>
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>SMART FOCUS SANCTUARY</span>
            </div>

            <h2 className="text-lg font-bold text-white max-w-xs line-clamp-2">
              {taskTitle || 'Deep Study Session'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Zero distractions. Build neurological momentum.
            </p>

            {/* Circular Digital Countdown */}
            <div className="relative my-8 w-56 h-56 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="stroke-slate-800"
                  strokeWidth="6"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  className="stroke-indigo-500 transition-all duration-1000 ease-linear"
                  strokeWidth="6"
                  strokeDasharray={276.46}
                  strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-white font-mono tracking-tight">
                  {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </span>
                <span className="text-[11px] text-slate-400 mt-1">
                  {progressPercent}% Complete
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => {
                  playSound('click');
                  setSecondsRemaining(totalSeconds);
                  setIsRunning(false);
                }}
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  playSound('click');
                  setIsRunning(!isRunning);
                }}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5 fill-white" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-white" />
                    <span>{secondsRemaining === totalSeconds ? 'Start Session' : 'Resume'}</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  playSound('complete');
                  setShowReflection(true);
                }}
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                title="Mark Finished Early"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Ambient Sound Drone & Mistake Diary */}
            <div className="w-full space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Binaural Ambient Hum (136Hz)</span>
                </span>
                <button
                  onClick={() => setAmbientHumOn(!ambientHumOn)}
                  className={`p-1.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                    ambientHumOn
                      ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  {ambientHumOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Error Log: Jot down formula traps or silly slips here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </>
        ) : (
          /* Post-Session Reflection Step */
          <div className="space-y-4 w-full text-left py-2">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center mb-2">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-white">Focus Session Complete!</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Reflect briefly to calibrate future AI recommendations.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Did you complete the planned task?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsCompleted(true)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                    isCompleted
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400'
                  }`}
                >
                  Yes, Finished (+35 XP)
                </button>
                <button
                  type="button"
                  onClick={() => setIsCompleted(false)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                    !isCompleted
                      ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400'
                  }`}
                >
                  Partially Done (+15 XP)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Was the estimated duration accurate?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'faster', label: 'Faster' },
                  { id: 'accurate', label: 'Just Right' },
                  { id: 'slower', label: 'Took Longer' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAccuracy(item.id as any)}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                      accuracy === item.id
                        ? 'bg-indigo-950/60 border-indigo-500 text-indigo-300'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {notes && (
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 text-xs text-slate-300">
                <span className="text-slate-400 block font-semibold">Captured Note:</span>
                <p className="mt-0.5">{notes}</p>
              </div>
            )}

            <button
              onClick={handleCompleteSession}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all cursor-pointer mt-4"
            >
              Claim XP & Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
