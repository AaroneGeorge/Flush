# Flush — Onchain Poker

A mobile-first, dark-mode UI for a multiplayer onchain (Solana) poker app.
Clean, professional, with subtle motion and sound. This pass is the **UI +
interactive local game engine**; wallet and real-time multiplayer are mocked
behind clean seams for a later pass.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **Tailwind CSS** for styling (theme tokens in `tailwind.config.ts`)
- **Framer Motion** for transitions / card deals
- **Zustand** for game + user state
- WebAudio synth for subtle, asset-free sound cues (muted by default)

## Run

```bash
npm install
npm run dev      # http://localhost:3000  — view at a ~390px mobile viewport
npm run build    # production build
```

## Routes

| Route          | Screen                                                            |
| -------------- | ----------------------------------------------------------------- |
| `/`            | Home — balance, Cash Games hero, buy-in mode carousel, leaderboard |
| `/room/[id]`   | Poker table — opponents, board, odds, action bar, hand rankings   |
| `/profile`     | Profile — avatar/username, stats, sound toggle, wallet connect    |
| `/history`     | Activity placeholder                                              |

Selecting a mode on the home screen opens the stakes/buy-in ruler sheet, which
launches a room with query params (`mode`, `buyIn`, `seats`, `public`).

## Architecture

- `lib/poker/` — pure Texas Hold'em engine
  - `evaluator.ts` — 7-card best-5 hand evaluator → category + comparable score
  - `engine.ts` — deck, dealing, betting state machine, side-pot showdown
  - `odds.ts` — Monte-Carlo win% / made-hand% for the live odds card
  - `bots.ts` — heuristic opponents (equity + pot odds + jitter)
- `lib/store/`
  - `gameStore.ts` — drives the engine, bot turn timing, odds, and sounds
  - `userStore.ts` — mocked balance/profile/XP. **Solana seam:** `connectWallet`
    and `balance` are placeholders to swap for `@solana/wallet-standard`.
- `lib/sound/sounds.ts` — global mute (persisted) + WebAudio cues
- `components/` — `layout/`, `home/`, `setup/`, `table/`, `profile/`

## Seams for later

- **Wallet / balance:** replace `userStore.connectWallet` with a real
  wallet-standard connection; source `balance` from the token account.
- **Multiplayer / onchain:** `gameStore` actions are structured so the local
  engine can be replaced with server / on-chain calls without UI changes.

## Out of scope (this pass)

Real Solana transactions, real-time networking, auth, persistence beyond
`localStorage`.
