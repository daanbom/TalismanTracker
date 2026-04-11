-- ============================================================
-- Talisman Tracker — Initial Schema + Seed Data
-- ============================================================

-- ── players ─────────────────────────────────────────────────
create table players (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  created_at timestamptz not null default now()
);

-- ── characters (seed / reference) ───────────────────────────
create table characters (
  id        uuid primary key default gen_random_uuid(),
  name      text not null,
  expansion text not null
);

-- ── endings (seed / reference) ──────────────────────────────
create table endings (
  id        uuid primary key default gen_random_uuid(),
  name      text not null,
  expansion text not null
);

-- ── games ────────────────────────────────────────────────────
create table games (
  id         uuid primary key default gen_random_uuid(),
  date       date not null,
  ending_id  uuid not null references endings(id),
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- auto-update updated_at on every edit
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger games_set_updated_at
  before update on games
  for each row execute function set_updated_at();

-- ── game_players ─────────────────────────────────────────────
create table game_players (
  id                uuid primary key default gen_random_uuid(),
  game_id           uuid not null references games(id) on delete cascade,
  player_id         uuid not null references players(id),
  characters_played text[] not null default '{}',
  total_deaths      int not null default 0,
  is_winner         boolean not null default false,
  winning_character text
);

-- ── game_highscores ──────────────────────────────────────────
create table game_highscores (
  id        uuid primary key default gen_random_uuid(),
  game_id   uuid not null references games(id) on delete cascade,
  player_id uuid not null references players(id),
  category  text not null,
  value     numeric not null,
  constraint game_highscores_category_check
    check (category in ('most_coins','most_followers','most_objects','most_denizens_on_spot'))
);

-- ── game_expansion_events ────────────────────────────────────
create table game_expansion_events (
  id         uuid primary key default gen_random_uuid(),
  game_id    uuid not null references games(id) on delete cascade,
  expansion  text not null,
  event_type text not null,
  detail     text
);

-- ============================================================
-- Seed: characters
-- ============================================================
insert into characters (name, expansion) values
  -- Base game
  ('Assassin',       'base'),
  ('Druid',          'base'),
  ('Dwarf',          'base'),
  ('Elf',            'base'),
  ('Ghoul',          'base'),
  ('Gladiator',      'base'),
  ('Highwayman',     'base'),
  ('Knight',         'base'),
  ('Mage',           'base'),
  ('Monk',           'base'),
  ('Priest',         'base'),
  ('Prophetess',     'base'),
  ('Sorceress',      'base'),
  ('Thief',          'base'),
  ('Troll',          'base'),
  ('Warrior',        'base'),
  ('Witch',          'base'),
  ('Wizard',         'base'),
  -- The Reaper
  ('Chivalric Knight','reaper'),
  ('Conjurer',        'reaper'),
  ('Demonologist',    'reaper'),
  ('Gravedigger',     'reaper'),
  ('Ninja',           'reaper'),
  ('Sage',            'reaper'),
  -- The Dungeon
  ('Amazon',          'dungeon'),
  ('Halfling',        'dungeon'),
  ('Mercenary',       'dungeon'),
  ('Philosopher',     'dungeon'),
  ('Rogue',           'dungeon'),
  ('Scout',           'dungeon'),
  -- The Highland
  ('Clan Warrior',    'highland'),
  ('Fairy',           'highland'),
  ('Hunter',          'highland'),
  ('Mystic',          'highland'),
  ('Ranger',          'highland'),
  ('Sprite',          'highland'),
  -- The Sacred Pool
  ('Alchemist',       'sacred_pool'),
  ('Enchantress',     'sacred_pool'),
  ('Paladin',         'sacred_pool'),
  ('Shaman',          'sacred_pool'),
  -- The Harbinger
  ('Arcanist',        'harbinger'),
  ('Black Witch',     'harbinger'),
  ('Doomsayer',       'harbinger'),
  ('Swordsman',       'harbinger'),
  -- The Frostmarch
  ('Ice Queen',       'frostmarch'),
  ('Mountaineer',     'frostmarch'),
  ('Polar Warbear',   'frostmarch'),
  ('Viking',          'frostmarch'),
  -- The Nether Realm
  ('Dark Cultist',    'nether'),
  ('Gambler',         'nether'),
  ('Swashbuckler',    'nether'),
  ('Vampire Hunter',  'nether'),
  -- The Clockwork Kingdom
  ('Artificer',       'clockwork'),
  ('Automaton',       'clockwork'),
  ('Engineer',        'clockwork'),
  ('Steam Mage',      'clockwork'),
  -- The Blood Moon
  ('Lycanthrope',     'blood_moon'),
  ('Vampire',         'blood_moon'),
  ('Warlord',         'blood_moon'),
  ('Zealot',          'blood_moon'),
  -- The City
  ('Archaeologist',   'city'),
  ('Merchant',        'city'),
  ('Pit Fighter',     'city'),
  ('Tavern Maid',     'city'),
  -- The Woodland
  ('Forest Guardian', 'woodland'),
  ('Satyr',           'woodland'),
  ('Wood Elf',        'woodland'),
  ('Woodland Witch',  'woodland');

-- ============================================================
-- Seed: endings
-- ============================================================
insert into endings (name, expansion) values
  -- Base game
  ('Crown of Command',  'base'),
  ('Armageddon',        'base'),
  ('Sudden Death',      'base'),
  -- The Blood Moon
  ('Blood Moon',        'blood_moon'),
  -- The Harbinger
  ('The Harbinger',     'harbinger'),
  -- The Dungeon
  ('A Dragon King',     'dungeon'),
  -- The Frostmarch
  ('The Ice Queen',     'frostmarch'),
  -- The Nether Realm
  ('The Portal of Power','nether'),
  -- The Clockwork Kingdom
  ('The Clockwork Crown','clockwork'),
  -- The City
  ('City Domination',   'city'),
  -- The Woodland
  ('Woodland Domination','woodland');
