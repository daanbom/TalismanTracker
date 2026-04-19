-- ============================================================
-- Reseed endings with full per-expansion list + hidden flag.
-- Source: GitHub issue #5.
-- The one existing game is repointed to "Spreading Flames".
-- ============================================================

-- 1. Add hidden_type column (nullable for now so we can tag new rows)
alter table endings add column hidden_type text;

-- 2. Insert new endings
insert into endings (name, expansion, hidden_type) values
  -- Base game
  ('Crown of Command',      'base',         'not_hidden'),

  -- The Nether Realm
  ('The Hunt',              'nether',       'not_hidden'),
  ('The Gauntlet',          'nether',       'not_hidden'),
  ('Pandora''s Box',        'nether',       'both'),

  -- The Dragon
  ('Dragon King',           'dragon',       'both'),
  ('Dragon Slayers',        'dragon',       'not_hidden'),
  ('Domain of Dragons',     'dragon',       'not_hidden'),

  -- The Woodland
  ('War of Seasons',        'woodland',     'both'),
  ('Judged by Fate',        'woodland',     'hidden'),
  ('Wanderlust',            'woodland',     'not_hidden'),

  -- The City
  ('Merchants'' Guild',     'city',         'not_hidden'),
  ('Assassins'' Guild',     'city',         'not_hidden'),
  ('Thieves'' Guild',       'city',         'both'),

  -- The Harbinger
  ('End of Days',           'harbinger',    'not_hidden'),
  ('Armageddon Crown',      'harbinger',    'both'),

  -- The Firelands
  ('A Hero Rises',          'firelands',    'not_hidden'),
  ('Crown of Flame',        'firelands',    'hidden'),
  ('Spreading Flames',      'firelands',    'hidden'),

  -- The Cataclysm
  ('Lands of Wonder',       'cataclysm',    'not_hidden'),
  ('The One Talisman',      'cataclysm',    'not_hidden'),
  ('Cult of the Damned',    'cataclysm',    'hidden'),
  ('The Eternal Crown',     'cataclysm',    'both'),

  -- The Sacred Pool
  ('Sacred Pool',           'sacred_pool',  'not_hidden'),
  ('Judgement Day',         'sacred_pool',  'both'),
  ('Demon Lord',            'sacred_pool',  'both'),

  -- The Blood Moon
  ('Horrible Black Void',   'blood_moon',   'hidden'),
  ('Blood Moon Werewolf',   'blood_moon',   'hidden'),
  ('Lightbearers',          'blood_moon',   'not_hidden');

-- 3. Repoint any existing games (the one logged game in prod) to "Spreading Flames".
--    Old endings are identified by hidden_type being null (nothing above left it null).
update games
set ending_id = (
  select id from endings
  where name = 'Spreading Flames' and expansion = 'firelands'
  limit 1
)
where ending_id in (select id from endings where hidden_type is null);

-- 4. Remove the old seeded endings.
delete from endings where hidden_type is null;

-- 5. Lock down the column.
alter table endings alter column hidden_type set not null;
alter table endings
  add constraint endings_hidden_type_check
  check (hidden_type in ('hidden', 'not_hidden', 'both'));
