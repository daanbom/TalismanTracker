-- ============================================================
-- Phase 5 — Game-level denizens highscore
-- ============================================================
-- `most_denizens_on_spot` is a per-game record (a spot on the
-- board, not attributable to a single player), so player_id is
-- no longer required on game_highscores rows.

alter table game_highscores
  alter column player_id drop not null;
