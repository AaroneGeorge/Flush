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
    <div className="relative flex w-full flex-col items-center">
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

      {/* Pot — right-aligned to the screen edge, mirroring the reference */}
      <motion.div
        key={pot}
        initial={{ scale: 0.9, opacity: 0.6 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mt-2.5 flex w-full flex-col items-end pr-1"
      >
        <span className="text-[11px] uppercase tracking-wide text-muted">Pot</span>
        <span className="numeral text-2xl font-bold text-white">
          {formatChips(pot)}
        </span>
      </motion.div>
    </div>
  );
}
