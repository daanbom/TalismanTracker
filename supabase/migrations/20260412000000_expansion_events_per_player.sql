-- ============================================================
-- Phase 4 — Per-player expansion events
-- ============================================================
-- Adds player_id to game_expansion_events so woodland paths and
-- dungeon-beaten flags are recorded per player, not per game.
--
-- Nullable for backwards compatibility with any pre-existing rows.
-- Edit flow deletes + re-inserts child rows, so legacy NULL rows
-- will naturally disappear as old games are re-saved.

alter table game_expansion_events
  add column player_id uuid references players(id) on delete cascade;

create index game_expansion_events_player_id_idx
  on game_expansion_events (player_id);
