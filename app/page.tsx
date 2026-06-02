"use client";

import { useState } from "react";
import { BalanceHeader } from "@/components/home/BalanceHeader";
import { ModeCarousel } from "@/components/home/ModeCarousel";
import { Leaderboard } from "@/components/home/Leaderboard";
import { BottomNav } from "@/components/layout/BottomNav";
import { SetupSheet } from "@/components/setup/SetupSheet";
import { GameMode } from "@/lib/data/modes";

export default function HomePage() {
  const [selected, setSelected] = useState<GameMode | null>(null);
  const [open, setOpen] = useState(false);

  const onSelect = (m: GameMode) => {
    setSelected(m);
    setOpen(true);
  };

  return (
    <div className="flex h-full flex-col">
      {/*
       * Mobile:  single scrollable column.
       * Desktop: two-column grid — left for balance + cards, right for leaderboard.
       */}
      <div className="min-h-0 flex-1 lg:grid lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px]">
        <main className="no-scrollbar overflow-y-auto pb-6 lg:h-full lg:pb-8">
          <BalanceHeader />

          {/* Desktop-only section label */}
          <div className="hidden lg:flex lg:items-center lg:justify-between lg:px-8 lg:pb-3 lg:pt-7">
            <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted/70">
              Game modes
            </h2>
            <span className="text-[11px] text-muted/40">6 active tables</span>
          </div>

          {/* Mode cards — scroll on mobile, capped grid on desktop */}
          <div className="mt-6 lg:mt-0">
            <ModeCarousel onSelect={onSelect} />
          </div>

          {/* Leaderboard — inline on mobile only */}
          <div className="lg:hidden">
            <Leaderboard />
          </div>
        </main>

        {/* Desktop-only right leaderboard panel */}
        <aside className="no-scrollbar hidden overflow-y-auto border-l border-white/[0.06] lg:flex lg:flex-col lg:pt-2">
          <Leaderboard />
        </aside>
      </div>

      <BottomNav />
      <SetupSheet open={open} mode={selected} onClose={() => setOpen(false)} />
    </div>
  );
}
