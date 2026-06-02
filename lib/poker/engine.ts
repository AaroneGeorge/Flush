import { Card } from "./types";
import { freshDeck, shuffle } from "./deck";
import { evaluate } from "./evaluator";

export type Stage =
  | "idle"
  | "preflop"
  | "flop"
  | "turn"
  | "river"
  | "showdown";

export interface Player {
  id: string;
  name: string;
  avatar: string;
  stack: number;
  bet: number; // committed this betting round
  totalBet: number; // committed across the whole hand (for side pots)
  folded: boolean;
  allIn: boolean;
  isHero: boolean;
  hole: Card[];
  acted: boolean; // has acted since the last raise this round
  sittingOut: boolean;
  lastAction?: string; // for the little action bubble ("Call", "Raise 4"...)
}

export interface Winner {
  id: string;
  amount: number;
  label: string;
}

export interface TableState {
  players: Player[];
  deck: Card[];
  board: Card[];
  pot: number;
  stage: Stage;
  dealerIndex: number;
  currentIndex: number;
  currentBet: number;
  minRaise: number;
  smallBlind: number;
  bigBlind: number;
  winners: Winner[] | null;
  handNumber: number;
}

export function createTable(
  players: Omit<
    Player,
    | "bet"
    | "totalBet"
    | "folded"
    | "allIn"
    | "hole"
    | "acted"
    | "lastAction"
  >[],
  smallBlind: number,
  bigBlind: number
): TableState {
  return {
    players: players.map((p) => ({
      ...p,
      bet: 0,
      totalBet: 0,
      folded: false,
      allIn: false,
      hole: [],
      acted: false,
    })),
    deck: [],
    board: [],
    pot: 0,
    stage: "idle",
    dealerIndex: 0,
    currentIndex: 0,
    currentBet: 0,
    minRaise: bigBlind,
    smallBlind,
    bigBlind,
    winners: null,
    handNumber: 0,
  };
}

function activePlayers(s: TableState): Player[] {
  return s.players.filter((p) => !p.folded && !p.sittingOut);
}

function nextOccupied(s: TableState, from: number): number {
  const n = s.players.length;
  for (let i = 1; i <= n; i++) {
    const idx = (from + i) % n;
    if (!s.players[idx].sittingOut && s.players[idx].stack >= 0) return idx;
  }
  return from;
}

/** Begin a fresh hand: move button, deal, post blinds. */
export function startHand(prev: TableState, seed?: number): TableState {
  const s = clone(prev);
  // Reset per-hand fields; bust players sit out.
  for (const p of s.players) {
    p.bet = 0;
    p.totalBet = 0;
    p.folded = false;
    p.allIn = false;
    p.hole = [];
    p.acted = false;
    p.lastAction = undefined;
    if (p.stack <= 0) p.sittingOut = true;
  }

  const live = s.players.filter((p) => !p.sittingOut);
  if (live.length < 2) {
    s.stage = "idle";
    return s;
  }

  s.handNumber += 1;
  s.deck = shuffle(freshDeck(), seed);
  s.board = [];
  s.pot = 0;
  s.winners = null;
  s.currentBet = 0;
  s.minRaise = s.bigBlind;
  s.stage = "preflop";

  // Move the dealer button to the next occupied seat.
  s.dealerIndex = nextOccupied(s, s.dealerIndex);

  // Ordered live seats, starting left of the button.
  const order: number[] = [];
  let cursor = s.dealerIndex;
  for (let i = 0; i < s.players.length; i++) {
    cursor = nextOccupied(s, cursor);
    if (!s.players[cursor].sittingOut && !order.includes(cursor)) {
      order.push(cursor);
    }
  }

  // Deal two hole cards round-robin.
  for (let round = 0; round < 2; round++) {
    for (const idx of order) {
      s.players[idx].hole.push(s.deck.pop()!);
    }
  }

  // Blinds. Heads-up: button is small blind.
  const sbIndex =
    live.length === 2 ? s.dealerIndex : nextOccupied(s, s.dealerIndex);
  const bbIndex = nextOccupied(s, sbIndex);

  postBlind(s, sbIndex, s.smallBlind, "SB");
  postBlind(s, bbIndex, s.bigBlind, "BB");
  s.currentBet = s.bigBlind;

  // First to act preflop = left of big blind.
  s.currentIndex = nextToAct(s, bbIndex);
  return s;
}

