"use client";

import { motion } from "framer-motion";
import { Card, RANK_LABEL, SUIT_GLYPH, isRed } from "@/lib/poker/types";
import { cn } from "@/lib/utils/cn";

type Size = "sm" | "md" | "lg" | "xl";

const SIZES: Record<Size, string> = {
  sm: "w-9 h-12 text-base rounded-lg",
  md: "w-12 h-16 text-xl rounded-xl",
  lg: "w-16 h-[5.5rem] text-3xl rounded-2xl",
  xl: "w-20 h-28 text-4xl rounded-[20px]",
};

/** Ornamental coral card back, echoing the reference design. */
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
        "relative flex items-center justify-center overflow-hidden border border-white/10 bg-gradient-to-br from-coral-400 to-coral-600 shadow-md",
        SIZES[size],
        className
      )}
    >
      <div className="absolute inset-[3px] rounded-[inherit] border border-white/30" />
      <svg viewBox="0 0 40 56" className="h-3/4 w-3/4 opacity-70">
        <g stroke="white" strokeWidth="1" fill="none">
          <circle cx="20" cy="28" r="9" />
          <circle cx="20" cy="28" r="5" />
          <path d="M20 4v48M4 28h32M8 12l24 32M32 12L8 44" opacity="0.5" />
        </g>
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

  const inner = (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center border bg-white font-semibold shadow-md transition-all",
        SIZES[size],
        muted ? "border-black/5 opacity-40 grayscale" : "border-black/10",
        className
      )}
    >
      <span
        className={cn(
          "leading-none numeral",
          red ? "text-coral-600" : "text-neutral-900"
        )}
      >
        {RANK_LABEL[card.rank]}
      </span>
      <span
        className={cn(
          "leading-none",
          size === "sm" ? "text-xs" : "text-sm",
          red ? "text-coral-600" : "text-neutral-900"
        )}
      >
        {SUIT_GLYPH[card.suit]}
      </span>
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
