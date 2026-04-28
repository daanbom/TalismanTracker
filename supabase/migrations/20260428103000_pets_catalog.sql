create table pets (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  name text not null,
  expansion text not null default 'city',
  ability_text text
);

insert into pets (key, name, expansion, ability_text) values
  ('fang', 'Fang', 'city', 'Once per battle or psychic combat, you may reroll your attack roll. Fang cannot be taken by another character''s special ability or Spell.'),
  ('fez', 'Fez', 'city', 'Whenever you land on a space with instructions to draw 1 or more Adventure Cards, before you encounter the space you may move 1 faceup Adventure Card in the same Region to your space. You may only do this once per turn.'),
  ('glitter', 'Glitter', 'city', null),
  ('hopper', 'Hopper', 'city', null),
  ('lucky', 'Lucky', 'city', null),
  ('luna', 'Luna', 'city', null),
  ('singe', 'Singe', 'city', null),
  ('stinker', 'Stinker', 'city', null),
  ('stompy', 'Stompy', 'city', 'After you have finished moving, you may discard 1 Adventure Card on your space.'),
  ('terrance', 'Terrance', 'city', null),
  ('wart', 'Wart', 'city', null),
  ('whiskers', 'Whiskers', 'city', null);

alter table pets enable row level security;

create policy pets_select_all on pets
  for select using (true);
