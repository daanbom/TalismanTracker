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

**Static content** (e.g. the House Rules page) lives in `src/data/` as plain JS constants and is imported directly by the page component. Use this for low-churn content where a DB round-trip isn't worth it; migrate to a table if the content starts changing frequently.

**House Rules** is a chooser landing at `/house-rules` with two sub-pages: `/house-rules/rules` (the fellowship's house-rules text, from `HOUSE_RULES` in `src/data/houseRules.js`) and `/house-rules/rulebooks` (official PDFs grouped by core/corner/small, from `RULEBOOKS` in the same file). Each rulebook entry carries `slug`, `subtitle`, `type` (`pdf`/`web`), `group`, and `icon` — the icon key maps to an inline SVG defined in `Rulebooks.jsx`.

## Database

Tables: `players`, `characters` (seed), `endings` (seed), `games`, `game_players`, `game_highscores`, `game_expansion_events`, `icons` (seed, characters + Toad), `encounter_scores`, `tierlists`. Full schema in `EDD.md`.

**Tierlists** are per-player and stored as a single JSONB column (`{S:[],A:[],B:[],C:[],D:[],F:[]}` of icon keys) on the `tierlists` table with a unique `player_id`. The Tierlist page (`/players/:id/tierlist`) sources characters from the `icons` table (so Toad is rankable) and filters dangling keys on load. Drag/drop uses HTML5 native DnD — no third-party library.

Migrations live in `supabase/migrations/` and are applied via Supabase CLI. Seed data (characters, endings) is included in the initial migration.

### Supabase workflow

- The project is linked to a hosted Supabase instance — there is no local docker DB. All changes go directly to the hosted project.
- Schema changes are made by creating a new migration file in `supabase/migrations/` named `YYYYMMDDHHMMSS_short_description.sql`, then running `npx supabase db push` to apply it.
- **Never** modify existing migration files that are already applied remotely — always add a new one. The remote `schema_migrations` table tracks applied versions, and `db push` errors if local files don't match remote history.
- **Never** delete migration files from `supabase/migrations/` unless they've also been reverted on the remote. Deleted local files cause `db push` to fail with "Remote migration versions not found".
- If `db push` complains about missing local migrations, restore them from git (`git checkout -- supabase/migrations/<file>`) rather than repairing history as reverted.
- Destructive or risky migrations (dropping columns, renaming tables, backfills) should be confirmed with the user before running `db push`.

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
