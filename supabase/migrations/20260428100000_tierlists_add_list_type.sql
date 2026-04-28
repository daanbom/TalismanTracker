-- Allow multiple tierlist types per player (character + pet).
alter table tierlists
  add column list_type text;

update tierlists
set list_type = 'character'
where list_type is null;

alter table tierlists
  alter column list_type set default 'character',
  alter column list_type set not null;

alter table tierlists
  add constraint tierlists_list_type_check
  check (list_type in ('character', 'pet'));

alter table tierlists
  drop constraint if exists tierlists_player_id_key;

create unique index tierlists_player_list_type_unique
  on tierlists(player_id, list_type);
