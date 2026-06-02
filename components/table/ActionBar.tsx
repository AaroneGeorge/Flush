"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "@/lib/store/gameStore";
import { useSoundStore } from "@/lib/sound/sounds";
import { formatChips } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export function ActionBar() {
  const table = useGameStore((s) => s.table);
  const act = useGameStore((s) => s.act);
  const heroToCall = useGameStore((s) => s.heroToCall);
  const play = useSoundStore((s) => s.play);
  const [raising, setRaising] = useState(false);

  const hero = table?.players.find((p) => p.isHero) ?? null;
  const isHeroTurn =
    !!table &&
    table.stage !== "idle" &&
    table.stage !== "showdown" &&
    table.players[table.currentIndex]?.isHero === true &&
    !!hero &&
    !hero.folded &&
    !hero.allIn;

  const toCall = isHeroTurn ? heroToCall() : 0;
  const bb = table?.bigBlind ?? 2;
  const pot = table?.pot ?? 0;
  const maxBet = hero ? hero.bet + hero.stack : 0;
  const minRaiseTo = (table?.currentBet ?? 0) + (table?.minRaise ?? bb);

  const [raiseTo, setRaiseTo] = useState(minRaiseTo);

  // Reset the raise amount whenever it becomes the hero's turn.
  useEffect(() => {
    if (isHeroTurn) {
      setRaiseTo(Math.min(maxBet, Math.max(minRaiseTo, Math.round(pot * 0.5) || bb)));
      setRaising(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHeroTurn, table?.handNumber, table?.stage, table?.currentBet]);

  if (!table) return null;

  // Disabled "wait" state.
  if (!isHeroTurn) {
    const msg =
      table.stage === "showdown"
        ? "Next hand starting…"
        : hero?.folded
          ? "You folded — wait for the next hand"
          : hero?.allIn
            ? "All in"
            : "Waiting for opponents…";
    return (
      <div className="px-4">
        <div className="flex h-14 w-full items-center justify-center rounded-2xl border border-white/8 text-sm text-muted">
          {msg}
        </div>
      </div>
    );
  }

  const canCheck = toCall === 0;

  const fire = (fn: () => void) => {
    fn();
  };

  const quickBets: { label: string; to: number }[] = [
    { label: "1 BB", to: (table.currentBet || 0) + bb },
    { label: "½ Pot", to: (table.currentBet || 0) + Math.max(bb, Math.round(pot * 0.5)) },
    { label: "Pot", to: (table.currentBet || 0) + Math.max(bb, pot) },
  ];

  return (
    <div className="px-4">
      <AnimatePresence mode="wait">
        {raising ? (
          <motion.div
            key="raise"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="space-y-3"
          >
            {/* Slider row */}
            <div className="flex items-center gap-3">
              <span className="numeral w-12 text-sm font-semibold text-mint">
                {formatChips(raiseTo)}
              </span>
              <input
                type="range"
                min={Math.min(minRaiseTo, maxBet)}
                max={maxBet}
                step={Math.max(1, Math.round(bb / 2))}
                value={raiseTo}
                onChange={(e) => {
                  setRaiseTo(Number(e.target.value));
                  play("click");
                }}
                className="flush-slider h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-white/15"
              />
              <button
                onClick={() => fire(() => { act({ type: "raise", amount: raiseTo }); })}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black active:scale-95"
                aria-label="Confirm raise"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Quick bets */}
            <div className="flex items-center gap-2">
              {quickBets.map((q) => (
                <button
                  key={q.label}
                  onClick={() => { play("click"); setRaiseTo(Math.min(maxBet, q.to)); }}
                  className="flex-1 rounded-pill bg-ink-700 py-2.5 text-xs font-medium text-white/80 active:scale-95"
                >
                  {q.label}
                </button>
              ))}
              <button
                onClick={() => { play("click"); setRaising(false); }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-ink-700 text-white/70"
                aria-label="Cancel raise"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="actions"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="flex items-center gap-2.5"
          >
            <button
              onClick={() => fire(() => act({ type: "fold" }))}
              className="flex-1 rounded-2xl border border-white/8 py-4 text-sm font-medium text-muted active:scale-95"
            >
              Fold
            </button>
            <button
              onClick={() =>
                fire(() => act({ type: canCheck ? "check" : "call" }))
              }
              className={cn(
                "flex-1 rounded-2xl py-4 text-sm font-semibold active:scale-95",
                canCheck
                  ? "border border-white/8 text-white"
                  : "bg-mint/15 text-mint"
              )}
            >
              {canCheck ? "Check" : `Call ${formatChips(toCall)}`}
            </button>
            <button
              onClick={() => {
                play("click");
                if (maxBet <= toCall + table.currentBet) {
                  // can only shove
                  act({ type: "raise", amount: maxBet });
                } else {
                  setRaising(true);
                }
              }}
              className="flex-1 rounded-2xl bg-white py-4 text-sm font-semibold text-black active:scale-95"
            >
              Raise
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
