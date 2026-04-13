-- Replace all characters with the definitive list.
-- Expansion values are now human-readable (e.g. 'The Reaper') because they are
-- displayed directly as <optgroup> labels in the Log Game UI.
-- characters_played in game_players stores character names as plain text (no FK),
-- so truncating this table has no cascade impact on game data.

truncate table characters;

insert into characters (name, expansion) values
  -- Base Game
  ('Assassin',          'Base Game'),
  ('Druid',             'Base Game'),
  ('Dwarf',             'Base Game'),
  ('Elf',               'Base Game'),
  ('Ghoul',             'Base Game'),
  ('Minstrel',          'Base Game'),
  ('Monk',              'Base Game'),
  ('Priest',            'Base Game'),
  ('Prophetess',        'Base Game'),
  ('Sorceress',         'Base Game'),
  ('Thief',             'Base Game'),
  ('Troll',             'Base Game'),
  ('Warrior',           'Base Game'),
  ('Wizard',            'Base Game'),
  -- The Reaper
  ('Sage',              'The Reaper'),
  ('Merchant',          'The Reaper'),
  ('Dark Cultist',      'The Reaper'),
  ('Knight',            'The Reaper'),

  -- The Frostmarch
  ('Leprechaun',        'The Frostmarch'),
  ('Necromancer',       'The Frostmarch'),
  ('Ogre Chieftain',    'The Frostmarch'),
  ('Warlock',           'The Frostmarch'),

  -- The Dragon
  ('Minotaur',          'The Dragon'),
  ('Dragon Hunter',     'The Dragon'),
  ('Conjurer',          'The Dragon'),
  ('Fire Wizard',       'The Dragon'),
  ('Dragon Priestess',  'The Dragon'),
  ('Dragon Rider',      'The Dragon'),

  -- The Woodland
  ('Spider Queen',      'The Woodland'),
  ('Totem Warrior',     'The Woodland'),
  ('Scout',             'The Woodland'),
  ('Leywalker',         'The Woodland'),
  ('Ancient Oak',       'The Woodland'),

  -- The City
  ('Cat Burglar',       'The City'),
  ('Elementalist',      'The City'),
  ('Tinkerer',          'The City'),
  ('Tavern Maid',       'The City'),
  ('Bounty Hunter',     'The City'),
  ('Spy',               'The City'),

  -- The Harbinger
  ('Ascendant Divine',  'The Harbinger'),
  ('Possessed',         'The Harbinger'),
  ('Celestial',         'The Harbinger'),

  -- The Firelands
  ('Dervish',           'The Firelands'),
  ('Jin Blooded',       'The Firelands'),
  ('Warlord',           'The Firelands'),
  ('Nomad',             'The Firelands'),

  -- The Cataclysm
  ('Black Knight',      'The Cataclysm'),
  ('Mutant',            'The Cataclysm'),
  ('Scavenger',         'The Cataclysm'),
  ('Arcane Scion',      'The Cataclysm'),
  ('Barbarian',         'The Cataclysm'),

  -- The Dungeon
  ('Philosopher',       'The Dungeon'),
  ('Swashbuckler',      'The Dungeon'),
  ('Amazon',            'The Dungeon'),
  ('Gladiator',         'The Dungeon'),
  ('Gypsy',             'The Dungeon'),

  -- The Sacred Pool
  ('Chivalric Knight',  'The Sacred Pool'),
  ('Cleric',            'The Sacred Pool'),
  ('Dread Knight',      'The Sacred Pool'),
  ('Magus',             'The Sacred Pool'),

  -- The Blood Moon
  ('Doomsayer',         'The Blood Moon'),
  ('Grave Robber',      'The Blood Moon'),
  ('Vampire Hunter',    'The Blood Moon');
