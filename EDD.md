# Talisman Tracker — Engineering Design Document

**Version:** 0.1  
**Date:** 2026-04-11

---

## Architecture Overview

```
Browser (React + Vite)
    │
    ├── Supabase JS Client (direct DB queries, no custom API layer)
    │       └── Supabase (PostgreSQL + PostgREST + Auth-ready)
    │
    └── Netlify (static hosting + CD from GitHub)
```

No custom backend. The React app talks directly to Supabase via the JS client. Supabase's Row Level Security (RLS) is disabled for MVP (no auth), enabled later when auth is added.

---

## Database Schema

### `players`
| Column       | Type        | Notes              |
|--------------|-------------|---------------------|
| id           | uuid PK     | gen_random_uuid()  |
| name         | text UNIQUE | case-insensitive    |
| created_at   | timestamptz | default now()       |

### `characters` *(seed/reference data)*
| Column    | Type    | Notes                                      |
|-----------|---------|--------------------------------------------|
| id        | uuid PK |                                            |
| name      | text    |                                            |
| expansion | text    | 'base', 'reaper', 'dungeon', 'highland', 'sacred_pool', 'harbinger', 'frostmarch', 'nether', 'clockwork', 'blood_moon', 'city', 'woodland' |

### `endings` *(seed/reference data)*
| Column    | Type    | Notes              |
|-----------|---------|--------------------|
| id        | uuid PK |                    |
| name      | text    |                    |
| expansion | text    | same enum as above |

### `games`
| Column     | Type        | Notes                    |
|------------|-------------|--------------------------|
| id         | uuid PK     | gen_random_uuid()        |
| date       | date        |                          |
| ending_id  | uuid FK     | → endings.id             |
| notes      | text        | nullable                 |
| created_at | timestamptz | default now()            |
| updated_at | timestamptz | updated on every edit    |

### `game_players`
| Column            | Type      | Notes                                              |
|-------------------|-----------|----------------------------------------------------|
| id                | uuid PK   |                                                    |
| game_id           | uuid FK   | → games.id ON DELETE CASCADE                       |
| player_id         | uuid FK   | → players.id                                       |
| characters_played | text[]    | ordered array — index 0 = first character played   |
| total_deaths      | int       | aggregate across all characters                    |
| is_winner         | boolean   | default false                                      |
| winning_character | text      | nullable — only set when is_winner = true          |

Constraint: exactly one `is_winner = true` per `game_id` (enforced at app layer in MVP, DB constraint later).

### `game_highscores`
| Column   | Type    | Notes                                                              |
|----------|---------|--------------------------------------------------------------------|
| id       | uuid PK |                                                                    |
| game_id  | uuid FK | → games.id ON DELETE CASCADE                                       |
| player_id| uuid FK | → players.id                                                       |
| category | text    | enum: 'most_coins', 'most_followers', 'most_objects', 'most_denizens_on_spot' |
| value    | numeric |                                                                    |

One row per category per game. Category is optional — only inserted if filled in.

### `game_expansion_events`
| Column     | Type    | Notes                                             |
|------------|---------|---------------------------------------------------|
| id         | uuid PK |                                                   |
| game_id    | uuid FK | → games.id ON DELETE CASCADE                      |
| expansion  | text    | 'woodland', 'dungeon'                             |
| event_type | text    | 'path_completed', 'dungeon_beaten'                |
| detail     | text    | nullable — e.g. path name, floor number           |

---

## Frontend Structure

```
src/
├── main.jsx
├── App.jsx                  # Router setup
├── supabaseClient.js        # Supabase init (env vars)
│
├── pages/
│   ├── Home.jsx
│   ├── LogGame.jsx          # Multi-step form (wraps steps)
│   ├── EditGame.jsx         # Reuses LogGame form pre-filled
│   ├── Leaderboard.jsx
│   ├── HighscoresBoard.jsx
│   ├── GameHistory.jsx
│   ├── GameDetail.jsx
│   └── Players.jsx
│
├── components/
│   ├── log-game/
│   │   ├── StepGameSetup.jsx
│   │   ├── StepPlayers.jsx
│   │   ├── StepPerPlayer.jsx
│   │   ├── StepHighscores.jsx
│   │   ├── StepExpansionEvents.jsx
│   │   └── StepReview.jsx
│   ├── AddPlayerModal.jsx
│   ├── CharacterSelect.jsx   # Ordered character list input
│   ├── EndingSelect.jsx      # Type-ahead dropdown
│   └── Leaderboard/
│       ├── LeaderboardTable.jsx
│       └── HighscoreTable.jsx
│
├── hooks/
│   ├── usePlayers.js
│   ├── useCharacters.js
│   ├── useEndings.js
│   ├── useGames.js
│   └── useLeaderboardStats.js
│
└── lib/
    └── statsHelpers.js       # Win rate calc, avg deaths, etc.
```

