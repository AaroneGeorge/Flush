"use client";

import { motion } from "framer-motion";
import { Card, RANK_LABEL, SUIT_GLYPH, isRed } from "@/lib/poker/types";
import { cn } from "@/lib/utils/cn";

type Size = "sm" | "md" | "lg" | "xl";

const SIZES: Record<Size, string> = {
  sm: "w-9 h-12 rounded-lg",
  md: "w-12 h-16 rounded-xl",
  lg: "w-16 h-[5.5rem] rounded-2xl",
  xl: "w-20 h-28 rounded-[20px]",
};

/** Per-size typography for the corner indices + centre glyph. */
const TYPE: Record<
  Size,
  { rank: string; cornerSuit: string; center: string; pad: string }
> = {
  sm: { rank: "text-[11px]", cornerSuit: "text-[8px]", center: "text-lg", pad: "p-0.5" },
  md: { rank: "text-sm", cornerSuit: "text-[10px]", center: "text-2xl", pad: "p-1" },
  lg: { rank: "text-lg", cornerSuit: "text-xs", center: "text-4xl", pad: "p-1.5" },
  xl: { rank: "text-xl", cornerSuit: "text-sm", center: "text-5xl", pad: "p-2" },
};

const SUIT_COLOR = {
  red: "#E11D48",
  black: "#15171C",
} as const;

/** Premium foil card back with a guilloché lattice + brand emblem. */
export function CardBack({
  size = "md",
  className,
}: {
  size?: Size;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden border border-white/15 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.7)]",
        SIZES[size],
        className
      )}
      style={{
        background:
          "linear-gradient(150deg, #15402a 0%, #0d2a1c 38%, #2a1430 66%, #3a1226 100%)",
      }}
    >
      {/* lattice pattern */}
      <svg
        viewBox="0 0 40 56"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full opacity-[0.18]"
      >
        <defs>
          <pattern id="lat" width="6" height="6" patternUnits="userSpaceOnUse">
            <path d="M0 6 6 0M-1 1 1 -1M5 7 7 5" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="40" height="56" fill="url(#lat)" />
      </svg>

      {/* inner frame */}
      <div className="absolute inset-[3px] rounded-[inherit] border border-white/25" />
      <div className="absolute inset-[5px] rounded-[inherit] border border-white/10" />

      {/* brand emblem */}
      <div className="relative flex flex-col items-center">
        <span
          className="font-black leading-none text-white/85"
          style={{
            fontSize: size === "sm" ? 14 : size === "md" ? 18 : 24,
            textShadow: "0 1px 2px rgba(0,0,0,0.5)",
          }}
        >
          ♠
        </span>
        {size !== "sm" && (
          <span className="mt-0.5 text-[7px] font-semibold uppercase tracking-[0.2em] text-white/40">
            Flush
          </span>
        )}
      </div>

      {/* gloss + animated sheen */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_20%_0%,rgba(255,255,255,0.22),transparent_55%)]" />
      <div className="card-foil pointer-events-none absolute inset-0 mix-blend-screen" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="card-sheen absolute -inset-y-2 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      </div>
    </div>
  );
}

function CornerIndex({
  rank,
  glyph,
  color,
  t,
  flip,
}: {
  rank: string;
  glyph: string;
  color: string;
  t: (typeof TYPE)[Size];
  flip?: boolean;
}) {
  return (
    <div
      className={cn(
        "absolute flex flex-col items-center leading-none",
        flip ? "bottom-0.5 right-1 rotate-180" : "top-0.5 left-1"
      )}
      style={{ color }}
    >
      <span className={cn("font-bold", t.rank)} style={{ letterSpacing: "-0.03em" }}>
        {rank}
      </span>
      <span className={cn("-mt-px font-semibold", t.cornerSuit)}>{glyph}</span>
    </div>
  );
}

export function PlayingCard({
  card,
  size = "md",
  faceDown = false,
  muted = false,
  className,
  index = 0,
  animate = true,
}: {
  card?: Card;
  size?: Size;
  faceDown?: boolean;
  muted?: boolean;
  className?: string;
  index?: number;
  animate?: boolean;
}) {
  if (faceDown || !card) {
    const content = <CardBack size={size} className={className} />;
    if (!animate) return content;
    return (
      <motion.div
        initial={{ opacity: 0, y: -18, rotateZ: -6 }}
        animate={{ opacity: 1, y: 0, rotateZ: 0 }}
        transition={{ delay: index * 0.08, type: "spring", stiffness: 300, damping: 24 }}
      >
        {content}
      </motion.div>
    );
  }

  const red = isRed(card.suit);
  const color = red ? SUIT_COLOR.red : SUIT_COLOR.black;
  const t = TYPE[size];
  const rank = RANK_LABEL[card.rank];
  const glyph = SUIT_GLYPH[card.suit];

  const inner = (
    <div
      className={cn(
        "relative overflow-hidden border shadow-[0_8px_20px_-8px_rgba(0,0,0,0.65)]",
        SIZES[size],
        muted ? "border-black/10 opacity-40 grayscale" : "border-black/10",
        className
      )}
      style={{
        background:
          "linear-gradient(150deg, #ffffff 0%, #f6f8fb 46%, #e8edf3 100%)",
      }}
    >
      {/* inset highlight + soft inner ring for a glassy edge */}
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),inset_0_-10px_18px_-12px_rgba(0,0,0,0.25)]" />

      <CornerIndex rank={rank} glyph={glyph} color={color} t={t} />
      <CornerIndex rank={rank} glyph={glyph} color={color} t={t} flip />

      {/* centre suit */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className={cn("leading-none", t.center)}
          style={{
            color,
            textShadow: red
              ? "0 1px 1px rgba(225,29,72,0.25)"
              : "0 1px 1px rgba(0,0,0,0.25)",
          }}
        >
          {glyph}
        </span>
      </div>

      {/* gloss highlight */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(125%_70%_at_18%_0%,rgba(255,255,255,0.85),transparent_52%)]" />
      {/* animated diagonal sheen */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="card-sheen absolute -inset-y-2 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/65 to-transparent" />
      </div>
    </div>
  );

  if (!animate) return inner;

  return (
    <motion.div
      initial={{ opacity: 0, y: -18, rotateY: 90 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{
        delay: index * 0.09,
        type: "spring",
        stiffness: 280,
        damping: 22,
      }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {inner}
    </motion.div>
  );
}
