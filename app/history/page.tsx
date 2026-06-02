"use client";

import { motion } from "framer-motion";
import { BottomNav } from "@/components/layout/BottomNav";
import {
  ACTIVITY,
  ACTIVITY_META,
  ACTIVITY_SUMMARY,
  ActivityEntry,
} from "@/lib/data/activity";
import { MODES } from "@/lib/data/modes";
import { formatChips } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

function modeName(id: string) {
  return MODES.find((m) => m.id === id)?.name ?? id;
}

function signed(delta: number) {
  const sign = delta >= 0 ? "+" : "−";
  return `${sign}${formatChips(Math.abs(delta))}`;
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="flex-1 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3">
      <p className="numeral text-lg font-semibold" style={accent ? { color: accent } : undefined}>
        {value}
      </p>
      <p className="mt-0.5 text-[11px] text-muted">{label}</p>
    </div>
  );
}

function Row({ entry, i }: { entry: ActivityEntry; i: number }) {
  const win = entry.result === "win";
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.03 * i }}
      className="flex items-center gap-3 py-3"
    >
      {/* slim win/loss accent in place of the old suit glyph */}
      <span
        className={cn(
          "h-9 w-1 flex-shrink-0 rounded-full",
          win ? "bg-mint" : "bg-coral"
        )}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium leading-tight">
          {entry.hand}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted">
          {modeName(entry.modeId)} · {ACTIVITY_META.stakes(entry.modeId)} ·{" "}
          {entry.players} players · {entry.when}
        </p>
      </div>

      <div className="flex flex-col items-end">
        <span
          className={cn(
            "numeral text-[15px] font-semibold",
            win ? "text-mint" : "text-coral"
          )}
        >
          {signed(entry.delta)}
        </span>
        <span className="numeral text-[11px] text-muted-dim">
          {formatChips(entry.pot)} pot
        </span>
      </div>
    </motion.div>
  );
}

export default function HistoryPage() {
  const s = ACTIVITY_SUMMARY;
  const groups: ActivityEntry["day"][] = ["Today", "Yesterday", "Earlier"];

  return (
    <div className="flex h-full flex-col">
      <main className="no-scrollbar flex-1 overflow-y-auto px-5 pt-6">
        <h1 className="text-2xl font-semibold">Activity</h1>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex gap-2.5"
        >
          <StatCard
            label="Net · 7 days"
            value={signed(s.net7d)}
            accent={s.net7d >= 0 ? "#A8E6B0" : "#F26D6D"}
          />
          <StatCard label="Hands" value={`${s.hands}`} />
          <StatCard label="Win rate" value={`${s.winRate}%`} />
        </motion.div>

        <div className="mt-3 flex items-center justify-between rounded-2xl border border-mint/15 bg-mint/[0.06] px-4 py-3">
          <div>
            <p className="text-xs text-muted">Biggest pot won</p>
            <p className="numeral text-lg font-semibold text-mint">
              {formatChips(s.biggestPot)}
            </p>
          </div>
        </div>

        {/* Grouped hand feed */}
        <div className="mt-5 pb-4">
          {groups.map((day) => {
            const rows = ACTIVITY.filter((e) => e.day === day);
            if (rows.length === 0) return null;
            return (
              <section key={day} className="mb-2">
                <p className="sticky top-0 z-10 bg-black/80 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted backdrop-blur">
                  {day}
                </p>
                <div className="divide-y divide-white/5">
                  {rows.map((e, i) => (
                    <Row key={e.id} entry={e} i={i} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
