"use client";

import { motion } from "framer-motion";
import { LEADERBOARD, LeaderEntry } from "@/lib/data/leaderboard";
import { formatXp } from "@/lib/utils/format";

const MEDALS = ["🥇", "🥈", "🥉"];

function Row({ entry, i }: { entry: LeaderEntry; i: number }) {
  const medal = MEDALS[entry.rank - 1];
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * i }}
      className="flex items-center gap-3 py-2.5"
    >
      <div className="w-6 text-center">
        {medal ? (
          <span className="text-lg">{medal}</span>
        ) : (
          <span className="text-sm font-medium text-muted">{entry.rank}</span>
        )}
      </div>
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink-700 text-xl">
        {entry.avatar}
      </div>
      <div className="flex-1">
        <p className="text-[15px] font-medium leading-tight">{entry.name}</p>
        <p className="text-xs text-muted">{formatXp(entry.xp)}</p>
      </div>
    </motion.div>
  );
}

export function Leaderboard() {
  return (
    <section className="mt-6 px-5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold">Weekly leaderboard</h2>
        <div className="flex items-center gap-1 text-sm text-muted">
          <span>21</span>
          <span>🏆</span>
        </div>
      </div>
      <div className="divide-y divide-white/5">
        {LEADERBOARD.slice(0, 8).map((e, i) => (
          <Row key={e.name} entry={e} i={i} />
        ))}
      </div>
    </section>
  );
}
