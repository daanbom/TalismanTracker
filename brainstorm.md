# Talisman Tracker — Brainstorm

## Concept
A game tracker for a friend group playing Talisman 4th edition (all expansions). Log games, track stats, view leaderboards and highscores. No login required for MVP.

## Tech Stack
- React + Vite (frontend)
- Netlify (hosting)
- Supabase (database + backend)
- GitHub (source control)

## Core Requirements

### Players
- Global player list anyone can add to via "Add Player" button
- Players selected from list when logging (no freeform — prevents duplicates)

### Log a Game (no login required)
- Designated recorder fills in one form
- Date + ending type (type-ahead dropdown) + optional notes
- 2–5 players selected from registered list
- Per player: ordered list of characters played, total deaths, winner flag
- Winner also records which character they won with
- Highscores section: most coins, followers, objects, denizens on spot (per-game records, optional)
- Expansion events: Woodland paths completed, Dungeon beaten

### Leaderboard
- Games played, wins, win rate, total deaths, avg deaths, most played character
- Sortable columns

### Highscores Board
- All-time per-game records per category (coins, followers, objects, denizens, etc.)

### Game History + Game Detail
- Full log of all games with drill-down view

## Key Design Decisions
- No auth in MVP — all game logging and player creation is open
- Games are editable by any visitor, no delete
- Highscores are per-game records, not cumulative totals
- Characters tracked in order played, deaths tracked as aggregate per player per game
- Ending type is a dropdown (base + all alternate endings from expansions)

## Future Scope
- Authentication + account claiming for retroactive game attribution
- Per-character win rates
- More expansion-specific tracking
- Achievement/badge system
- Live session tracker (turn-by-turn)
- More pages and stats

## Reference
See PRD.md for full specification.
