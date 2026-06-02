/** Format a chip / token amount like the screenshots: 1000 -> "1K", 100000 -> "100K". */
export function formatChips(n: number): string {
  if (n < 1000) return `${Math.round(n)}`;
  if (n < 1_000_000) {
    const k = n / 1000;
    // 1K, 1.5K, 10K, 100K — keep it tight
    return `${k % 1 === 0 ? k : k.toFixed(1)}K`;
  }
  const m = n / 1_000_000;
  return `${m % 1 === 0 ? m : m.toFixed(1)}M`;
}

/** Compact XP like "8,869 XP". */
export function formatXp(n: number): string {
  return `${n.toLocaleString("en-US")} XP`;
}

export function formatPct(n: number): string {
  return `${Math.round(n)}%`;
}
