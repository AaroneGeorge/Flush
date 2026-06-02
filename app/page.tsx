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
      <main className="no-scrollbar flex-1 overflow-y-auto pb-6">
        <BalanceHeader />
        <div className="mt-6">
          <ModeCarousel onSelect={onSelect} />
        </div>
        <Leaderboard />
      </main>
      <BottomNav />
      <SetupSheet open={open} mode={selected} onClose={() => setOpen(false)} />
    </div>
  );
}
