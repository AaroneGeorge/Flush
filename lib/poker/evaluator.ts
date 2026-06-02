import {
  Card,
  HandCategory,
  HandResult,
  CATEGORY_LABEL,
  Suit,
} from "./types";

/**
 * Evaluate the best 5-card hand out of any number of cards (5, 6, or 7).
 * Returns a category + a comparable numeric score.
 *
 * Score encoding: category in the high digits, then up to 5 tiebreak ranks
 * packed in base-16 (ranks are 2..14 so they fit in a nibble each).
 */
export function evaluate(cards: Card[]): HandResult {
  if (cards.length < 5) {
    throw new Error("evaluate requires at least 5 cards");
  }

  const ranks = cards.map((c) => c.rank).sort((a, b) => b - a);
  const suits = cards.map((c) => c.suit);

  // Count occurrences of each rank.
  const rankCount = new Map<number, number>();
  for (const r of ranks) rankCount.set(r, (rankCount.get(r) ?? 0) + 1);

  // Count suits to detect flush.
  const suitCount = new Map<Suit, Card[]>();
  for (const c of cards) {
    const arr = suitCount.get(c.suit) ?? [];
    arr.push(c);
    suitCount.set(c.suit, arr);
  }

  let flushSuit: Suit | null = null;
  for (const [s, arr] of suitCount) {
    if (arr.length >= 5) flushSuit = s;
  }

  // Straight detection helper over a set of ranks.
  const straightHigh = (rs: number[]): number | null => {
    const uniq = Array.from(new Set(rs)).sort((a, b) => b - a);
    // Ace-low straight (A-2-3-4-5): treat ace as 1 as well.
    if (uniq.includes(14)) uniq.push(1);
    let run = 1;
    for (let i = 1; i < uniq.length; i++) {
      if (uniq[i] === uniq[i - 1] - 1) {
        run++;
        if (run >= 5) return uniq[i] + 4; // bottom of the run + 4 = top
      } else {
        run = 1;
      }
    }
    return null;
  };

  // Straight flush / royal flush.
  if (flushSuit) {
    const flushRanks = suitCount.get(flushSuit)!.map((c) => c.rank);
    const sfHigh = straightHigh(flushRanks);
    if (sfHigh != null) {
      if (sfHigh === 14) {
        return result(HandCategory.RoyalFlush, [14]);
      }
      return result(HandCategory.StraightFlush, [sfHigh]);
    }
  }

  // Group ranks by count, then by rank.
  const groups = Array.from(rankCount.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return b[0] - a[0];
  });

  const counts = groups.map((g) => g[1]);

  // Four of a kind.
  if (counts[0] === 4) {
    const quad = groups[0][0];
    const kicker = ranks.find((r) => r !== quad)!;
    return result(HandCategory.FourOfAKind, [quad, kicker]);
  }

  // Full house (trips + pair, or two trips).
  if (counts[0] === 3 && (counts[1] === 2 || counts[1] === 3)) {
    const trips = groups[0][0];
    const pair = groups[1][0];
    return result(HandCategory.FullHouse, [trips, pair]);
  }

  // Flush.
  if (flushSuit) {
    const top5 = suitCount
      .get(flushSuit)!
      .map((c) => c.rank)
      .sort((a, b) => b - a)
      .slice(0, 5);
    return result(HandCategory.Flush, top5);
  }

  // Straight.
  const sHigh = straightHigh(ranks);
  if (sHigh != null) {
    return result(HandCategory.Straight, [sHigh]);
  }

  // Three of a kind.
  if (counts[0] === 3) {
    const trips = groups[0][0];
    const kickers = ranks.filter((r) => r !== trips).slice(0, 2);
    return result(HandCategory.ThreeOfAKind, [trips, ...kickers]);
  }

  // Two pair.
  if (counts[0] === 2 && counts[1] === 2) {
    const high = groups[0][0];
    const low = groups[1][0];
    const kicker = ranks.find((r) => r !== high && r !== low)!;
    return result(HandCategory.TwoPair, [high, low, kicker]);
  }

  // One pair.
  if (counts[0] === 2) {
    const pair = groups[0][0];
    const kickers = ranks.filter((r) => r !== pair).slice(0, 3);
    return result(HandCategory.Pair, [pair, ...kickers]);
  }

  // High card.
  return result(HandCategory.HighCard, ranks.slice(0, 5));
}

function result(category: HandCategory, tiebreaks: number[]): HandResult {
  let score = category;
  for (let i = 0; i < 5; i++) {
    score = score * 16 + (tiebreaks[i] ?? 0);
  }
  return {
    category,
    label: CATEGORY_LABEL[category],
    score,
  };
}

/** Compare two hands. >0 if a wins, <0 if b wins, 0 tie. */
export function compareHands(a: Card[], b: Card[]): number {
  return evaluate(a).score - evaluate(b).score;
}
