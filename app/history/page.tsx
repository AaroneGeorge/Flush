"use client";

import { BottomNav } from "@/components/layout/BottomNav";

export default function HistoryPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 px-5 pt-6">
        <h1 className="text-2xl font-semibold">Activity</h1>
        <div className="mt-16 flex flex-col items-center text-center text-muted">
          <span className="text-4xl">🗂️</span>
          <p className="mt-3 text-sm">No hands yet</p>
          <p className="mt-1 max-w-[220px] text-xs text-muted-dim">
            Your recent games and hand history will show up here.
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
