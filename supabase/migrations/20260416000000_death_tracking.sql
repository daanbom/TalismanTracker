-- ============================================================
-- Death tracking: death_types seed table + game_player_deaths
-- ============================================================

-- ── death_types (seed / reference) ──────────────────────────
create table death_types (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  description text
);

insert into death_types (name, description) values
  ('PVP',                    'Killed by another player'),
  ('Adventure',              'Adventure card enemies'),
  ('Inner Region',           'Inner region enemies'),
  ('Crown of Command',       'Killed at the Crown of Command'),
  ('Spell',                  'Killed by a spell'),
  ('Suicide',                'Self-inflicted death'),
  ('Denizen',                'Killed by a denizen'),
  ('Dungeon',                'Dungeon board enemies'),
  ('Woodland',               'Woodland board enemies'),
  ('City',                   'City board enemies'),
  ('Reaper',                 'Killed by the Reaper'),
  ('Werewolf',               'Blood Moon werewolf'),
  ('Harbinger',              'Harbinger events'),
  ('Dragon',                 'Dragon expansion enemies'),
  ('Firelands',              'Firelands board enemies'),
  ('Rat Queen''s Lair',      'Lost Realms - rat side'),
  ('Wraith Lord''s Domain',  'Lost Realms - spirit side');

-- ── game_player_deaths ──────────────────────────────────────
create table game_player_deaths (
  id                    uuid primary key default gen_random_uuid(),
  game_id               uuid not null references games(id) on delete cascade,
  player_id             uuid not null references players(id),
  death_type_id         uuid not null references death_types(id),
  character_id          uuid not null references characters(id),
  killed_by_player_id   uuid
    constraint game_player_deaths_killed_by_fkey
    references players(id)
);

create index idx_game_player_deaths_game_player
  on game_player_deaths (game_id, player_id);

-- ── Drop total_deaths from game_players ─────────────────────
alter table game_players drop column total_deaths;
