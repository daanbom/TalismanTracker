-- Re-seed icons from characters (initial seed was incomplete)
truncate table icons restart identity cascade;

insert into icons (key, name, expansion, character_id)
select
  lower(regexp_replace(name, '\s+', '-', 'g')),
  name,
  expansion,
  id
from characters;

insert into icons (key, name, expansion)
values ('toad', 'Toad', 'base');
