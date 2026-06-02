"use client";

import { Card } from "@/lib/poker/types";
import { PlayingCard } from "./PlayingCard";

export function HoleCards({
  cards,
  folded,
}: {
  cards: Card[];
  folded: boolean;
}) {
  if (cards.length < 2) {
    return (
      <div className="flex gap-1.5">
        <div className="h-28 w-20 rounded-[20px] border border-dashed border-white/8" />
        <div className="h-28 w-20 rounded-[20px] border border-dashed border-white/8" />
      </div>
    );
  }
  return (
    <div className="flex">
      <div className="rotate-[-6deg]">
        <PlayingCard card={cards[0]} size="xl" muted={folded} index={0} />
      </div>
      <div className="-ml-3 rotate-[6deg]">
        <PlayingCard card={cards[1]} size="xl" muted={folded} index={1} />
      </div>
    </div>
  );
}