function postBlind(
  s: TableState,
  idx: number,
  amount: number,
  _label: string
) {
  const p = s.players[idx];
  const pay = Math.min(amount, p.stack);
  p.stack -= pay;
  p.bet += pay;
  p.totalBet += pay;
  if (p.stack === 0) p.allIn = true;
}

export type ActionType = "fold" | "check" | "call" | "raise";

export interface Action {
  type: ActionType;
  /** For raise: the total amount the player's bet becomes ("raise to"). */
  amount?: number;
}

/** Apply a player action. Returns a new state (auto-advances stage if round done). */
export function applyAction(
  prev: TableState,
  playerId: string,
  action: Action
): TableState {
  const s = clone(prev);
  const idx = s.players.findIndex((p) => p.id === playerId);
  if (idx < 0 || idx !== s.currentIndex) return prev;
  const p = s.players[idx];
  if (p.folded || p.allIn || p.sittingOut) return prev;

  switch (action.type) {
    case "fold": {
      p.folded = true;
      p.acted = true;
      p.lastAction = "Fold";
      break;
    }
    case "check": {
      if (p.bet < s.currentBet) return prev; // illegal
      p.acted = true;
      p.lastAction = "Check";
      break;
    }
    case "call": {
      const toCall = Math.min(s.currentBet - p.bet, p.stack);
      p.stack -= toCall;
      p.bet += toCall;
      p.totalBet += toCall;
      if (p.stack === 0) p.allIn = true;
      p.acted = true;
      p.lastAction = toCall === 0 ? "Check" : "Call";
      break;
    }
    case "raise": {
      const target = Math.min(action.amount ?? 0, p.bet + p.stack);
      const minTarget = s.currentBet + s.minRaise;
      // Allow short all-in raises; otherwise enforce min raise.
      const isAllIn = target === p.bet + p.stack;
      if (!isAllIn && target < minTarget) return prev;
      const add = target - p.bet;
      p.stack -= add;
      p.bet = target;
      p.totalBet += add;
      const raiseSize = target - s.currentBet;
      if (raiseSize >= s.minRaise) s.minRaise = raiseSize;
      s.currentBet = target;
      if (p.stack === 0) p.allIn = true;
      // Everyone else must act again.
      for (const o of s.players) {
        if (o.id !== p.id && !o.folded && !o.allIn && !o.sittingOut) {
          o.acted = false;
        }
      }
      p.acted = true;
      p.lastAction = `Raise ${target}`;
      break;
    }
  }

  // Only one player left -> award pot immediately.
  if (activePlayers(s).length === 1) {
    return finishHand(s);
  }

  // Advance to next actor or close the round.
  const next = nextToAct(s, idx);
  if (next === -1) {
    return advanceStage(s);
  }
  s.currentIndex = next;
  return s;
}

/** Index of the next player who still needs to act, or -1 if the round is closed. */
function nextToAct(s: TableState, from: number): number {
  const n = s.players.length;
  for (let i = 1; i <= n; i++) {
    const idx = (from + i) % n;
    const p = s.players[idx];
    if (p.folded || p.allIn || p.sittingOut) continue;
    if (!p.acted || p.bet < s.currentBet) return idx;
  }
  return -1;
}

