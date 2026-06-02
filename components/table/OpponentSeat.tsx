"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Player } from "@/lib/poker/engine";
import { Card } from "@/lib/poker/types";
import { PlayingCard } from "./PlayingCard";
import { formatChips } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export function EmptySeat() {
  return (
    <div className="flex w-16 flex-shrink-0 flex-col items-center gap-1.5 opacity-60">
      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-white/15 text-white/30">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

export function OpponentSeat({
  player,
  active,
  isDealer,
  isWinner,
  revealCards,
  revealLabel,
}: {
  player: Player;
  active: boolean;
  isDealer: boolean;
  isWinner: boolean;
  /** When set (showdown), show this player's hole cards so others can verify. */
  revealCards?: Card[];
  revealLabel?: string;
}) {
  const dimmed = player.folded || player.sittingOut;
  const showReveal = !!revealCards && revealCards.length === 2;

  return (
    <div className="relative flex w-16 flex-shrink-0 flex-col items-center gap-1">
      {/* revealed hole cards (showdown) — falls back to the bet bubble otherwise */}
      <div className="flex h-8 items-end justify-center">
        <AnimatePresence mode="wait">
          {showReveal ? (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, y: 6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="flex"
            >
              <div className="rotate-[-8deg]">
                <PlayingCard card={revealCards![0]} size="sm" index={0} />
              </div>
              <div className="-ml-3.5 rotate-[8deg]">
                <PlayingCard card={revealCards![1]} size="sm" index={1} />
              </div>
            </motion.div>
          ) : player.bet > 0 ? (
            <motion.div
              key="bet"
              initial={{ opacity: 0, y: 4, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-pill bg-ink-700 px-1.5 text-[10px] font-semibold text-mint"
            >
              {formatChips(player.bet)}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="relative">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full bg-ink-700 text-2xl transition-all",
            dimmed && "opacity-35 grayscale",
            active && "turn-pulse ring-2 ring-mint",
            isWinner && "ring-2 ring-amber-300"
          )}
        >
          {player.avatar}
        </div>
        {isDealer && (
          <span className="absolute -bottom-0.5 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-black">
            D
          </span>
        )}
        {player.lastAction && active === false && player.bet === 0 && !player.folded && !showReveal && (
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-pill bg-ink-600 px-1.5 py-0.5 text-[9px] text-white/70">
            {player.lastAction}
          </span>
        )}
      </div>

      <p
        className={cn(
          "max-w-[64px] truncate text-[11px]",
          dimmed ? "text-muted-dim" : "text-muted"
        )}
      >
        {player.name}
      </p>
      {showReveal && revealLabel ? (
        <p className="max-w-[68px] truncate text-[9px] font-semibold text-mint">
          {revealLabel}
        </p>
      ) : (
        <p
          className={cn(
            "numeral text-[13px] font-semibold leading-none",
            player.stack <= 0 ? "text-coral" : dimmed ? "text-muted-dim" : "text-white"
          )}
        >
          {formatChips(player.stack)}
        </p>
      )}
    </div>
  );
}
