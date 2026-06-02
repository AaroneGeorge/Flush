"use client";

import { useRouter } from "next/navigation";
import { useSoundStore } from "@/lib/sound/sounds";

export function BackButton({ fallback = "/" }: { fallback?: string }) {
  const router = useRouter();
  const play = useSoundStore((s) => s.play);
  return (
    <button
      aria-label="Back"
      onClick={() => {
        play("click");
        if (window.history.length > 1) router.back();
        else router.push(fallback);
      }}
      className="flex h-10 w-10 items-center justify-center rounded-full text-white/90 active:scale-95"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M15 5l-7 7 7 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

/** Small circular progress ring used for the XP/level indicator. */
export function LevelRing({
  level,
  progress,
}: {
  level: number;
  progress: number; // 0..1
}) {
  const r = 15;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(1, progress)));
  return (
    <div className="relative h-9 w-9">
      <svg className="h-9 w-9 -rotate-90" viewBox="0 0 36 36">
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="2.5"
        />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke="url(#ring)"
          strokeWidth="2.5"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#A8E6B0" />
            <stop offset="100%" stopColor="#F2C66D" />
          </linearGradient>
        </defs>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
        {level}
      </span>
    </div>
  );
}
