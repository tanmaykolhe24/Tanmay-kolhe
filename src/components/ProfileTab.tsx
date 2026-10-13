import React, { useState } from 'react';
import {
  User,
  Sparkles,
  ShoppingBag,
  Globe,
  Share2,
  Settings,
  Shield,
  Check,
  Flame,
  Award,
  Zap,
  Download,
  Copy,
} from 'lucide-react';
import { ShopItem, UserProfile } from '../types';
import { getLevelProgress, playSound } from '../utils/gameLogic';

interface ProfileTabProps {
  profile: UserProfile;
  shopItems: ShopItem[];
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onBuyOrEquipItem: (itemId: string) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  profile,
  shopItems,
  onUpdateProfile,
  onBuyOrEquipItem,
}) => {
  const [activeSection, setActiveSection] = useState<'avatar' | 'shop' | 'worlds' | 'card' | 'settings'>('avatar');
  const [shareCopied, setShareCopied] = useState(false);

  // Edit settings state
  const [editName, setEditName] = useState(profile.name);
  const [editExam, setEditExam] = useState(profile.targetExam);
  const [editGrade, setEditGrade] = useState(profile.grade);
  const [editWake, setEditWake] = useState(profile.wakeTime);
  const [editBed, setEditBed] = useState(profile.bedTime);
  const [editFocusLength, setEditFocusLength] = useState(profile.preferredFocusLength);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const levelInfo = getLevelProgress(profile.xp);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name: editName,
      targetExam: editExam,
      grade: editGrade,
      wakeTime: editWake,
      bedTime: editBed,
      preferredFocusLength: editFocusLength,
    });
    setSavedSuccess(true);
    playSound('complete');
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCopyCard = () => {
    const text = `🏆 TIMEGENIUS AI Milestone Card 🏆
Player: ${profile.name}
Level ${levelInfo.currentLevel} · ${levelInfo.rank}
Target: ${profile.targetExam}
Consistency Streak: ${profile.streak} Days 🔥
Genius Gems: ${profile.gems} 💎
"Level Up Your Life" — Developed by Tanmay Mangesh Kolhe (India 🇮🇳)`;
    navigator.clipboard.writeText(text);
    setShareCopied(true);
    playSound('chime');
    setTimeout(() => setShareCopied(false), 2000);
  };

  const progressionWorlds = [
    { id: 'neon_academy', name: 'Neon Academy', minLevel: 1, icon: '🏛️', desc: 'The beginner proving ground of foundational discipline.', unlocked: true },
    { id: 'cyber_city', name: 'Cyber City', minLevel: 6, icon: '🌆', desc: 'Metropolitan high-density learning hub.', unlocked: profile.level >= 6 },
    { id: 'cosmic_library', name: 'Cosmic Library', minLevel: 11, icon: '🪐', desc: 'Deep galactic archives of universal formulas.', unlocked: profile.level >= 11 },
    { id: 'quantum_realm', name: 'Quantum Realm', minLevel: 21, icon: '⚛️', desc: 'Subatomic precision and effortless time control.', unlocked: profile.level >= 21 },
    { id: 'galaxy_of_champions', name: 'Galaxy of Champions', minLevel: 36, icon: '👑', desc: 'Sanctuary of top-ranking scholars and masters.', unlocked: profile.level >= 36 },
  ];

  return (
    <div className="space-y-5 pb-24 max-w-4xl mx-auto px-4 pt-3">
      {/* 1. Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Player Profile & Workshop
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Customize your avatar, explore progression worlds, and configure habits.
        </p>
      </div>

      {/* 2. Workshop Navigation Segmented Control */}
      <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
        {[
          { id: 'avatar', label: 'Avatar Workshop', icon: User },
          { id: 'shop', label: 'Reward Shop', icon: ShoppingBag },
          { id: 'worlds', label: 'Themed Worlds', icon: Globe },
          { id: 'card', label: 'Share Card', icon: Share2 },
          { id: 'settings', label: 'Preferences', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playSound('click');
                setActiveSection(tab.id as any);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Section: Avatar Workshop */}
      {activeSection === 'avatar' && (
        <div className="space-y-4">
          {/* Avatar Preview Card */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-[#10172A] to-[#151C33] border border-slate-800 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="relative mb-3">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[3px] shadow-2xl shadow-indigo-500/30">
                <div className="w-full h-full bg-[#0B0F19] rounded-[21px] flex items-center justify-center text-5xl select-none">
                  {profile.avatar.style === 'quantum_prodigy'
                    ? '🧬'
                    : profile.avatar.style === 'vedic_sage'
                    ? '🧘‍♂️'
                    : profile.avatar.style === 'astro_genius'
                    ? '🚀'
                    : '🧑‍💻'}
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-indigo-600 border-2 border-slate-900 text-white text-xs font-extrabold px-2 py-0.5 rounded-full">
                Lv.{profile.level}
              </div>
            </div>

            <h2 className="text-lg font-bold text-white tracking-tight">{profile.name}</h2>
            <p className="text-xs text-indigo-400 font-semibold mt-0.5">{levelInfo.rank} · {profile.targetExam}</p>

            <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-amber-300">
                <Flame className="w-3.5 h-3.5 fill-amber-400" />
                {profile.streak} Day Streak
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-cyan-300">
                <Sparkles className="w-3.5 h-3.5" />
                {profile.gems} Gems
              </span>
            </div>
          </div>

          {/* Avatar Style Chooser */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
            <h2 className="text-xs font-bold text-slate-300 tracking-wider mb-3">
              CHOOSE AVATAR IDENTITY STYLE
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'cyber_scholar', label: 'Cyber Scholar', icon: '🧑‍💻', desc: 'Calculated & tech-empowered' },
                { id: 'quantum_prodigy', label: 'Quantum Prodigy', icon: '🧬', desc: 'Analytical deep problem solver' },
                { id: 'vedic_sage', label: 'Disciplined Sage', icon: '🧘‍♂️', desc: 'Calm, focused & mindful' },
                { id: 'astro_genius', label: 'Astro Genius', icon: '🚀', desc: 'Limitless ambition & stamina' },
              ].map((style) => {
                const isSelected = profile.avatar.style === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => {
                      playSound('click');
                      onUpdateProfile({
                        avatar: { ...profile.avatar, style: style.id },
                      });
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/50 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{style.icon}</span>
                    <span className="text-xs font-bold block">{style.label}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{style.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. Section: Virtual Reward Shop */}
      {activeSection === 'shop' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="text-xs text-slate-400 block">Available Virtual Currency</span>
                <span className="text-base font-bold text-white block">{profile.gems} Genius Gems</span>
              </div>
            </div>
            <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/60 px-2 py-1 rounded-md">
              100% Free · 0 Real Money
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {shopItems.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl border p-4 transition-all flex items-start justify-between gap-3 ${
                  item.isEquipped
                    ? 'bg-indigo-950/30 border-indigo-500/60'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-cyan-400 capitalize">
                      {item.rarity} {item.category}
                    </span>
                    {item.isEquipped && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/60">
                        Equipped
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">{item.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                  <span className="text-xs font-mono font-bold text-cyan-300 mt-2 block">
                    💎 {item.costGems} Gems
                  </span>
                </div>

                <div className="flex-shrink-0">
                  {item.isEquipped ? (
                    <button
                      onClick={() => onBuyOrEquipItem(item.id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                    >
                      Unequip
                    </button>
                  ) : item.isUnlocked ? (
                    <button
                      onClick={() => onBuyOrEquipItem(item.id)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                    >
                      Equip
                    </button>
                  ) : (
                    <button
                      onClick={() => onBuyOrEquipItem(item.id)}
                      disabled={profile.gems < item.costGems}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                        profile.gems >= item.costGems
                          ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      Unlock
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Section: Progression Worlds */}
      {activeSection === 'worlds' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            Progress through themed academic environments as your level and rank increase.
          </p>

          <div className="space-y-2.5">
            {progressionWorlds.map((world) => (
              <div
                key={world.id}
                className={`rounded-2xl border p-4 flex items-center justify-between gap-3 ${
                  world.unlocked
                    ? 'bg-slate-900/90 border-slate-700/80 text-white'
                    : 'bg-slate-950/40 border-slate-800/40 text-slate-500 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-3xl">{world.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{world.name}</h3>
                      {world.unlocked ? (
                        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-800/60">
                          Unlocked
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-semibold bg-slate-800 px-1.5 py-0.2 rounded">
                          Unlocks at Lv.{world.minLevel}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{world.desc}</p>
                  </div>
                </div>

                {world.unlocked && (
                  <button
                    onClick={() => {
                      playSound('click');
                      onUpdateProfile({ avatar: { ...profile.avatar, background: world.id } });
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      profile.avatar.background === world.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    {profile.avatar.background === world.id ? 'Active' : 'Apply'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Section: Shareable Achievement Card */}
      {activeSection === 'card' && (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Celebrate milestones, streak records, and exam prep readiness with an exportable card.
          </p>

          {/* The Share Card Visual */}
          <div className="max-w-md mx-auto rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#0B0F19] border-2 border-indigo-500/50 p-6 shadow-2xl relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

            {/* Brand top tag */}
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-3 mb-4">
              <span className="font-extrabold text-white tracking-wider">TIMEGENIUS AI</span>
              <span className="text-indigo-400 font-semibold">LEVEL UP YOUR LIFE</span>
            </div>

            {/* Avatar & Player Info */}
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[2px] shadow-lg mb-3">
              <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center text-4xl">
                {profile.avatar.style === 'quantum_prodigy' ? '🧬' : '🧑‍💻'}
              </div>
            </div>

            <h2 className="text-xl font-extrabold text-white">{profile.name}</h2>
            <p className="text-xs text-cyan-400 font-semibold mt-0.5">
              Rank: {levelInfo.rank} (Level {levelInfo.currentLevel})
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Target: {profile.targetExam}
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-2 my-4 pt-3 border-t border-slate-800/80">
              <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Consistency Streak</span>
                <span className="text-base font-bold text-amber-300 mt-0.5 flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 fill-amber-400" />
                  {profile.streak} Days
                </span>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Total Experience</span>
                <span className="text-base font-bold text-cyan-300 mt-0.5 flex items-center justify-center gap-1">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  {profile.xp} XP
                </span>
              </div>
            </div>

            {/* Footer official credit */}
            <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <span>Developed by Tanmay Mangesh Kolhe · Made in India 🇮🇳</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleCopyCard}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-md shadow-indigo-600/30"
            >
              {shareCopied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{shareCopied ? 'Card Summary Copied!' : 'Copy Achievement Card'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 7. Section: Preferences & Student Settings */}
      {activeSection === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-4">
            <h2 className="text-sm font-bold text-white">Academic & Routine Settings</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Class / Grade Level
                </label>
                <input
                  type="text"
                  required
                  value={editGrade}
                  onChange={(e) => setEditGrade(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Target Examination (e.g. JEE, NEET, CBSE Boards, CET)
                </label>
                <input
                  type="text"
                  required
                  value={editExam}
                  onChange={(e) => setEditExam(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Preferred Focus Session Duration
                </label>
                <select
                  value={editFocusLength}
                  onChange={(e) => setEditFocusLength(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value={25}>25 mins (Classic Pomodoro)</option>
                  <option value={30}>30 mins (Optimal Sprint)</option>
                  <option value={45}>45 mins (Deep Problem Drill)</option>
                  <option value={60}>60 mins (Intense Exam Mock)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Wake Up Time
                </label>
                <input
                  type="time"
                  required
                  value={editWake}
                  onChange={(e) => setEditWake(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Bed Time (Protected Sleep)
                </label>
                <input
                  type="time"
                  required
                  value={editBed}
                  onChange={(e) => setEditBed(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              {savedSuccess ? (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-4 h-4" /> Preferences updated successfully!
                </span>
              ) : (
                <span className="text-xs text-slate-400">Settings persist automatically.</span>
              )}

              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 8. Official Developer Information & Credits Card */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-[#10172A] border border-slate-800 p-5 mt-6">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 text-xl">
            🇮🇳
          </div>
          <div>
            <span className="text-xs font-bold text-indigo-400 tracking-wider block">
              OFFICIAL DEVELOPER CREDIT
            </span>
            <h2 className="text-base font-bold text-white mt-0.5">
              Developed by Tanmay Mangesh Kolhe
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Maharashtra, India · Proudly Made in India 🇮🇳
            </p>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              TIMEGENIUS AI is architected to empower students preparing for school, board, and competitive examinations (JEE, NEET, CET, ICSE, CBSE) with realistic scheduling, conflict prevention, schedule rescue, and motivating RPG progression.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
