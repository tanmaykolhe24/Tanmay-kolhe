import confetti from 'canvas-confetti';
import { RankTier, UserProfile } from '../types';

export function getRankFromLevel(level: number): RankTier {
  if (level <= 5) return 'Rookie';
  if (level <= 10) return 'Explorer';
  if (level <= 20) return 'Strategist';
  if (level <= 35) return 'Elite';
  if (level <= 50) return 'Mastermind';
  return 'Legend';
}

// Level formula: Level 1 at 0 XP, Level 2 at 100 XP, Level 3 at 250 XP, etc.
export function getLevelFromXp(xp: number): number {
  if (xp <= 0) return 1;
  // Scaled curve: 1 + floor(sqrt(xp / 25))
  const lvl = Math.floor(Math.sqrt(xp / 25)) + 1;
  return Math.max(1, lvl);
}

export function getXpThresholdForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.pow(level - 1, 2) * 25;
}

export function getLevelProgress(xp: number) {
  const currentLevel = getLevelFromXp(xp);
  const currentThreshold = getXpThresholdForLevel(currentLevel);
  const nextThreshold = getXpThresholdForLevel(currentLevel + 1);
  const xpNeeded = nextThreshold - currentThreshold;
  const xpEarnedInLevel = Math.max(0, xp - currentThreshold);
  const percent = Math.min(100, Math.max(0, Math.round((xpEarnedInLevel / xpNeeded) * 100)));

  return {
    currentLevel,
    currentThreshold,
    nextThreshold,
    xpEarnedInLevel,
    xpNeeded,
    percent,
    rank: getRankFromLevel(currentLevel),
  };
}

// Web Audio API synthesizers for clean futuristic UI sound effects
export function playSound(type: 'complete' | 'level_up' | 'stage_clear' | 'click' | 'rescue' | 'chime') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } else if (type === 'complete' || type === 'chime') {
      // Pleasant dual tone chime
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
      freqs.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, ctx.currentTime + i * 0.06);
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.06);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.06 + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.06);
        osc.stop(ctx.currentTime + i * 0.06 + 0.3);
      });
    } else if (type === 'level_up' || type === 'stage_clear') {
      // Heroic triumphant arpeggio
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        const start = ctx.currentTime + idx * 0.08;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.36);
      });
    } else if (type === 'rescue') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(640, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    // Audio context may be restricted before user gesture
  }
}

export function fireCelebrationConfetti() {
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#6366F1', '#8B5CF6', '#38BDF8', '#10B981', '#F59E0B'],
    });
  } catch {
    // ignore
  }
}
