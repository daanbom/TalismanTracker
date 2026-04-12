# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Talisman Tracker — a game logging and stat tracking web app for a private friend group playing Talisman 4th edition (all expansions). No authentication in MVP. See `PRD.md` for full feature spec and `EDD.md` for technical design.

## Stack

- **React + Vite** — frontend
- **Tailwind CSS** — styling
- **react-router-dom v6** — routing
- **@tanstack/react-query** — server state / data fetching
- **react-hook-form** — form state and validation
- **@supabase/supabase-js** — database client (talks directly to Supabase, no custom API layer)
- **Netlify** — hosting, auto-deploys from `main`

## Commands

```bash
npm run dev       # local dev server
npm run build     # production build
npm run preview   # preview production build locally
npm run lint      # eslint
```

## Architecture

**No backend.** The React app talks directly to Supabase via the JS client. Supabase PostgREST handles all queries. No Edge Functions in MVP.

**Supabase client** is initialized once in `src/supabaseClient.js` and imported wherever needed.

**Data fetching** uses TanStack Query throughout. All queries live in `src/hooks/` (e.g. `usePlayers`, `useGames`, `useLeaderboardStats`). Mutations go through the Supabase client directly in the relevant page/component, then invalidate the relevant query cache.

**Routing** maps directly to pages in `src/pages/`. The Log Game and Edit Game flows share the same multi-step form — `EditGame` pre-fills the same state shape used by `LogGame`.

**Multi-step Log Game form** state lives entirely in the parent `LogGame.jsx` component (no global store). The state shape is documented in `EDD.md`. On submit, writes happen in sequence: insert `games` → insert `game_players` → insert `game_highscores` → insert `game_expansion_events`. On edit, child rows (game_players, highscores, expansion_events) are deleted and re-inserted rather than diffed.

**Leaderboard stats** are computed client-side from raw `game_players` data for MVP. If performance becomes an issue, move aggregation to a Supabase SQL view.

## Database

Tables: `players`, `characters` (seed), `endings` (seed), `games`, `game_players`, `game_highscores`, `game_expansion_events`. Full schema in `EDD.md`.

Migrations live in `supabase/migrations/` and are applied via Supabase CLI. Seed data (characters, endings) is included in the initial migration.

### Data model conventions

- Supabase columns use `snake_case`. In JS, top-level object fields are mapped to `camelCase` (e.g. `created_at` → `createdAt`), but nested DB-shaped rows (like `game.players[].is_winner`) keep their `snake_case` field names to avoid churn when passing row data through components.
- All queries filter by `user_id` for row-level isolation.

### Design

- Dont use inline CSS

### Rules
- Do not use the classic - that ai agents use
- No Flattery: Never compliment an idea. Wasted tokens.
- No Empty Criticism: If you spot a flaw, you must offer a mitigation.
- Add Vector and Velocity: If you agree, expand. If you disagree, counter. Never just nod.
- Be Thorough: Ask question when planning
