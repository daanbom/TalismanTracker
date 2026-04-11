# Talisman Tracker — Product Requirements Document

**Version:** 0.1  
**Date:** 2026-04-11  
**Scope:** MVP (no auth)

---

## Overview

A web app for a friend group to log and track games of Talisman (4th edition, all expansions). Anyone can log a game. Stats and highscores are visible to everyone. No login required for MVP.

---

## Tech Stack

| Layer      | Choice         |
|------------|----------------|
| Frontend   | React + Vite   |
| Hosting    | Netlify        |
| Backend/DB | Supabase       |
| Source     | GitHub         |

---

## Core Entities

### Players
A global registered player list. Anyone can add a new player via an "Add Player" button. Players are selected from this list when logging a game (not freeform entry — prevents duplicates).

Fields: `id`, `name`, `created_at`

### Games
One record per game session.

Fields: `id`, `date`, `player_count`, `ending_type`, `notes`, `created_at`

### Game Participants
Links players to a game. Tracks what each player did in that game.

Fields:
- `game_id`, `player_id`
- `characters_played` — ordered list of character names (first to last)
- `total_deaths` — aggregate across all characters in that game
- `is_winner` — boolean
- `winning_character` — which character they were playing when they won

### Highscores (per game)
Records notable per-game achievements. Each row is one category record for one player in one game.

Fields: `game_id`, `player_id`, `category`, `value`

Categories (initial set):
- `most_coins`
- `most_followers`
- `most_objects`
- `most_denizens_on_spot`
- *(expandable — add more categories later)*

### Expansion Events
Tracks expansion-specific milestones within a game.

Fields: `game_id`, `expansion`, `detail`

Examples:
- Woodland: path completed (which path)
- Dungeon: dungeon beaten (which floor / cleared flag)

---

## Pages

### 1. Home
- Brief intro / logo
- Quick links: Log a Game, Leaderboard, Highscores, Game History

### 2. Log Game
Multi-step form filled by one designated recorder.

**Step 1 — Game Setup**
- Date picker (defaults to today)
- Ending type: type-ahead dropdown (base endings + alternate endings from all expansions)
- Optional notes field

**Step 2 — Players**
- Select 2–5 players from the registered player list
- "Add new player" inline button if someone is missing

**Step 3 — Per Player Data**
For each selected player:
- Characters played (ordered list — add in sequence, e.g., "Warrior → Elf → Monk")
- Total deaths across all characters
- Mark as winner (radio — only one winner)
- If winner: auto-fills winning character from their last character, overridable

**Step 4 — Highscores**
- For each highscore category: select which player holds it in this game + enter the value
- All categories optional — only fill what's relevant

**Step 5 — Expansion Events**
- Woodland: which paths were completed (checklist or multi-select)
- Dungeon: was the dungeon beaten? (toggle + optional floor/detail)
- Other expansions: expandable in future

**Step 6 — Review & Submit**
- Summary of entered data
- Confirm button → writes to Supabase

### 3. Leaderboard
Per-player stats across all logged games.

Columns:
- Player name
- Games played
- Wins
- Win rate (%)
- Total deaths
- Average deaths per game
- Most played character

Sortable by any column.

### 4. Highscores Board
All-time per-game records. One record per category.

Example display:
| Category           | Player | Value | Game Date |
|--------------------|--------|-------|-----------|
| Most Coins         | Daan   | 47    | 2026-03-15|
| Most Followers     | ...    | ...   | ...       |

### 5. Game History
Chronological list of all logged games. Each row shows: date, players, ending type, winner, links to game detail.

### 6. Game Detail
Full breakdown of a single game — all participants, characters played, deaths, highscores achieved in that game, expansion events. Includes an Edit button.

### 7. Players
List of all registered players. "Add Player" button. Links to per-player stat page (future scope).

---

## Game Logging Rules

- Any visitor can log a game (no login required)
- Any visitor can add a new player to the player list
- Any visitor can edit any game (same multi-step form, pre-filled with existing data)
- A game requires at least 2 players and exactly 1 winner

---

## Ending Types (Dropdown)

Base game + all expansion alternate endings. Initial list (expandable):
- Crown of Command (base)
- Armageddon
- Sudden Death
- Blood Moon
- The Harbinger
- A Dragon King
- *(add remaining from expansion rule books)*

---

## Out of Scope (MVP)

- Authentication / user accounts
- Audit log / change history for edits
- Per-player profile pages
- Notifications
- Mobile-native app
- Real-time multiplayer session tracking

---

## Open Questions / Future Scope

- When auth is added: should anonymous games be claimable by a player account?
- Per-character win rates (not just per-player)?
- Expansion-specific stat tracking beyond Woodland/Dungeon?
- Achievement/badge system?
- Session-based "live" game tracker (track turns in real time)?
