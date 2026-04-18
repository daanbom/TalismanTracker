-- Add icon fields to players
alter table players
  add column icon_key            text,
  add column icon_character_id   uuid references characters(id);
