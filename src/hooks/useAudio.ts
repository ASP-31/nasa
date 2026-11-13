import { useCallback, useRef, useState } from 'react';
import { readLocalStorage, writeLocalStorage } from './useLocalStorage';

// ─────────────────────────────────────────────────────────────
// Procedural sound effects via the Web Audio API — no audio
// assets needed. Fully optional and muted by user preference.
// ─────────────────────────────────────────────────────────────

export type SoundName = 'click' | 'alert' | 'event' | 'success' | 'failure' | 'advance';

interface ToneSpec {
  freq: number;
  duration: number;
  type: OscillatorType;
  gain: number;
  delay: number;
}

const SOUND_TABLE: Record<SoundName, ToneSpec[]> = {
  click: [{ freq: 520, duration: 0.06, type: 'triangle', gain: 0.08, delay: 0 }],
  advance: [
    { freq: 330, duration: 0.09, type: 'sine', gain: 0.09, delay: 0 },
    { freq: 440, duration: 0.09, type: 'sine', gain: 0.09, delay: 0.07 },
    { freq: 550, duration: 0.12, type: 'sine', gain: 0.09, delay: 0.14 },
  ],
  alert: [{ freq: 720, duration: 0.16, type: 'square', gain: 0.06, delay: 0 }],
  event: [
    { freq: 620, duration: 0.12, type: 'sawtooth', gain: 0.05, delay: 0 },
    { freq: 480, duration: 0.14, type: 'sawtooth', gain: 0.05, delay: 0.1 },
  ],
  success: [
    { freq: 523, duration: 0.12, type: 'sine', gain: 0.1, delay: 0 },
    { freq: 659, duration: 0.12, type: 'sine', gain: 0.1, delay: 0.1 },
    { freq: 784, duration: 0.2, type: 'sine', gain: 0.1, delay: 0.2 },
  ],
  failure: [
    { freq: 392, duration: 0.18, type: 'sine', gain: 0.1, delay: 0 },
    { freq: 294, duration: 0.22, type: 'sine', gain: 0.1, delay: 0.16 },
    { freq: 196, duration: 0.3, type: 'sine', gain: 0.1, delay: 0.34 },
  ],
};

export function useAudio() {
  const [muted, setMuted] = useState<boolean>(() => readLocalStorage<boolean>('mars-outpost-muted') ?? false);
  const contextRef = useRef<AudioContext | null>(null);

  const ensureContext = useCallback((): AudioContext | null => {
    if (contextRef.current) return contextRef.current;
    try {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      contextRef.current = new Ctor();
      return contextRef.current;
    } catch {
      return null;
    }
  }, []);

  const play = useCallback(
    (name: SoundName) => {
      if (muted) return;
      const ctx = ensureContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') void ctx.resume();
      for (const tone of SOUND_TABLE[name]) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = tone.type;
        osc.frequency.value = tone.freq;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime + tone.delay);
        gain.gain.exponentialRampToValueAtTime(tone.gain, ctx.currentTime + tone.delay + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + tone.delay + tone.duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + tone.delay);
        osc.stop(ctx.currentTime + tone.delay + tone.duration + 0.02);
      }
    },
    [ensureContext, muted],
  );

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      writeLocalStorage('mars-outpost-muted', !prev);
      return !prev;
    });
  }, []);

  return { play, muted, toggleMute };
}
