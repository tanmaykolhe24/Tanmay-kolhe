import React from 'react';
import { Flame, Sparkles, Volume2, VolumeX, Shield, Zap } from 'lucide-react';
import { UserProfile } from '../types';
import { getLevelProgress, playSound } from '../utils/gameLogic';

interface HeaderProps {
  profile: UserProfile;
  onToggleSound: () => void;
  onOpenExamCenter: () => void;
  onOpenAssistant: () => void;
  onOpenDoubtSolver?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onToggleSound,
  onOpenExamCenter,
  onOpenAssistant,
  onOpenDoubtSolver,
}) => {
  const levelInfo = getLevelProgress(profile.xp);

  return (
    <header className="sticky top-0 z-30 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-[1.5px] flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-[#0B0F19] rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-white text-base font-sans">
                TIMEGENIUS
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wider">
              LEVEL UP YOUR LIFE
            </p>
          </div>
        </div>

        {/* RPG Level & Resource Stats */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Level & Rank widget */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-lg px-2.5 py-1">
            <div className="w-6 h-6 rounded-md bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300">
              {levelInfo.currentLevel}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center justify-between text-[11px] leading-tight">
                <span className="font-semibold text-slate-200">{levelInfo.rank}</span>
                <span className="text-slate-400 ml-2 font-mono text-[10px]">
                  {levelInfo.xpEarnedInLevel}/{levelInfo.xpNeeded} XP
                </span>
              </div>
              <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                  style={{ width: `${levelInfo.percent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Streak */}
          <div
            className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-default"
            title={`${profile.streak} Days Consistency Streak`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{profile.streak}d</span>
          </div>

          {/* Virtual Currency (Gems) */}
          <div
            className="flex items-center gap-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-default"
            title="Genius Gems earned through academic milestones"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{profile.gems}</span>
          </div>

          {/* Exam Command Center Button */}
          <button
            onClick={() => {
              playSound('click');
              onOpenExamCenter();
            }}
            className="hidden md:flex items-center gap-1.5 bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/40 text-purple-300 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>Exam Center</span>
          </button>

          {/* Doubt Solver Header Button */}
          {onOpenDoubtSolver && (
            <button
              onClick={() => {
                playSound('click');
                onOpenDoubtSolver();
              }}
              className="hidden lg:flex items-center gap-1.5 bg-gradient-to-r from-purple-900/40 to-indigo-900/40 hover:from-purple-900/60 hover:to-indigo-900/60 border border-purple-500/40 text-purple-300 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Doubt Solver</span>
            </button>
          )}

          {/* Sound toggle */}
          <button
            onClick={onToggleSound}
            aria-label="Toggle Sound Effects"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer"
          >
            {profile.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-indigo-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile XP Bar (Compact) */}
      <div className="sm:hidden mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-indigo-400">Lv.{levelInfo.currentLevel}</span>
          <span className="text-slate-300 font-medium">{levelInfo.rank}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-300"
              style={{ width: `${levelInfo.percent}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            {levelInfo.xpEarnedInLevel}/{levelInfo.xpNeeded} XP
          </span>
        </div>
      </div>
    </header>
  );
};
