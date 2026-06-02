import { avatarFor } from "./avatars";

export interface LeaderEntry {
  rank: number;
  name: string;
  xp: number;
  avatar: string;
}

const NAMES = [
  "bbreezy13",
  "zesty_bat",
  "maxence5407",
  "vmorrasss",
  "gang-gang",
  "tete264",
  "clewelyn",
  "jbird33",
  "skinhead",
  "kinglo",
  "great_maul",
  "nova_rae",
  "pocket_rkt",
  "river_run",
  "allin_amy",
];

const XP = [
  8869, 3296, 2508, 1914, 834, 712, 640, 588, 503, 431, 366, 290, 221, 158, 92,
];

export const LEADERBOARD: LeaderEntry[] = NAMES.map((name, i) => ({
  rank: i + 1,
  name,
  xp: XP[i] ?? Math.max(20, 80 - i * 5),
  avatar: avatarFor(name),
}));

/** A pool of opponent names/avatars for filling a table. */
export const BOT_POOL = NAMES.map((name) => ({
  name,
  avatar: avatarFor(name),
}));
