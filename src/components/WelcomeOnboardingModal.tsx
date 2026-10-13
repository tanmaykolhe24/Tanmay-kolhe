import React, { useState } from 'react';
import { Sparkles, Zap, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { UserProfile } from '../types';
import { playSound, fireCelebrationConfetti } from '../utils/gameLogic';

interface WelcomeOnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: Partial<UserProfile>) => void;
}

export const WelcomeOnboardingModal: React.FC<WelcomeOnboardingModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const [name, setName] = useState('Aarav Sharma');
  const [targetExam, setTargetExam] = useState('JEE Main & 12th Board Examinations');
  const [grade, setGrade] = useState('Class 12 - PCM');
  const [wakeTime, setWakeTime] = useState('06:00');
  const [bedTime, setBedTime] = useState('23:00');
  const [avatarStyle, setAvatarStyle] = useState('cyber_scholar');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    fireCelebrationConfetti();
    playSound('level_up');

    onComplete({
      name: name.trim(),
      targetExam,
      grade,
      wakeTime,
      bedTime,
      avatar: {
        style: avatarStyle,
        hairstyle: 'neon_fade',
        outfit: 'stealth_hoodie',
        accessory: 'hud_glasses',
        frame: 'electric_blue',
        background: 'neon_academy',
        unlockedItems: [avatarStyle, 'neon_fade', 'stealth_hoodie', 'hud_glasses', 'electric_blue', 'neon_academy'],
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F19]/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative my-6 text-left">
        {/* Top Developer & Identity Credit */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[1.5px] flex items-center justify-center">
              <div className="w-full h-full bg-[#0B0F19] rounded-[7px] flex items-center justify-center">
                <Zap className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-white text-sm tracking-tight">TIMEGENIUS AI</span>
              <span className="text-[10px] text-indigo-400 block font-semibold">LEVEL UP YOUR LIFE</span>
            </div>
          </div>

          <div className="text-right text-[10px] text-slate-400">
            <span className="block font-medium text-slate-300">By Tanmay Mangesh Kolhe</span>
            <span>Maharashtra, India 🇮🇳</span>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Welcome to TIMEGENIUS AI
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Turn your academic schedule into an RPG quest. Explain your real constraints, generate conflict-free timetables, conquer difficult chapter boss battles, and level up with every finished session.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Your Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aarav, Priya, Rohan..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Exam / Goal *
              </label>
              <select
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="JEE Main & 12th Board Examinations">JEE Main & Boards</option>
                <option value="NEET Medical UG Examination">NEET UG</option>
                <option value="CBSE / ICSE 10th / 12th Board">Board Examinations</option>
                <option value="MHT-CET & State Engineering">MHT-CET / State CET</option>
                <option value="College Degree & Semester Finals">College Semester</option>
                <option value="Self-Study & Personal Mastery">Self-Study</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Class / Grade
              </label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Typical Wake Time
              </label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Protected Bed Time
              </label>
              <input
                type="time"
                value={bedTime}
                onChange={(e) => setBedTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Avatar Persona Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Choose Starter Avatar Persona
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cyber_scholar', label: 'Cyber Scholar', icon: '🧑‍💻' },
                { id: 'quantum_prodigy', label: 'Quantum Prodigy', icon: '🧬' },
                { id: 'astro_genius', label: 'Astro Genius', icon: '🚀' },
              ].map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setAvatarStyle(av.id)}
                  className={`py-2 px-1 text-center rounded-xl border text-xs cursor-pointer transition-colors ${
                    avatarStyle === av.id
                      ? 'bg-indigo-950/60 border-indigo-500 text-white font-bold'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="text-xl block mb-0.5">{av.icon}</span>
                  <span className="text-[11px] block">{av.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
          >
            <span>Level Up Your Life · Launch TIMEGENIUS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
