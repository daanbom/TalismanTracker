-- Add character reference to game_player_deaths
-- Table has no existing rows so NOT NULL is safe without a default
alter table game_player_deaths
  add column character_id uuid not null references characters(id);
