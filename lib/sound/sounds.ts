"use client";

import { create } from "zustand";

export type SoundName = "deal" | "chip" | "click" | "win" | "fold" | "check";

const STORAGE_KEY = "flush:muted";

/**
 * Lightweight WebAudio synth — no external assets needed. Each sound is a
 * short tone/noise burst tuned to feel like a subtle UI cue. Real samples can
 * be dropped into /public/sounds and swapped in here later.
 */
function synth(ctx: AudioContext, name: SoundName) {
  const now = ctx.currentTime;
  const master = ctx.createGain();
  master.gain.value = 0.9;
  master.connect(ctx.destination);

  const tone = (
    freq: number,
    dur: number,
    type: OscillatorType,
    gain: number,
    slideTo?: number,
    delay = 0
  ) => {
    const t0 = now + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  };

  const noise = (dur: number, gain: number) => {
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.value = gain;
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass";
    hp.frequency.value = 1800;
    src.connect(hp);
    hp.connect(g);
    g.connect(master);
    src.start(now);
  };

  switch (name) {
    case "deal":
      noise(0.08, 0.06);
      break;
    case "chip":
      tone(520, 0.06, "triangle", 0.06);
      tone(720, 0.05, "triangle", 0.04, undefined, 0.03);
      break;
    case "click":
      tone(380, 0.04, "square", 0.03);
      break;
    case "check":
      tone(300, 0.05, "sine", 0.04);
      break;
    case "fold":
      tone(240, 0.12, "sine", 0.04, 150);
      break;
    case "win":
      tone(523, 0.12, "triangle", 0.06);
      tone(659, 0.12, "triangle", 0.05, undefined, 0.1);
      tone(784, 0.16, "triangle", 0.05, undefined, 0.2);
      break;
  }
}

let _ctx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!_ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (AC) _ctx = new AC();
  }
  return _ctx;
}

interface SoundStore {
  muted: boolean;
  hydrated: boolean;
  hydrate: () => void;
  toggleMute: () => void;
  play: (name: SoundName) => void;
}

export const useSoundStore = create<SoundStore>((set, get) => ({
  muted: true,
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    const stored =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    set({ muted: stored != null ? stored === "1" : true, hydrated: true });
  },
  toggleMute: () => {
    const next = !get().muted;
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    }
    if (!next) getCtx()?.resume?.();
    set({ muted: next });
  },
  play: (name) => {
    if (get().muted) return;
    const c = getCtx();
    if (!c) return;
    if (c.state === "suspended") c.resume();
    try {
      synth(c, name);
    } catch {
      /* audio may be blocked until a user gesture */
    }
  },
}));
