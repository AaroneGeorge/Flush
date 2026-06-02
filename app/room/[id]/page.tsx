"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { BackButton } from "@/components/layout/TopBar";
import { OpponentSeat, EmptySeat } from "@/components/table/OpponentSeat";
import { CommunityCards } from "@/components/table/CommunityCards";
import { HoleCards } from "@/components/table/HoleCards";
import { OddsCard } from "@/components/table/OddsCard";
import { ActionBar } from "@/components/table/ActionBar";
import { HandRankingsSheet } from "@/components/table/HandRankingsSheet";
import { useGameStore } from "@/lib/store/gameStore";
import { useSoundStore } from "@/lib/sound/sounds";
import { modeById } from "@/lib/data/modes";
import { formatChips } from "@/lib/utils/format";
import { evaluate } from "@/lib/poker/evaluator";
import { Player } from "@/lib/poker/engine";
import { Card } from "@/lib/poker/types";

export default function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const search = useSearchParams();
  const init = useGameStore((s) => s.init);
  const reset = useGameStore((s) => s.reset);
  const table = useGameStore((s) => s.table);
  const odds = useGameStore((s) => s.odds);
  const { muted, toggleMute } = useSoundStore();
  const [showRankings, setShowRankings] = useState(false);

  useEffect(() => {
    const mode = modeById(search.get("mode") ?? "micro");
    const buyIn = Number(search.get("buyIn")) || mode.maxBuyIn;
    const seats = Math.min(6, Number(search.get("seats")) || 6);
    const isPublic = (search.get("public") ?? "1") === "1";
    init(mode, buyIn, seats, isPublic);
    return () => reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hero = table?.players.find((p) => p.isHero) ?? null;
  const opponents = table?.players.filter((p) => !p.isHero) ?? [];
  const winnerIds = new Set(table?.winners?.map((w) => w.id) ?? []);
  const heroWon = !!hero && winnerIds.has(hero.id);
  const heroWin = table?.winners?.find((w) => w.id === hero?.id);

  // At showdown, reveal hole cards of everyone still in the hand (didn't fold)
  // so other players can verify the result.
  const isShowdown = table?.stage === "showdown";
  const handLabel = (hole: Card[]): string | undefined => {
    if (!table) return undefined;
    const cards = [...hole, ...table.board];
    if (cards.length < 5) return undefined;
    try {
      return evaluate(cards).label;
    } catch {
      return undefined;
    }
  };
  const shouldReveal = (p: Player) =>
    isShowdown && !p.folded && !p.sittingOut && p.hole.length === 2;
  const heroLabel =
    hero && shouldReveal(hero) ? handLabel(hero.hole) : undefined;

  return (
    <div className="felt relative flex h-full flex-col lg:mx-auto lg:w-full lg:max-w-3xl">
      {/* Top bar */}
      <div className="flex items-center justify-between px-2 pt-3">
        <BackButton />
        <span className="text-sm font-medium text-white/80">
          Room {id.toUpperCase()}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowRankings(true)}
            aria-label="Hand rankings"
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/70"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
              <path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-.9.6-.9 1.2v.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <circle cx="12" cy="16.5" r="0.9" fill="currentColor" />
            </svg>
          </button>
          <button
            onClick={toggleMute}
            aria-label={muted ? "Unmute" : "Mute"}
            className="flex h-10 w-10 items-center justify-center rounded-full text-white/70"
          >
            {muted ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 9v6h4l5 4V5L8 9H4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                <path d="M17 9l4 6M21 9l-4 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 9v6h4l5 4V5L8 9H4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Opponents — up to 5 seats spread evenly across the rail */}
      <div className="mt-2 flex flex-wrap items-start justify-center gap-x-2 gap-y-1 px-3 pb-1">
        {opponents.map((p) => {
          const idx = table!.players.findIndex((x) => x.id === p.id);
          const reveal = shouldReveal(p);
          return (
            <OpponentSeat
              key={p.id}
              player={p}
              active={table!.currentIndex === idx && table!.stage !== "showdown"}
              isDealer={table!.dealerIndex === idx}
              isWinner={winnerIds.has(p.id)}
              revealCards={reveal ? p.hole : undefined}
              revealLabel={reveal ? handLabel(p.hole) : undefined}
            />
          );
        })}
        {opponents.length === 0 && <EmptySeat />}
      </div>

      {/* Board */}
      <div className="flex flex-1 flex-col items-center justify-center px-4">
        {table ? (
          <CommunityCards
            board={table.board}
            pot={table.pot}
            stage={table.stage}
          />
        ) : (
          <p className="text-sm text-muted">Seating players…</p>
        )}

        {/* Winner banner */}
        <AnimatePresence>
          {table?.stage === "showdown" && table.winners && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mt-5 rounded-2xl border border-mint/30 bg-ink-800/90 px-5 py-2.5 text-center"
            >
              {heroWon ? (
                <p className="text-sm font-semibold text-mint">
                  You win {formatChips(heroWin?.amount ?? 0)}
                  {heroWin?.label ? ` · ${heroWin.label}` : ""}
                </p>
              ) : (
                <p className="text-sm text-white/80">
                  {table.players.find((p) => winnerIds.has(p.id))?.name} wins
                  {table.winners[0]?.label ? ` · ${table.winners[0].label}` : ""}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hero zone */}
      <div className="space-y-4 pb-7 pt-2">
        <ActionBar />

        <div className="flex items-end justify-between px-4">
          <div className="relative">
            <HoleCards
              cards={hero?.hole ?? []}
              folded={hero?.folded ?? false}
            />
            {hero && (
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-xl">{hero.avatar}</span>
                <span className="numeral text-sm font-semibold">
                  {formatChips(hero.stack)}
                </span>
                {heroLabel && (
                  <span className="rounded-pill bg-mint/15 px-2 py-0.5 text-[11px] font-semibold text-mint">
                    {heroLabel}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <OddsCard odds={hero && !hero.folded ? odds : null} />
            <button
              aria-label="Reactions"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-700 text-lg active:scale-95"
            >
              🙂
            </button>
          </div>
        </div>
      </div>

      <HandRankingsSheet
        open={showRankings}
        onClose={() => setShowRankings(false)}
      />
    </div>
  );
}
