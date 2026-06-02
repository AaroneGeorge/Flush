"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { useSoundStore } from "@/lib/sound/sounds";

function HistoryIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="4"
        stroke={active ? "#fff" : "#5E6064"}
        strokeWidth="1.8"
      />
      <path
        d="M8 9h8M8 13h5"
        stroke={active ? "#fff" : "#5E6064"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1v-7.5Z"
        stroke={active ? "#fff" : "#5E6064"}
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill={active ? "rgba(255,255,255,0.08)" : "none"}
      />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="8"
        r="3.4"
        stroke={active ? "#fff" : "#5E6064"}
        strokeWidth="1.8"
      />
      <path
        d="M5 19c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5"
        stroke={active ? "#fff" : "#5E6064"}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

const TABS = [
  { href: "/history", Icon: HistoryIcon, label: "Activity", badge: true },
  { href: "/", Icon: HomeIcon, label: "Home" },
  { href: "/profile", Icon: ProfileIcon, label: "Profile" },
];

export function DesktopSideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const play = useSoundStore((s) => s.play);

  return (
    <nav className="flex flex-col gap-0.5 p-3 pt-4">
      {TABS.map(({ href, Icon, label, badge }) => {
        const active = pathname === href;
        return (
          <button
            key={href}
            aria-label={label}
            onClick={() => {
              play("click");
              router.push(href);
            }}
            className={cn(
              "relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors text-left w-full",
              active
                ? "bg-white/10 text-white"
                : "text-[#5E6064] hover:bg-white/[0.05] hover:text-white/70"
            )}
          >
            <Icon active={active} />
            <span>{label}</span>
            {/* Show badge dot only when not on this tab; indicator when active */}
            {badge && !active && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-coral" />
            )}
            {active && (
              <motion.span
                layoutId="side-nav-indicator"
                className="ml-auto h-1.5 w-1.5 rounded-full bg-white"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const play = useSoundStore((s) => s.play);

  return (
    <nav className="sticky bottom-0 z-30 border-t border-white/8 bg-black/90 backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-around px-6 pb-6 pt-3">
        {TABS.map(({ href, Icon, label, badge }) => {
          const active = pathname === href;
          return (
            <button
              key={href}
              aria-label={label}
              onClick={() => {
                play("click");
                router.push(href);
              }}
              className="relative flex h-11 w-16 items-center justify-center"
            >
              <Icon active={active} />
              {badge && (
                <span className="absolute right-3 top-1 h-1.5 w-1.5 rounded-full bg-coral" />
              )}
              {active && (
                <motion.span
                  layoutId="nav-dot"
                  className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-white"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