---

## Routing

| Path               | Component        | Notes                          |
|--------------------|------------------|--------------------------------|
| `/`                | Home             |                                |
| `/log`             | LogGame          | New game form                  |
| `/games/:id/edit`  | EditGame         | Pre-filled log game form       |
| `/leaderboard`     | Leaderboard      |                                |
| `/highscores`      | HighscoresBoard  |                                |
| `/history`         | GameHistory      |                                |
| `/games/:id`       | GameDetail       |                                |
| `/players`         | Players          |                                |

Router: `react-router-dom` v6.

---

## Multi-Step Form State

The Log Game form spans 6 steps. State lives in a parent component (`LogGame.jsx`) and is passed down to each step via props + callbacks. No global store needed — form state is local to the page.

```js
// Shape of form state
{
  date: '',
  ending_id: '',
  notes: '',
  players: [uuid, uuid, ...],        // selected player ids in order
  playerData: {
    [player_id]: {
      characters_played: ['Warrior', 'Elf'],
      total_deaths: 2,
      is_winner: false,
      winning_character: null
    }
  },
  highscores: {
    most_coins:           { player_id: uuid, value: 47 },
    most_followers:       { player_id: uuid, value: 5 },
    most_objects:         { player_id: uuid, value: 8 },
    most_denizens_on_spot:{ player_id: uuid, value: 3 }
  },
  expansionEvents: {
    woodland: { paths_completed: ['Sylvan Path', 'Ancient Way'] },
    dungeon:  { beaten: true, detail: 'Floor 4' }
  }
}
```

On submit, the form writes in a single async sequence:
1. Insert `games` → get `game_id`
2. Insert all `game_players` rows
3. Insert filled `game_highscores` rows (skip empty)
4. Insert `game_expansion_events` rows (skip empty)

On edit, the form:
1. Fetches existing game data and pre-fills state
2. On submit: updates `games`, deletes + re-inserts child rows (game_players, highscores, expansion_events)

---

## Data Fetching

Using **TanStack Query** (`@tanstack/react-query`) for all reads. Supabase JS client for writes.

Key queries:
- `usePlayers()` — full player list, cached, invalidated on add
- `useCharacters()` — full character list by expansion, long cache (seed data rarely changes)
- `useEndings()` — same as characters
- `useGames()` — paginated game list for history
- `useGame(id)` — single game with all relations joined
- `useLeaderboardStats()` — aggregated per-player stats (games played, wins, deaths, most played character)
- `useHighscoreRecords()` — max value per category with player + game info

Leaderboard stats are computed via a Supabase SQL view or computed client-side from raw game_players data (start client-side, move to view when it becomes slow).

---

## Key Libraries

| Library                  | Purpose                          |
|--------------------------|----------------------------------|
| react-router-dom v6      | Routing                          |
| @tanstack/react-query    | Server state / data fetching     |
| @supabase/supabase-js    | DB client                        |
| react-hook-form          | Form state + validation          |
| tailwindcss              | Styling                            |
| combobox (headlessui)    | Type-ahead ending/character select |

No component library for MVP — styling with **Tailwind CSS**.

---

## Environment Variables

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Set in Netlify dashboard for production. Local `.env.local` for dev (gitignored).

---

## Deployment

- `main` branch → auto-deploy to Netlify production
- PRs → Netlify preview deployments
- Supabase project: single environment for MVP (add staging branch later if needed)

---

## Migrations

Supabase migrations tracked in `supabase/migrations/`. Applied via Supabase CLI.

Initial migration creates all tables + seed data (characters, endings).

---

## Out of Scope (EDD)

- Auth / RLS policies
- Edge Functions (no server logic needed in MVP)
- Real-time subscriptions
- Audit log for edits
