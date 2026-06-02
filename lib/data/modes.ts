export interface GameMode {
  id: string;
  /** Small / big blind. */
  smallBlind: number;
  bigBlind: number;
  minBuyIn: number;
  maxBuyIn: number;
  /** Visual theme accent for the mode card. */
  tint: string;
  emoji: string;
  name: string;
}

/** The five buy-in tiers from the brief. Stakes = SB/BB. */
export const MODES: GameMode[] = [
  {
    id: "micro",
    smallBlind: 1,
    bigBlind: 2,
    minBuyIn: 10,
    maxBuyIn: 50,
    tint: "#A8E6B0",
    emoji: "🌱",
    name: "Micro",
  },
  {
    id: "low",
    smallBlind: 2,
    bigBlind: 4,
    minBuyIn: 40,
    maxBuyIn: 200,
    tint: "#9FD8F2",
    emoji: "🌊",
    name: "Low",
  },
  {
    id: "mid",
    smallBlind: 5,
    bigBlind: 10,
    minBuyIn: 200,
    maxBuyIn: 1000,
    tint: "#F2C66D",
    emoji: "🔥",
    name: "Mid",
  },
  {
    id: "high",
    smallBlind: 20,
    bigBlind: 40,
    minBuyIn: 2000,
    maxBuyIn: 10000,
    tint: "#C9A8F2",
    emoji: "💎",
    name: "High",
  },
  {
    id: "nosebleed",
    smallBlind: 200,
    bigBlind: 400,
    minBuyIn: 20000,
    maxBuyIn: 100000,
    tint: "#F26D6D",
    emoji: "👑",
    name: "Nosebleed",
  },
];

export function modeById(id: string): GameMode {
  return MODES.find((m) => m.id === id) ?? MODES[0];
}
