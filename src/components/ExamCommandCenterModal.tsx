import React, { useState } from 'react';
import {
  Shield,
  X,
  Swords,
  Calendar,
  CheckCircle2,
  Circle,
  Sparkles,
  Award,
  Zap,
  BookOpen,
} from 'lucide-react';
import { BossBattle, ExamChapter, ExamPlan } from '../types';
import { playSound, fireCelebrationConfetti } from '../utils/gameLogic';

interface ExamCommandCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  examPlan: ExamPlan;
  onToggleChapter: (chapterId: string) => void;
  onToggleBossStage: (bossId: string, stageNumber: number) => void;
}

export const ExamCommandCenterModal: React.FC<ExamCommandCenterModalProps> = ({
  isOpen,
  onClose,
  examPlan,
  onToggleChapter,
  onToggleBossStage,
}) => {
  const [activeTab, setActiveTab] = useState<'boss_battles' | 'chapters' | 'milestones'>('boss_battles');

  if (!isOpen) return null;

  const completedChapters = examPlan.chapters.filter((c) => c.isCompleted).length;
  const totalChapters = examPlan.chapters.length || 1;
  const syllabusProgress = Math.round((completedChapters / totalChapters) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-purple-500/40 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative my-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Countdown */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 flex-shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Exam Command Center</span>
              </h2>
              <p className="text-xs text-purple-300 font-semibold">
                {examPlan.examName} · Target Date: {examPlan.examDate}
              </p>
            </div>
          </div>

          <div className="bg-purple-950/50 border border-purple-500/40 px-3 py-1.5 rounded-xl text-right">
            <span className="text-[10px] text-purple-300 font-medium block">D-DAY COUNTDOWN</span>
            <span className="text-lg font-extrabold text-white font-mono block">
              {examPlan.daysRemaining} Days
            </span>
          </div>
        </div>

        {/* Syllabus Progress Meter */}
        <div className="mb-4 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
            <span className="font-semibold">Syllabus Completion</span>
            <span className="font-mono text-purple-400 font-bold">
              {completedChapters} of {totalChapters} Chapters ({syllabusProgress}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${syllabusProgress}%` }}
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl mb-4">
          {[
            { id: 'boss_battles', label: 'Chapter Boss Battles', icon: Swords },
            { id: 'chapters', label: 'Chapter Tracker', icon: BookOpen },
            { id: 'milestones', label: 'Mock Test Schedule', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playSound('click');
                  setActiveTab(tab.id as any);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Chapter Boss Battles */}
        {activeTab === 'boss_battles' && (
          <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
            <p className="text-xs text-slate-400">
              Conquer challenging academic topics step-by-step across 5 RPG stages to deplete the Boss HP!
            </p>

            {examPlan.bossBattles?.map((boss) => {
              const completedStages = boss.stages.filter((s) => s.isComplete).length;
              const hpPercent = Math.round((boss.currentHp / boss.bossHp) * 100);

              return (
                <div
                  key={boss.id}
                  className="rounded-2xl bg-slate-950/80 border border-purple-900/50 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-purple-400 tracking-wider uppercase block">
                        {boss.subject} BOSS BATTLE
                      </span>
                      <h3 className="text-sm font-bold text-white mt-0.5">{boss.title}</h3>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-xs font-bold text-red-400 block">
                        HP {boss.currentHp} / {boss.bossHp}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {completedStages}/5 Stages Cleared
                      </span>
                    </div>
                  </div>

                  {/* HP Bar */}
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 via-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${hpPercent}%` }}
                    />
                  </div>

                  {/* 5 Stages list */}
                  <div className="space-y-2 pt-1">
                    {boss.stages.map((stage) => (
                      <div
                        key={stage.stageNumber}
                        onClick={() => {
                          onToggleBossStage(boss.id, stage.stageNumber);
                        }}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          stage.isComplete
                            ? 'bg-purple-950/30 border-purple-800/40 text-slate-300'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {stage.isComplete ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-400/20 flex-shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                          )}
                          <span className={stage.isComplete ? 'font-semibold text-white' : ''}>
                            Stage {stage.stageNumber}: {stage.title}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono font-bold text-indigo-400">
                          +{stage.xpReward} XP
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: Chapters Tracker */}
        {activeTab === 'chapters' && (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {examPlan.chapters.map((ch) => (
              <div
                key={ch.id}
                onClick={() => onToggleChapter(ch.id)}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  ch.isCompleted
                    ? 'bg-slate-950/40 border-slate-800 text-slate-400'
                    : 'bg-slate-950/80 border-slate-800 text-white hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  {ch.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-500" />
                  )}
                  <div>
                    <span className="text-[10px] text-indigo-400 font-semibold block">
                      {ch.subject}
                    </span>
                    <h3 className={`text-xs font-bold ${ch.isCompleted ? 'line-through text-slate-500' : ''}`}>
                      {ch.chapterName}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                      ch.confidence === 'high'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : ch.confidence === 'medium'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {ch.confidence} Confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Mock Test Milestones */}
        {activeTab === 'milestones' && (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {examPlan.mockTestMilestones.map((mock, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-start justify-between gap-3"
              >
                <div>
                  <span className="text-[11px] text-purple-400 font-mono font-semibold block">
                    {mock.scheduledDate}
                  </span>
                  <h3 className="text-xs font-bold text-white mt-0.5">{mock.title}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Focus: {mock.focus}</p>
                </div>
                <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/60 border border-indigo-800/60 px-2 py-1 rounded-lg">
                  Simulation Drill
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
