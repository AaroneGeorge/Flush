"use client";

import { motion } from "framer-motion";
import { MODES, GameMode } from "@/lib/data/modes";
import { formatChips } from "@/lib/utils/format";

function hexToRgba(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

function HeroCard({ onSelect }: { onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="snap-center relative flex h-44 w-[78%] flex-shrink-0 flex-col justify-between overflow-hidden rounded-card p-5 text-left"
      style={{
        background:
          "linear-gradient(135deg, #cfe9d3 0%, #e8f3df 55%, #f3e7df 100%)",
      }}
    >
      <span className="text-5xl drop-shadow-sm">🌍</span>
      <div>
        <h3 className="text-2xl font-semibold text-neutral-900">Cash Games</h3>
        <p className="text-sm text-neutral-700/80">
          Play against real opponents
        </p>
      </div>
    </button>
  );
}

function ModeCard({
  mode,
  onSelect,
}: {
  mode: GameMode;
  onSelect: (m: GameMode) => void;
}) {
  return (
    <button
      onClick={() => onSelect(mode)}
      className="snap-center relative flex h-44 w-[78%] flex-shrink-0 flex-col justify-between overflow-hidden rounded-card border border-white/8 p-5 text-left"
      style={{
        background: `linear-gradient(150deg, ${hexToRgba(
          mode.tint,
          0.16
        )} 0%, #161719 60%)`,
      }}
    >
      <div className="flex items-start justify-between">
        <span className="text-4xl">{mode.emoji}</span>
        <span
          className="rounded-pill px-2.5 py-1 text-[11px] font-medium"
          style={{
            background: hexToRgba(mode.tint, 0.18),
            color: mode.tint,
          }}
        >
          {mode.name}
        </span>
      </div>
      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xs uppercase tracking-wide text-muted">
            Stakes
          </span>
          <span className="numeral text-lg font-semibold text-mint">
            {mode.smallBlind}/{mode.bigBlind}
          </span>
        </div>
        <div className="mt-0.5 flex items-baseline gap-1.5">
          <span className="text-xs uppercase tracking-wide text-muted">
            Buy-in
          </span>
          <span className="numeral text-lg font-semibold text-coral">
            {formatChips(mode.minBuyIn)}/{formatChips(mode.maxBuyIn)}
          </span>
        </div>
      </div>
    </button>
  );
}

export function ModeCarousel({
  onSelect,
}: {
  onSelect: (m: GameMode) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="no-scrollbar snap-x-mandatory flex gap-3 overflow-x-auto px-5 py-1"
    >
      <HeroCard onSelect={() => onSelect(MODES[0])} />
      {MODES.map((m) => (
        <ModeCard key={m.id} mode={m} onSelect={onSelect} />
      ))}
      <div className="w-2 flex-shrink-0" />
    </motion.div>
  );
}
