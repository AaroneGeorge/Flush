"use client";

import { motion } from "framer-motion";
import { MODES, GameMode } from "@/lib/data/modes";
import { formatChips } from "@/lib/utils/format";

function hexToRgba(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/** Stacked-chips mark, tinted per mode. Replaces the old emoji. */
function ChipMark({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <ellipse cx="12" cy="17.5" rx="7.5" ry="3" fill={color} opacity="0.35" />
      <ellipse cx="12" cy="14.5" rx="7.5" ry="3" stroke={color} strokeWidth="1.6" />
      <ellipse cx="12" cy="11" rx="7.5" ry="3" stroke={color} strokeWidth="1.6" />
      <ellipse cx="12" cy="7.5" rx="7.5" ry="3" fill={color} opacity="0.18" stroke={color} strokeWidth="1.6" />
      <path d="M12 5.2v1.4M7 7.1l.9.8M17 7.1l-.9.8" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

// Suit watermark cycles so the five tiers feel distinct.
const SUIT_WATERMARK = ["♠", "♦", "♥", "♣", "♠"];

function HeroCard({ onSelect }: { onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="snap-center group relative flex h-44 w-[78%] flex-shrink-0 flex-col justify-between overflow-hidden rounded-card border border-mint/25 p-5 text-left"
      style={{
        background:
          "linear-gradient(150deg, #1c4d33 0%, #133a28 40%, #101417 100%)",
        boxShadow: "0 14px 34px -14px rgba(168,230,176,0.55)",
      }}
    >
      {/* suit cluster watermark */}
      <span className="pointer-events-none absolute -bottom-6 -right-3 text-[150px] leading-none text-mint/10 select-none">
        ♣
      </span>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

      <div className="relative flex items-center gap-2">
        <span className="flex h-2 w-2 items-center justify-center">
          <span className="h-2 w-2 animate-pulse rounded-full bg-mint" />
        </span>
        <span className="rounded-pill bg-mint/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-mint">
          Live tables
        </span>
      </div>

      <div className="relative">
        <h3 className="text-[26px] font-semibold leading-tight text-white">
          Cash Games
        </h3>
        <p className="mt-0.5 text-sm text-white/55">
          Play real opponents, any stake
        </p>
      </div>
    </button>
  );
}

function ModeCard({
  mode,
  index,
  onSelect,
}: {
  mode: GameMode;
  index: number;
  onSelect: (m: GameMode) => void;
}) {
  const { tint } = mode;
  return (
    <button
      onClick={() => onSelect(mode)}
      className="snap-center relative flex h-44 w-[78%] flex-shrink-0 flex-col justify-between overflow-hidden rounded-card p-5 text-left"
      style={{
        background: `linear-gradient(155deg, ${hexToRgba(tint, 0.24)} 0%, ${hexToRgba(
          tint,
          0.06
        )} 40%, #121316 80%)`,
        border: `1px solid ${hexToRgba(tint, 0.22)}`,
        boxShadow: `0 12px 30px -14px ${hexToRgba(tint, 0.6)}`,
      }}
    >
      {/* large faint suit watermark */}
      <span
        className="pointer-events-none absolute -bottom-7 -right-2 text-[130px] leading-none select-none"
        style={{ color: hexToRgba(tint, 0.1) }}
      >
        {SUIT_WATERMARK[index % SUIT_WATERMARK.length]}
      </span>
      {/* top gloss line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

      <div className="relative flex items-start justify-between">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: hexToRgba(tint, 0.14) }}
        >
          <ChipMark color={tint} />
        </span>
        <span
          className="rounded-pill px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
          style={{ background: hexToRgba(tint, 0.18), color: tint }}
        >
          {mode.name}
        </span>
      </div>

      <div className="relative space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-white/45">
            Stakes
          </span>
          <span
            className="numeral text-base font-semibold"
            style={{ color: tint }}
          >
            {mode.smallBlind} / {mode.bigBlind}
          </span>
        </div>
        <div className="h-px bg-white/8" />
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-white/45">
            Buy-in
          </span>
          <span className="numeral text-base font-semibold text-white">
            {formatChips(mode.minBuyIn)} – {formatChips(mode.maxBuyIn)}
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
      {MODES.map((m, i) => (
        <ModeCard key={m.id} mode={m} index={i} onSelect={onSelect} />
      ))}
      <div className="w-2 flex-shrink-0" />
    </motion.div>
  );
}
