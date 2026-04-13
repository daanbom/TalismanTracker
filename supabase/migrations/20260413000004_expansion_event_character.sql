-- ============================================================
-- Phase 6 — Attribute expansion events to a character
-- ============================================================
-- Dungeons beaten and woodland paths completed are now credited
-- to the specific character that accomplished them, not just the
-- player. Character is stored as plain text (no FK), matching
-- characters_played on game_players.
--
-- Nullable so historical rows stay valid. New writes should
-- always supply a character.

alter table game_expansion_events
  add column character text;
