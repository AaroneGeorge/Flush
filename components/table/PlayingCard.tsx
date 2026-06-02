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

/**
 * Per-size glyph sizing. Rank (top half) and suit (bottom half) share the same
 * font size so the two halves read as equal weight.
 */
const TYPE: Record<Size, string> = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-3xl",
  xl: "text-[2.5rem]",
};

const SUIT_COLOR = {
  red: "#E11D48",
  black: "#15171C",
} as const;

/** Flat coral card back with a concentric guilloché medallion. */
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
        "relative flex items-center justify-center overflow-hidden bg-[#e8534e] shadow-[0_6px_16px_-8px_rgba(0,0,0,0.6)]",
        SIZES[size],
        className
      )}
    >
      {/* inner white frame */}
      <div className="absolute inset-[3px] rounded-[inherit] border-2 border-white/85" />

      {/* concentric medallion */}
      <svg
        viewBox="0 0 40 40"
        className="h-[78%] w-[78%] text-white/90"
        fill="none"
        stroke="currentColor"
      >
        <g strokeWidth="0.8">
          <circle cx="20" cy="20" r="15" />
          <circle cx="20" cy="20" r="11" />
          <circle cx="20" cy="20" r="4" />
        </g>
        {/* radiating petals */}
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i / 16) * Math.PI * 2;
          const x1 = 20 + Math.cos(a) * 4;
          const y1 = 20 + Math.sin(a) * 4;
          const x2 = 20 + Math.cos(a) * 11;
          const y2 = 20 + Math.sin(a) * 11;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              strokeWidth="0.7"
            />
          );
        })}
        <circle cx="20" cy="20" r="1.6" fill="currentColor" stroke="none" />
      </svg>
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
        "relative flex flex-col overflow-hidden bg-white shadow-[0_6px_16px_-8px_rgba(0,0,0,0.55)]",
        SIZES[size],
        muted && "opacity-40 grayscale",
        className
      )}
      style={{ color }}
    >
      {/* top half — rank / face */}
      <div className="flex flex-1 items-center justify-center leading-none">
        <span className={cn("font-bold", t)} style={{ letterSpacing: "-0.04em" }}>
          {rank}
        </span>
      </div>
      {/* bottom half — suit, same size as the rank */}
      <div className="flex flex-1 items-center justify-center leading-none">
        <span className={cn("font-semibold", t)}>{glyph}</span>
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
