"use client";

import { useEffect } from "react";
import { useSoundStore } from "@/lib/sound/sounds";
import { useUserStore } from "@/lib/store/userStore";
import { DesktopSideNav } from "@/components/layout/BottomNav";
import { formatChips } from "@/lib/utils/format";

export function MobileFrame({ children }: { children: React.ReactNode }) {
  const hydrateSound = useSoundStore((s) => s.hydrate);
  const hydrateUser = useUserStore((s) => s.hydrate);
  const avatar = useUserStore((s) => s.avatar);
  const username = useUserStore((s) => s.username);
  const level = useUserStore((s) => s.level);
  const balance = useUserStore((s) => s.balance);

  useEffect(() => {
    hydrateSound();
    hydrateUser();
  }, [hydrateSound, hydrateUser]);

  return (
    <div className="flex h-[100dvh] w-full justify-center bg-[#050506] lg:desktop-felt lg:justify-start">
      {/* ── Desktop sidebar ───────────────────────────────────────── */}
      <aside className="hidden lg:flex lg:w-56 xl:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-white/[0.06] lg:bg-black/70 lg:backdrop-blur-md">
        {/* Branding */}
        <div className="flex items-center gap-2.5 px-5 pb-3 pt-6">
          <span className="text-2xl leading-none">♠</span>
          <span className="text-xl font-bold tracking-tight">Flush</span>
        </div>

        {/* User info card */}
        <div className="px-3 pb-3">
          <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-base leading-none">
              {avatar}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium leading-tight">
                {username}
              </p>
              <p className="text-[11px] leading-tight text-muted">
                Lv. {level} · {formatChips(balance)}
              </p>
            </div>
          </div>
        </div>

        <div className="mx-4 h-px bg-white/[0.06]" />
        <DesktopSideNav />

        <div className="mt-auto border-t border-white/[0.06] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-mint" />
            <p className="text-[11px] text-muted">Onchain · Devnet</p>
          </div>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────── */}
      <div className="relative flex h-[100dvh] w-full max-w-[440px] flex-col overflow-hidden bg-black lg:max-w-none lg:flex-1">
        {children}
      </div>
    </div>
  );
}