/** Collect bets into the pot and deal the next street (or go to showdown). */
function advanceStage(prev: TableState): TableState {
  const s = clone(prev);
  // Sweep this round's bets into the pot.
  for (const p of s.players) {
    s.pot += p.bet;
    p.bet = 0;
    p.acted = false;
    p.lastAction = undefined;
  }
  s.currentBet = 0;
  s.minRaise = s.bigBlind;

  // If only one or zero can still bet, run out the board to showdown.
  const canAct = s.players.filter(
    (p) => !p.folded && !p.allIn && !p.sittingOut
  );

  const dealTo = (n: number) => {
    while (s.board.length < n) s.board.push(s.deck.pop()!);
  };

  const goShowdown = () => finishHand(s);

  switch (s.stage) {
    case "preflop":
      s.stage = "flop";
      dealTo(3);
      break;
    case "flop":
      s.stage = "turn";
      dealTo(4);
      break;
    case "turn":
      s.stage = "river";
      dealTo(5);
      break;
    case "river":
      return goShowdown();
    default:
      return goShowdown();
  }

  // If nobody can act anymore, keep dealing until the river then showdown.
  if (canAct.length <= 1) {
    dealTo(5);
    return goShowdown();
  }

  s.currentIndex = nextToAct(s, s.dealerIndex);
  if (s.currentIndex === -1) {
    // No one needs to act (all checked-around edge) -> advance again.
    return advanceStage(s);
  }
  return s;
}

/** Award the pot using side-pot logic and reveal the result. */
function finishHand(prev: TableState): TableState {
  const s = clone(prev);
  // Sweep any outstanding bets.
  for (const p of s.players) {
    s.pot += p.bet;
    p.bet = 0;
  }

  const contenders = s.players.filter((p) => !p.folded && !p.sittingOut);

  // Single remaining player wins everything.
  if (contenders.length === 1) {
    const w = contenders[0];
    w.stack += s.pot;
    s.winners = [{ id: w.id, amount: s.pot, label: "Last standing" }];
    s.pot = 0;
    s.stage = "showdown";
    return s;
  }

  // Build side pots from total contributions.
  const contribs = s.players
    .filter((p) => p.totalBet > 0)
    .map((p) => ({ id: p.id, amount: p.totalBet, folded: p.folded }));

  const pots: { value: number; eligible: string[] }[] = [];
  let remaining = contribs.filter((c) => c.amount > 0);
  while (remaining.length > 0) {
    const minAmt = Math.min(...remaining.map((c) => c.amount));
    let value = 0;
    const eligible: string[] = [];
    for (const c of remaining) {
      value += minAmt;
      c.amount -= minAmt;
      if (!c.folded) eligible.push(c.id);
    }
    pots.push({ value, eligible });
    remaining = remaining.filter((c) => c.amount > 0);
  }

  const winnerMap = new Map<string, number>();
  let topLabel = "";
  for (const pot of pots) {
    const ranked = pot.eligible
      .map((id) => {
        const pl = s.players.find((p) => p.id === id)!;
        return { id, res: evaluate([...pl.hole, ...s.board]) };
      })
      .sort((a, b) => b.res.score - a.res.score);
    if (ranked.length === 0) continue;
    const best = ranked[0].res.score;
    const winners = ranked.filter((r) => r.res.score === best);
    const share = Math.floor(pot.value / winners.length);
    let remainder = pot.value - share * winners.length;
    for (const w of winners) {
      const pl = s.players.find((p) => p.id === w.id)!;
      let amt = share;
      if (remainder > 0) {
        amt += 1;
        remainder -= 1;
      }
      pl.stack += amt;
      winnerMap.set(w.id, (winnerMap.get(w.id) ?? 0) + amt);
      topLabel = w.res.label;
    }
  }

  s.winners = Array.from(winnerMap.entries()).map(([id, amount]) => ({
    id,
    amount,
    label: s.players.find((p) => p.id === id)!.folded ? "" : topLabel,
  }));
  s.pot = 0;
  s.stage = "showdown";
  return s;
}

/** Amount the current player must put in to call. */
export function amountToCall(s: TableState): number {
  const p = s.players[s.currentIndex];
  if (!p) return 0;
  return Math.max(0, s.currentBet - p.bet);
}

function clone(s: TableState): TableState {
  return {
    ...s,
    players: s.players.map((p) => ({ ...p, hole: [...p.hole] })),
    deck: [...s.deck],
    board: [...s.board],
    winners: s.winners ? s.winners.map((w) => ({ ...w })) : null,
  };
}
