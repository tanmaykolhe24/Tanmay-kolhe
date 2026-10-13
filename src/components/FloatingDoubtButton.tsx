import React from 'react';
import { HelpCircle, Sparkles } from 'lucide-react';
import { playSound } from '../utils/gameLogic';

interface FloatingDoubtButtonProps {
  onOpen: () => void;
  doubtsCount?: number;
}

export const FloatingDoubtButton: React.FC<FloatingDoubtButtonProps> = ({ onOpen }) => {
  return (
    <div className="fixed bottom-18 sm:bottom-8 right-4 sm:right-8 z-40">
      <button
        onClick={() => {
          playSound('click');
          onOpen();
        }}
        className="group relative flex items-center gap-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 p-[1.5px] rounded-full shadow-xl shadow-purple-900/40 hover:shadow-purple-700/60 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        title="AI All-Subject Doubt Solver"
        aria-label="Open AI All-Subject Doubt Solver"
      >
        <div className="flex items-center gap-2 bg-[#0B0F19]/90 group-hover:bg-[#0B0F19]/70 px-3.5 py-2.5 rounded-full transition-colors backdrop-blur-md">
          <div className="relative">
            <HelpCircle className="w-5 h-5 text-purple-400 group-hover:text-cyan-300 transition-colors" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping pointer-events-none" />
          </div>
          <span className="text-xs font-extrabold text-white tracking-tight hidden sm:inline">
            AI Doubt Solver
          </span>
          <span className="text-[10px] font-bold px-1 py-0.2 rounded bg-purple-500/30 text-purple-200 border border-purple-500/40 hidden md:inline">
            ALL SUBS
          </span>
        </div>
      </button>
    </div>
  );
};
