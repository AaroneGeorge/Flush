"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sheet } from "@/components/layout/Sheet";
import { MODES, GameMode } from "@/lib/data/modes";
import { formatChips } from "@/lib/utils/format";
import { useSoundStore } from "@/lib/sound/sounds";
import { cn } from "@/lib/utils/cn";

/**
 * Ruler-dial selector. The five buy-in tiers are laid out as ticks; tapping a
 * tick (or its segment) snaps the selection. The tall coral tick marks the
 * active tier — echoing the reference screenshot.
 */
function StakesRuler({
  index,
  onChange,
}: {
  index: number;
  onChange: (i: number) => void;
}) {
  // 9 visual ticks; the 5 modes map onto the first five "tall" positions.
  const ticks = Array.from({ length: 9 });
  return (
    <div className="relative mt-8 flex items-end justify-between px-1">
      {ticks.map((_, i) => {
        const isMode = i < MODES.length;
        const active = i === index;
        return (
          <button
            key={i}
            disabled={!isMode}
            onClick={() => isMode && onChange(i)}
            className="flex flex-1 items-end justify-center py-2"
            aria-label={isMode ? `Tier ${i + 1}` : undefined}
          >
            <motion.span
              animate={{
                height: active ? 56 : isMode ? 30 : 20,
                opacity: active ? 1 : isMode ? 0.55 : 0.2,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className={cn(
                "w-[3px] rounded-full",
                active ? "bg-coral" : "bg-white"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

export function SetupSheet({
  open,
  mode: initialMode,
  onClose,
}: {
  open: boolean;
  mode: GameMode | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const play = useSoundStore((s) => s.play);
  const startIndex = initialMode
    ? Math.max(0, MODES.findIndex((m) => m.id === initialMode.id))
    : 0;
  const [index, setIndex] = useState(startIndex);
  const [isPublic, setIsPublic] = useState(true);

  // When the sheet opens for a specific mode, snap the ruler to it.
  useEffect(() => {
    if (open && initialMode) {
      const want = MODES.findIndex((m) => m.id === initialMode.id);
      if (want >= 0) setIndex(want);
    }
  }, [open, initialMode]);

  const mode = MODES[index] ?? MODES[0];

  const start = () => {
    play("click");
    const roomId = Math.random().toString(36).slice(2, 8);
    const params = new URLSearchParams({
      mode: mode.id,
      buyIn: String(mode.maxBuyIn),
      seats: "6",
      public: isPublic ? "1" : "0",
    });
    router.push(`/room/${roomId}?${params.toString()}`);
  };

  return (
    <Sheet open={open} onClose={onClose}>
      <div className="flex flex-col items-center pb-2 pt-2">
        <p className="text-sm text-muted">Stakes</p>
        <div className="numeral text-5xl font-semibold text-mint">
          {mode.smallBlind} / {mode.bigBlind}
        </div>

        <p className="mt-5 text-sm text-coral/80">Buy-in</p>
        <div className="numeral text-5xl font-extrabold text-coral">
          {formatChips(mode.minBuyIn)} / {formatChips(mode.maxBuyIn)}
        </div>

        <div className="w-full">
          <StakesRuler index={index} onChange={(i) => { play("click"); setIndex(i); }} />
        </div>
      </div>

      <div className="mt-8 space-y-3">
        <button
          onClick={() => { play("click"); setIsPublic((v) => !v); }}
          className="flex w-full items-center justify-center gap-2 rounded-pill border border-white/12 py-4 text-sm font-medium tracking-wide"
        >
          {isPublic ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="9" rx="2" stroke="#A8E6B0" strokeWidth="1.8" />
              <path d="M8 11V8a4 4 0 0 1 7-2.6" stroke="#A8E6B0" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="9" rx="2" stroke="#8A8B8F" strokeWidth="1.8" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#8A8B8F" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
          <span className={isPublic ? "text-mint" : "text-muted"}>
            {isPublic ? "PUBLIC GAME" : "PRIVATE GAME"}
          </span>
        </button>

        <button
          onClick={start}
          className="w-full rounded-pill bg-white py-4 text-sm font-bold uppercase tracking-wide text-black active:scale-[0.99]"
        >
          Start Game
        </button>
      </div>
    </Sheet>
  );
}
