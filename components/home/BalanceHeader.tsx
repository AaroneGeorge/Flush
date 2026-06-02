"use client";

import { motion } from "framer-motion";
import { useUserStore } from "@/lib/store/userStore";
import { LevelRing } from "@/components/layout/TopBar";
import { formatChips } from "@/lib/utils/format";

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
