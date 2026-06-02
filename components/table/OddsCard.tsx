"use client";

import { motion } from "framer-motion";
import { OddsResult } from "@/lib/poker/odds";
import { formatPct } from "@/lib/utils/format";

/** Bottom-right live equity readout, mirroring the reference design. */
export function OddsCard({ odds }: { odds: OddsResult | null }) {
  if (!odds) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-28 rounded-2xl border border-mint/30 bg-ink-800/90 px-3 py-2 text-center backdrop-blur"
    >
      <p className="text-[11px] text-muted">Win</p>
      <p className="numeral text-2xl font-bold text-coral">
        {formatPct(odds.win)}
      </p>
      <p className="mt-0.5 text-[11px] text-muted">{odds.label}</p>
      <p className="numeral text-lg font-semibold text-white">
        {formatPct(odds.made)}
      </p>
    </motion.div>
  );
}
