import { Card } from "./types";
import { freshDeck, cardKey } from "./deck";
import { evaluate } from "./evaluator";

export interface OddsResult {
  /** Probability the hero wins (or ties) at showdown, 0..100. */
  win: number;
  /** Probability the hero's *current* best made-hand label holds or improves, 0..100. */
  made: number;
  /** The hero's current best made-hand label given known cards. */
  label: string;
}

/**
 * Monte-Carlo equity estimate. Capped iterations keep it snappy on mobile.
 * hero: 2 hole cards. board: 0..5 community cards. opponents: count still in.
 */
export function estimateOdds(
  hero: Card[],
  board: Card[],
  opponents: number,
  iterations = 1200
): OddsResult {
  const known = [...hero, ...board];
  const knownSet = new Set(known.map(cardKey));
  const remaining = freshDeck().filter((c) => !knownSet.has(cardKey(c)));

  // Current made hand (needs >=5 cards to evaluate; pre-flop fall back to hole).
  let label = "High Card";
  if (known.length >= 5) {
    label = evaluate(known).label;
  } else if (hero.length === 2 && hero[0].rank === hero[1].rank) {
    label = "Pair";
  }

  if (opponents <= 0) {
    return { win: 100, made: 100, label };
  }

  let wins = 0;
  let madeHits = 0;

  for (let it = 0; it < iterations; it++) {
    // Fisher-Yates partial shuffle of remaining for this sample.
    const pool = remaining.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    let idx = 0;
    const fullBoard = board.slice();
    while (fullBoard.length < 5) fullBoard.push(pool[idx++]);

    const heroBest = evaluate([...hero, ...fullBoard]);

    // Track "made hand or better than high card" as a rough draw indicator.
    if (heroBest.category >= 1) madeHits++;

    let heroWins = true;
    let tie = false;
    for (let o = 0; o < opponents; o++) {
      const oppHole = [pool[idx++], pool[idx++]];
      const oppBest = evaluate([...oppHole, ...fullBoard]);
      if (oppBest.score > heroBest.score) {
        heroWins = false;
        break;
      }
      if (oppBest.score === heroBest.score) tie = true;
    }
    if (heroWins) wins += tie ? 0.5 : 1;
  }

  return {
    win: (wins / iterations) * 100,
    made: (madeHits / iterations) * 100,
    label,
  };
}
