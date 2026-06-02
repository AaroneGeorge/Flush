"use client";

import { create } from "zustand";
import {
  TableState,
  Player,
  createTable,
  startHand,
  applyAction,
  Action,
  amountToCall,
} from "@/lib/poker/engine";
import { decideBotAction, botThinkTime } from "@/lib/poker/bots";
import { estimateOdds, OddsResult } from "@/lib/poker/odds";
import { GameMode } from "@/lib/data/modes";
import { BOT_POOL } from "@/lib/data/leaderboard";
import { useSoundStore } from "@/lib/sound/sounds";
import { useUserStore } from "@/lib/store/userStore";

const HERO_ID = "hero";

interface GameStore {
  table: TableState | null;
  mode: GameMode | null;
  odds: OddsResult | null;
  isPublic: boolean;
  /** monotonically increasing token to invalidate stale bot timers */
  epoch: number;

  init: (mode: GameMode, buyIn: number, seats: number, isPublic: boolean) => void;
  hero: () => Player | null;
  heroToCall: () => number;
  act: (action: Action) => void;
  nextHand: () => void;
  reset: () => void;

  // internal
  _tick: () => void;
  _recomputeOdds: () => void;
}

function sound() {
  return useSoundStore.getState();
}

export const useGameStore = create<GameStore>((set, get) => ({
  table: null,
  mode: null,
  odds: null,
  isPublic: true,
  epoch: 0,

  init: (mode, buyIn, seats, isPublic) => {
    const user = useUserStore.getState();
    const pool = [...BOT_POOL].sort(() => Math.random() - 0.5);
    const opponents = Math.max(1, seats - 1);

    const players = [
      {
        id: HERO_ID,
        name: user.username,
        avatar: user.avatar,
        stack: buyIn,
        isHero: true,
        sittingOut: false,
      },
      ...Array.from({ length: opponents }).map((_, i) => {
        const b = pool[i % pool.length];
        // Vary bot stacks a little for visual interest.
        const variance = 0.6 + Math.random() * 0.8;
        return {
          id: `bot-${i}`,
          name: b.name,
          avatar: b.avatar,
          stack: Math.round(buyIn * variance),
          isHero: false,
          sittingOut: false,
        };
      }),
    ];

    const table = createTable(players, mode.smallBlind, mode.bigBlind);
    set({ table, mode, isPublic, epoch: get().epoch + 1, odds: null });
    // Kick off the first hand shortly after mount.
    setTimeout(() => get().nextHand(), 400);
  },

  hero: () => get().table?.players.find((p) => p.id === HERO_ID) ?? null,

  heroToCall: () => {
    const t = get().table;
    if (!t) return 0;
    if (t.players[t.currentIndex]?.id !== HERO_ID) return 0;
    return amountToCall(t);
  },

  act: (action) => {
    const t = get().table;
    if (!t) return;
    const cur = t.players[t.currentIndex];
    if (!cur || cur.id !== HERO_ID) return;

    playForAction(action);
    const next = applyAction(t, HERO_ID, action);
    set({ table: next });
    get()._recomputeOdds();
    get()._tick();
  },

  nextHand: () => {
    const t = get().table;
    if (!t) return;
    const live = t.players.filter((p) => p.stack > 0 || !p.sittingOut);
    if (live.length < 2) return;
    const next = startHand(t);
    sound().play("deal");
    set({ table: next, epoch: get().epoch + 1 });
    get()._recomputeOdds();
    get()._tick();
  },

  reset: () => set({ table: null, mode: null, odds: null }),

  _recomputeOdds: () => {
    const t = get().table;
    if (!t) return set({ odds: null });
    const hero = t.players.find((p) => p.id === HERO_ID);
    if (!hero || hero.hole.length < 2 || hero.folded) {
      return set({ odds: null });
    }
    const opponents = t.players.filter(
      (p) => !p.folded && !p.sittingOut && p.id !== HERO_ID
    ).length;
    const odds = estimateOdds(hero.hole, t.board, opponents, 1000);
    set({ odds });
  },

  // Drive bot turns + auto-advance after showdown.
  _tick: () => {
    const t = get().table;
    if (!t) return;
    const epoch = get().epoch;

    if (t.stage === "showdown") {
      // Record the hand to the user profile once, then deal again.
      const hero = t.players.find((p) => p.id === HERO_ID);
      const won = !!t.winners?.some((w) => w.id === HERO_ID);
      if (hero) {
        useUserStore.getState().recordHand(won, won ? 25 : 8);
      }
      sound().play(won ? "win" : "chip");
      setTimeout(() => {
        if (get().epoch !== epoch) return;
        get().nextHand();
      }, 3200);
      return;
    }

    if (t.stage === "idle") return;

    const cur = t.players[t.currentIndex];
    if (!cur || cur.id === HERO_ID) return; // hero's turn -> wait for input

    // Bot acts after a think delay.
    setTimeout(() => {
      const cur2 = get().table;
      if (!cur2 || get().epoch !== epoch) return;
      const actor = cur2.players[cur2.currentIndex];
      if (!actor || actor.id === HERO_ID) return;
      const action = decideBotAction(cur2);
      playForAction(action);
      const next = applyAction(cur2, actor.id, action);
      set({ table: next });
      get()._recomputeOdds();
      get()._tick();
    }, botThinkTime());
  },
}));

function playForAction(action: Action) {
  const s = sound();
  switch (action.type) {
    case "fold":
      s.play("fold");
      break;
    case "check":
      s.play("check");
      break;
    case "call":
    case "raise":
      s.play("chip");
      break;
  }
}
