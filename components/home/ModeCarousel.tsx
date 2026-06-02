"use client";

import { motion } from "framer-motion";
import { MODES, GameMode } from "@/lib/data/modes";
import { formatChips } from "@/lib/utils/format";

function hexToRgba(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}


const SUIT_WATERMARK = ["♠", "♦", "♥", "♣", "♠"];

function HeroCard({
  onSelect,
  desktop,
}: {
  onSelect: () => void;
  desktop?: boolean;
}) {
  const sizeClass = desktop
    ? "h-full w-full"
    : "snap-center h-44 w-[78%] flex-shrink-0";
  return (
    <button
      onClick={onSelect}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-card border border-mint/25 p-5 text-left transition-all duration-200 hover:scale-[1.025] ${sizeClass}`}
      style={{
        background:
          "linear-gradient(150deg, #1c4d33 0%, #133a28 40%, #101417 100%)",
        boxShadow: "0 14px 34px -14px rgba(168,230,176,0.55)",
      }}
    >
      <span className="pointer-events-none absolute bottom-4 right-4 text-[80px] leading-none text-mint/18 select-none">
        ♣
      </span>
      <div className="pointer-events-none absolute inset-0 rounded-card opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ background: "linear-gradient(155deg, rgba(168,230,176,0.08) 0%, transparent 60%)" }} />
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
  desktop,
}: {
  mode: GameMode;
  index: number;
  onSelect: (m: GameMode) => void;
  desktop?: boolean;
}) {
  const { tint } = mode;
  const sizeClass = desktop
    ? "h-full w-full"
    : "snap-center h-44 w-[78%] flex-shrink-0";
  return (
    <button
      onClick={() => onSelect(mode)}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-card p-5 text-left transition-all duration-200 hover:scale-[1.025] ${sizeClass}`}
      style={{
        background: `linear-gradient(155deg, ${hexToRgba(tint, 0.24)} 0%, ${hexToRgba(tint, 0.06)} 40%, #121316 80%)`,
        border: `1px solid ${hexToRgba(tint, 0.22)}`,
        boxShadow: `0 12px 30px -14px ${hexToRgba(tint, 0.6)}`,
      }}
    >
      <span
        className="pointer-events-none absolute bottom-4 right-4 text-[80px] leading-none select-none"
        style={{ color: hexToRgba(tint, 0.18) }}
      >
        {SUIT_WATERMARK[index % SUIT_WATERMARK.length]}
      </span>
      <div
        className="pointer-events-none absolute inset-0 rounded-card opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{ background: `linear-gradient(155deg, ${hexToRgba(tint, 0.1)} 0%, transparent 60%)` }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

      <div className="relative">
        <span
          className="rounded-pill px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
          style={{ background: hexToRgba(tint, 0.18), color: tint }}
        >
          {mode.name}
        </span>
      </div>

      <div className="relative space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-white/45">
            Stakes
          </span>
          <span className="numeral text-base font-semibold" style={{ color: tint }}>
            {mode.smallBlind} / {mode.bigBlind}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-white/45">
            Buy-in
          </span>
          <span className="numeral text-sm font-semibold text-white/80">
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
      className="lg:h-full"
    >
      {/* ── Mobile: horizontal scroll strip (unchanged) ──────────── */}
      <div className="no-scrollbar snap-x-mandatory flex gap-3 overflow-x-auto px-5 py-1 lg:hidden">
        <HeroCard onSelect={() => onSelect(MODES[0])} />
        {MODES.map((m, i) => (
          <ModeCard key={m.id} mode={m} index={i} onSelect={onSelect} />
        ))}
        <div className="w-2 flex-shrink-0" />
      </div>

      {/* ── Desktop: 3-column grid, rows share a capped height ─── */}
      <div className="hidden lg:grid lg:h-[490px] lg:auto-rows-fr lg:grid-cols-3 lg:gap-4 lg:px-8">
        <HeroCard onSelect={() => onSelect(MODES[0])} desktop />
        {MODES.map((m, i) => (
          <ModeCard key={m.id} mode={m} index={i} onSelect={onSelect} desktop />
        ))}
      </div>
    </motion.div>
  );
}
