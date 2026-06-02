"use client";

import { motion } from "framer-motion";
import { useUserStore } from "@/lib/store/userStore";
import { LevelRing } from "@/components/layout/TopBar";
import { formatChips } from "@/lib/utils/format";

export function BalanceHeader() {
  const { balance, xp, level, handsPlayed, handsWon } = useUserStore();
  const progress = (xp % 500) / 500;
  const winRate =
    handsPlayed > 0 ? Math.round((handsWon / handsPlayed) * 100) : 0;

  return (
    <header className="px-5 pt-5 lg:px-8 lg:pt-8 lg:pb-7 lg:border-b lg:border-white/[0.06]">
      {/* ── Mobile layout (unchanged) ─────────────────────────────── */}
      <div className="flex items-center justify-between lg:hidden">
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

      {/* ── Desktop layout ────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="hidden lg:flex lg:items-end lg:justify-between"
      >
        {/* Left: balance */}
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-muted">
            Your balance
          </p>
          <div className="numeral text-[52px] font-light leading-none tracking-tight">
            {formatChips(balance)}
          </div>
        </div>

        {/* Right: quick stats + level ring */}
        <div className="flex items-center gap-5 pb-1">
          <div className="flex items-center gap-6 border-r border-white/[0.08] pr-5">
            <div className="text-right">
              <p className="mb-1 text-[11px] uppercase tracking-wider text-muted">
                Level
              </p>
              <p className="numeral text-xl font-semibold">{level}</p>
            </div>
            <div className="text-right">
              <p className="mb-1 text-[11px] uppercase tracking-wider text-muted">
                Hands
              </p>
              <p className="numeral text-xl font-semibold">{handsPlayed}</p>
            </div>
            <div className="text-right">
              <p className="mb-1 text-[11px] uppercase tracking-wider text-muted">
                Win rate
              </p>
              <p className="numeral text-xl font-semibold">
                {winRate > 0 ? `${winRate}%` : "—"}
              </p>
            </div>
          </div>
          <LevelRing level={level} progress={progress} />
        </div>
      </motion.div>
    </header>
  );
}
