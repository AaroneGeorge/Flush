import { Action, TableState, amountToCall } from "./engine";
import { estimateOdds } from "./odds";

/**
 * Heuristic bot. Estimates equity vs the field, then folds / calls / raises
 * with a little randomness so the table feels alive. Not meant to be tough —
 * this is a UI demo opponent.
 */
export function decideBotAction(s: TableState): Action {
  const p = s.players[s.currentIndex];
  if (!p) return { type: "check" };

  const opponents = s.players.filter(
    (x) => !x.folded && !x.sittingOut && x.id !== p.id
  ).length;

  const toCall = amountToCall(s);
  // Cheaper sim for bots — they act often.
  const { win } = estimateOdds(p.hole, s.board, opponents, 400);
  const equity = win / 100;

  const potOdds = toCall > 0 ? toCall / (s.pot + toCall) : 0;
  const jitter = Math.random() * 0.12 - 0.06;
  const adjusted = equity + jitter;

  // No bet to face: check, or value-bet with a strong hand.
  if (toCall === 0) {
    if (adjusted > 0.62 && Math.random() < 0.55) {
      const raiseTo = Math.min(
        p.bet + p.stack,
        s.currentBet + Math.max(s.bigBlind, Math.round(s.pot * 0.6))
      );
      return { type: "raise", amount: raiseTo };
    }
    return { type: "check" };
  }

  // Facing a bet.
  if (adjusted < potOdds - 0.02) {
    // Occasionally float small bets.
    if (toCall <= s.bigBlind && Math.random() < 0.4) return { type: "call" };
    return { type: "fold" };
  }

  // Strong: raise sometimes.
  if (adjusted > 0.72 && Math.random() < 0.5) {
    const raiseTo = Math.min(
      p.bet + p.stack,
      s.currentBet + Math.max(s.minRaise, Math.round((s.pot + toCall) * 0.7))
    );
    return { type: "raise", amount: raiseTo };
  }

  return { type: "call" };
}

/** Randomized think-time in ms so bots don't act in lockstep. */
export function botThinkTime(): number {
  return 700 + Math.random() * 1100;
}
