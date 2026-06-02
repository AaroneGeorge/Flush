"use client";

import { motion } from "framer-motion";
import { useUserStore } from "@/lib/store/userStore";
import { LevelRing } from "@/components/layout/TopBar";
import { formatChips } from "@/lib/utils/format";

function SolGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M5 7.5h12.5L15 10H2.5L5 7.5ZM5 14h12.5L15 16.5H2.5L5 14ZM7 4h12.5L17 6.5H4.5L7 4Z"
        fill="#A8E6B0"
        transform="translate(1 1)"
      />
    </svg>
  );
}

export function BalanceHeader() {
  const { balance, xp, level } = useUserStore();
  const progress = (xp % 500) / 500;

  return (
    <header className="px-5 pt-5">
      <div className="flex items-center justify-between">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-3"
      >
        <div className="numeral text-[64px] font-extralight leading-none tracking-tight">
          {formatChips(balance)}
        </div>
        <p className="mt-1 text-sm text-muted">Your balance</p>
      </motion.div>
      <LevelRing level={level} progress={progress} />
      </div>
    </header>
  );
}
