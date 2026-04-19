-- Add The Highland expansion characters (dropped when replace_characters truncated the table).
insert into characters (name, expansion) values
  ('Alchemist',   'The Highland'),
  ('Highlander',  'The Highland'),
  ('Rogue',       'The Highland'),
  ('Sprite',      'The Highland'),
  ('Valkyrie',    'The Highland'),
  ('Vampiress',   'The Highland');

insert into icons (key, name, expansion, character_id)
select
  lower(regexp_replace(name, '\s+', '-', 'g')),
  name,
  expansion,
  id
from characters
where expansion = 'The Highland';
