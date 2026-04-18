create table icons (
  id           uuid primary key default gen_random_uuid(),
  key          text not null unique,
  name         text not null,
  expansion    text,
  character_id uuid references characters(id)
);

-- Seed from characters table
insert into icons (key, name, expansion, character_id)
select
  lower(regexp_replace(name, '\s+', '-', 'g')),
  name,
  expansion,
  id
from characters;

-- Toad is a special playable form, not in the characters seed
insert into icons (key, name, expansion)
values ('toad', 'Toad', 'base');
