/** Emoji-style avatar set. Using emoji keeps the demo asset-free; swap for
 * image URLs later without touching call sites. */
export const AVATARS = [
  "🧑🏻", "🧑🏽", "🧑🏿", "👨🏻", "👨🏽", "👨🏿",
  "👩🏻", "👩🏽", "👩🏿", "🧔🏻", "🧑🏼‍🦱", "👨🏻‍🦰",
  "🧑🏾", "👱🏻", "👴🏻", "🧑🏻‍🦲", "👩🏻‍🦱", "🧑🏼",
];

export function avatarFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return AVATARS[Math.abs(h) % AVATARS.length];
}
