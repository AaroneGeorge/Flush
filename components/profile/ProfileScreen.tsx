"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useUserStore } from "@/lib/store/userStore";
import { useSoundStore } from "@/lib/sound/sounds";
import { AVATARS } from "@/lib/data/avatars";
import { formatChips } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 rounded-2xl border border-white/8 bg-ink-800 px-3 py-3 text-center">
      <p className="numeral text-xl font-semibold">{value}</p>
      <p className="mt-0.5 text-[11px] text-muted">{label}</p>
    </div>
  );
}

export function ProfileScreen() {
  const user = useUserStore();
  const { muted, toggleMute, play } = useSoundStore();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.username);
  const [connecting, setConnecting] = useState(false);

  const winRate =
    user.handsPlayed > 0
      ? Math.round((user.handsWon / user.handsPlayed) * 100)
      : 0;
  const progress = (user.xp % 500) / 500;

  const saveName = () => {
    const trimmed = name.trim() || "you";
    user.setUsername(trimmed);
    setName(trimmed);
    setEditing(false);
    play("click");
  };

  const connect = async () => {
    play("click");
    setConnecting(true);
    await user.connectWallet();
    setConnecting(false);
  };

  return (
    <div className="no-scrollbar flex-1 overflow-y-auto px-5 pb-8 pt-6">
      <h1 className="text-2xl font-semibold">Profile</h1>

      {/* Avatar + name */}
      <div className="mt-6 flex flex-col items-center">
        <motion.div
          key={user.avatar}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="flex h-24 w-24 items-center justify-center rounded-full bg-ink-700 text-5xl shadow-glow"
        >
          {user.avatar}
        </motion.div>

        {editing ? (
          <div className="mt-3 flex items-center gap-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveName()}
              maxLength={16}
              className="w-40 rounded-pill border border-white/12 bg-ink-800 px-4 py-2 text-center text-sm outline-none focus:border-mint/50"
            />
            <button
              onClick={saveName}
              className="rounded-pill bg-mint/15 px-3 py-2 text-sm font-medium text-mint"
            >
              Save
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setEditing(true); play("click"); }}
            className="mt-3 flex items-center gap-1.5 text-lg font-medium"
          >
            {user.username}
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-muted">
              <path d="M4 20h4L18 10l-4-4L4 16v4ZM14 6l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* Level bar */}
        <div className="mt-3 w-48">
          <div className="flex justify-between text-[11px] text-muted">
            <span>Level {user.level}</span>
            <span>{user.xp % 500}/500 XP</span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-mint to-amber-300"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-7 flex gap-2.5">
        <StatTile label="Balance" value={formatChips(user.balance)} />
        <StatTile label="Hands" value={String(user.handsPlayed)} />
        <StatTile label="Win rate" value={`${winRate}%`} />
      </div>

      {/* Avatar picker */}
      <section className="mt-7">
        <h2 className="mb-3 text-sm font-semibold text-white/80">Avatar</h2>
        <div className="grid grid-cols-6 gap-2">
          {AVATARS.map((a) => (
            <button
              key={a}
              onClick={() => { user.setAvatar(a); play("click"); }}
              className={cn(
                "flex aspect-square items-center justify-center rounded-2xl bg-ink-800 text-2xl transition-all active:scale-90",
                user.avatar === a
                  ? "ring-2 ring-mint"
                  : "border border-white/5"
              )}
            >
              {a}
            </button>
          ))}
        </div>
      </section>

      {/* Settings */}
      <section className="mt-7 space-y-2.5">
        <button
          onClick={() => { toggleMute(); play("click"); }}
          className="flex w-full items-center justify-between rounded-2xl border border-white/8 bg-ink-800 px-4 py-3.5"
        >
          <span className="text-sm">Sound effects</span>
          <span
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              muted ? "bg-white/15" : "bg-mint/70"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all",
                muted ? "left-0.5" : "left-[22px]"
              )}
            />
          </span>
        </button>

        <button
          onClick={connect}
          disabled={connecting || !!user.walletAddress}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-semibold",
            user.walletAddress
              ? "border border-mint/30 text-mint"
              : "bg-white text-black active:scale-[0.99]"
          )}
        >
          {connecting
            ? "Connecting…"
            : user.walletAddress
              ? `Connected · ${user.walletAddress}`
              : "Connect Wallet"}
        </button>
      </section>
    </div>
  );
}
