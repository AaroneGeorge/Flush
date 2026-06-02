"use client";

import { motion } from "framer-motion";
import { Card } from "@/lib/poker/types";
import { PlayingCard } from "./PlayingCard";
import { formatChips } from "@/lib/utils/format";

export function CommunityCards({
  board,
  pot,
  stage,
}: {
  board: Card[];
  pot: number;
  stage: string;
}) {
  // Show 5 slots. Revealed = dealt board cards; remaining = backs once a hand
  // is in progress, or faint placeholders pre-deal.
  const revealed = board.length;
  const inHand = stage !== "idle";

  return (
    <div className="relative flex flex-col items-center">
      <div className="flex items-center justify-center gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < revealed) {
            return (
              <PlayingCard key={`b${i}`} card={board[i]} size="lg" index={i} />
            );
          }
          if (inHand) {
            return <PlayingCard key={`back${i}`} faceDown size="lg" index={i} />;
          }
          return (
            <div
              key={`ph${i}`}
              className="h-[5.5rem] w-16 rounded-2xl border border-dashed border-white/8"
            />
          );
        })}
      </div>

      <motion.div
        key={pot}
        initial={{ scale: 0.9, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mt-3 flex items-center gap-1.5"
      >
        <span className="text-xs text-muted">Pot</span>
        <span className="numeral text-lg font-semibold text-white">
          {formatChips(pot)}
        </span>
      </motion.div>
    </div>
  );
}
