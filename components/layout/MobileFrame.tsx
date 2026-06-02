"use client";

import { useEffect } from "react";
import { useSoundStore } from "@/lib/sound/sounds";
import { useUserStore } from "@/lib/store/userStore";

/**
 * Constrains the app to a phone-sized column and centers it on larger screens.
 * The brief is mobile-first, so this is the canonical viewport.
 */
export function MobileFrame({ children }: { children: React.ReactNode }) {
  const hydrateSound = useSoundStore((s) => s.hydrate);
  const hydrateUser = useUserStore((s) => s.hydrate);

  useEffect(() => {
    hydrateSound();
    hydrateUser();
  }, [hydrateSound, hydrateUser]);

  return (
    <div className="flex h-[100dvh] w-full justify-center bg-[#050506]">
      <div className="relative flex h-[100dvh] w-full max-w-[440px] flex-col overflow-hidden bg-black">
        {children}
      </div>
    </div>
  );
}
