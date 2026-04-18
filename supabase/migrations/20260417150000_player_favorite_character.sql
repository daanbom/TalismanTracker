alter table players
  add column favorite_character_id uuid references characters(id);
