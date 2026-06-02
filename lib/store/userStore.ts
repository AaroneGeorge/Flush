"use client";

import { create } from "zustand";
import { avatarFor } from "@/lib/data/avatars";

/**
 * Mocked user / wallet state.
 *
 * SEAM FOR SOLANA: `connectWallet` and `walletAddress` are placeholders. A
 * later pass should replace `connectWallet` with a `@solana/wallet-standard`
 * connection and source `balance` from the on-chain token account. The rest of
 * the UI only reads these fields, so swapping the implementation is isolated.
 */
interface UserStore {
  hydrated: boolean;
  username: string;
  avatar: string;
  balance: number; // mock chip balance shown on home
  xp: number;
  level: number;
  handsPlayed: number;
  handsWon: number;
  walletAddress: string | null;

  hydrate: () => void;
  setUsername: (name: string) => void;
  setAvatar: (avatar: string) => void;
  addBalance: (delta: number) => void;
  recordHand: (won: boolean, xpGain: number) => void;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

const STORAGE_KEY = "flush:user";

interface Persisted {
  username: string;
  avatar: string;
  balance: number;
  xp: number;
  handsPlayed: number;
  handsWon: number;
}

function load(): Partial<Persisted> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persist(s: UserStore) {
  if (typeof window === "undefined") return;
  const data: Persisted = {
    username: s.username,
    avatar: s.avatar,
    balance: s.balance,
    xp: s.xp,
    handsPlayed: s.handsPlayed,
    handsWon: s.handsWon,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function levelFromXp(xp: number): number {
  return Math.floor(xp / 500) + 1;
}

export const useUserStore = create<UserStore>((set, get) => ({
  hydrated: false,
  username: "you",
  avatar: avatarFor("you"),
  balance: 126,
  xp: 0,
  level: 1,
  handsPlayed: 0,
  handsWon: 0,
  walletAddress: null,

  hydrate: () => {
    if (get().hydrated) return;
    const loaded = load();
    set({
      ...loaded,
      level: levelFromXp(loaded.xp ?? 0),
      hydrated: true,
    });
  },

  setUsername: (username) => {
    set({ username });
    persist(get());
  },
  setAvatar: (avatar) => {
    set({ avatar });
    persist(get());
  },
  addBalance: (delta) => {
    set({ balance: Math.max(0, get().balance + delta) });
    persist(get());
  },
  recordHand: (won, xpGain) => {
    const xp = get().xp + xpGain;
    set({
      handsPlayed: get().handsPlayed + 1,
      handsWon: get().handsWon + (won ? 1 : 0),
      xp,
      level: levelFromXp(xp),
    });
    persist(get());
  },

  // SEAM: replace with real wallet-standard connect.
  connectWallet: async () => {
    await new Promise((r) => setTimeout(r, 600));
    const fake =
      "Fush" + Math.floor(Math.random() * 1e6).toString(36) + "…sol";
    set({ walletAddress: fake });
  },
  disconnectWallet: () => set({ walletAddress: null }),
}));
