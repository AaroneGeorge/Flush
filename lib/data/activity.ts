import { MODES } from "./modes";

export type ActivityResult = "win" | "loss";

export interface ActivityEntry {
  id: string;
  /** Mode tier id (micro/low/mid/high/nosebleed). */
  modeId: string;
  result: ActivityResult;
  /** Net chips for the hand (positive on win, negative on loss). */
  delta: number;
  /** Best 5-card hand made, e.g. "Full House". */
  hand: string;
  /** Number of players dealt into the hand. */
  players: number;
  /** Final pot size. */
  pot: number;
  /** Human "time ago" label. */
  when: string;
  /** Coarse bucket for section grouping. */
  day: "Today" | "Yesterday" | "Earlier";
}

function tint(modeId: string): string {
  return MODES.find((m) => m.id === modeId)?.tint ?? "#A8E6B0";
}

function stakes(modeId: string): string {
  const m = MODES.find((x) => x.id === modeId);
  return m ? `${m.smallBlind}/${m.bigBlind}` : "1/2";
}

export const ACTIVITY_META = { tint, stakes };

/** Mocked recent-hand feed used to populate the Activity screen. */
export const ACTIVITY: ActivityEntry[] = [
  { id: "h1", modeId: "mid", result: "win", delta: 1840, hand: "Full House", players: 6, pot: 3960, when: "12m ago", day: "Today" },
  { id: "h2", modeId: "mid", result: "loss", delta: -510, hand: "Two Pair", players: 5, pot: 1220, when: "34m ago", day: "Today" },
  { id: "h3", modeId: "low", result: "win", delta: 268, hand: "Flush", players: 4, pot: 612, when: "1h ago", day: "Today" },
  { id: "h4", modeId: "high", result: "win", delta: 6450, hand: "Straight", players: 6, pot: 13900, when: "3h ago", day: "Today" },
  { id: "h5", modeId: "low", result: "loss", delta: -140, hand: "Pair", players: 3, pot: 360, when: "5h ago", day: "Today" },
  { id: "h6", modeId: "micro", result: "win", delta: 44, hand: "Three of a Kind", players: 5, pot: 96, when: "Yesterday, 9:14 PM", day: "Yesterday" },
  { id: "h7", modeId: "high", result: "loss", delta: -2100, hand: "High Card", players: 6, pot: 4800, when: "Yesterday, 8:02 PM", day: "Yesterday" },
  { id: "h8", modeId: "mid", result: "win", delta: 920, hand: "Flush", players: 4, pot: 2040, when: "Yesterday, 6:48 PM", day: "Yesterday" },
  { id: "h9", modeId: "nosebleed", result: "win", delta: 38500, hand: "Four of a Kind", players: 5, pot: 81000, when: "Mon, 11:20 PM", day: "Earlier" },
  { id: "h10", modeId: "low", result: "loss", delta: -88, hand: "Two Pair", players: 4, pot: 244, when: "Mon, 7:33 PM", day: "Earlier" },
  { id: "h11", modeId: "micro", result: "win", delta: 30, hand: "Straight", players: 6, pot: 72, when: "Sun, 10:05 PM", day: "Earlier" },
];

export interface ActivitySummary {
  net7d: number;
  hands: number;
  wins: number;
  winRate: number;
  biggestPot: number;
}

export const ACTIVITY_SUMMARY: ActivitySummary = (() => {
  const net7d = ACTIVITY.reduce((s, e) => s + e.delta, 0);
  const hands = ACTIVITY.length;
  const wins = ACTIVITY.filter((e) => e.result === "win").length;
  return {
    net7d,
    hands,
    wins,
    winRate: Math.round((wins / hands) * 100),
    biggestPot: Math.max(...ACTIVITY.map((e) => e.pot)),
  };
})();
