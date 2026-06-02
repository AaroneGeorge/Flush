"use client";

import { Sheet } from "@/components/layout/Sheet";
import { PlayingCard } from "./PlayingCard";
import { Card } from "@/lib/poker/types";

interface Ranking {
  name: string;
  desc: string;
  cards: Card[];
}

const C = (rank: number, suit: Card["suit"]): Card => ({ rank, suit });

const RANKINGS: Ranking[] = [
  { name: "Royal Flush", desc: "Highest-ranking straight flush", cards: [C(14, "h"), C(13, "h"), C(12, "h"), C(11, "h"), C(10, "h")] },
  { name: "Straight Flush", desc: "5 same-suit cards in sequence", cards: [C(10, "c"), C(9, "c"), C(8, "c"), C(7, "c"), C(6, "c")] },
  { name: "Four of a Kind", desc: "4 cards of the same rank", cards: [C(8, "s"), C(8, "h"), C(8, "d"), C(8, "c"), C(3, "s")] },
  { name: "Full House", desc: "Three of a kind with a pair", cards: [C(14, "h"), C(14, "s"), C(14, "d"), C(10, "h"), C(10, "c")] },
  { name: "Flush", desc: "5 cards of the same suit", cards: [C(13, "s"), C(11, "s"), C(8, "s"), C(6, "s"), C(3, "s")] },
  { name: "Straight", desc: "5 cards in sequence", cards: [C(10, "h"), C(9, "c"), C(8, "d"), C(7, "s"), C(6, "h")] },
  { name: "Three of a Kind", desc: "3 cards of the same rank", cards: [C(7, "s"), C(7, "h"), C(7, "d"), C(13, "c"), C(4, "s")] },
  { name: "Two Pair", desc: "2 cards of the same rank twice", cards: [C(11, "s"), C(11, "d"), C(4, "h"), C(4, "c"), C(9, "s")] },
  { name: "Pair", desc: "2 cards of the same rank", cards: [C(13, "s"), C(13, "h"), C(9, "d"), C(5, "c"), C(2, "s")] },
  { name: "High Card", desc: "Highest-ranking card", cards: [C(14, "s"), C(11, "h"), C(8, "d"), C(5, "c"), C(3, "s")] },
];

export function HandRankingsSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Hand rankings">
      <div className="divide-y divide-white/5">
        {RANKINGS.map((r) => (
          <div key={r.name} className="flex items-center gap-3 py-1.5">
            <div className="flex shrink-0 gap-1">
              {r.cards.map((c, i) => (
                <PlayingCard key={i} card={c} size="sm" animate={false} />
              ))}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-tight">{r.name}</p>
              <p className="truncate text-xs text-muted">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </Sheet>
  );
}
