-- Encounter counters are now group-scoped.
-- Seed current groups, then require one row namespace per (group, encounter).

alter table encounter_scores
  drop constraint if exists encounter_scores_encounter_name_key;

alter table encounter_scores
  drop constraint if exists encounter_scores_group_id_fkey;

alter table encounter_scores
  add constraint encounter_scores_group_id_fkey
  foreign key (group_id) references groups(id) on delete cascade;

insert into encounter_scores (group_id, encounter_name)
select g.id, encounters.encounter_name
from groups g
cross join (
  values ('Basilisk'), ('Dark Fey')
) as encounters(encounter_name)
on conflict do nothing;

do $$
begin
  if exists (select 1 from encounter_scores where group_id is null) then
    raise exception 'encounter_scores.group_id still contains null rows; backfill before applying this migration';
  end if;
end;
$$;

alter table encounter_scores
  alter column group_id set not null;

create unique index if not exists encounter_scores_group_encounter_unique
  on encounter_scores(group_id, encounter_name);

create or replace function increment_encounter_score(
  p_group_id uuid,
  p_encounter_name text,
  p_column text,
  p_delta int
)
returns encounter_scores
language plpgsql
as $$
declare
  result encounter_scores;
begin
  if p_group_id is null then
    raise exception 'p_group_id is required';
  end if;

  if p_column not in ('creature_wins', 'player_wins') then
    raise exception 'invalid encounter score column: %', p_column;
  end if;

  insert into encounter_scores (group_id, encounter_name, creature_wins, player_wins)
  values (
    p_group_id,
    p_encounter_name,
    case when p_column = 'creature_wins' then greatest(0, p_delta) else 0 end,
    case when p_column = 'player_wins' then greatest(0, p_delta) else 0 end
  )
  on conflict (group_id, encounter_name) do update set
    creature_wins = case
      when p_column = 'creature_wins'
      then greatest(0, encounter_scores.creature_wins + p_delta)
      else encounter_scores.creature_wins
    end,
    player_wins = case
      when p_column = 'player_wins'
      then greatest(0, encounter_scores.player_wins + p_delta)
      else encounter_scores.player_wins
    end
  returning * into result;

  return result;
end;
$$;

drop policy if exists encounter_scores_select_all on encounter_scores;
drop policy if exists encounter_scores_insert_all on encounter_scores;
drop policy if exists encounter_scores_update_all on encounter_scores;
drop policy if exists encounter_scores_delete_all on encounter_scores;

create policy encounter_scores_select_same_group on encounter_scores
  for select using (is_group_member(group_id, auth.uid()));

create policy encounter_scores_insert_same_group on encounter_scores
  for insert with check (is_group_member(group_id, auth.uid()));

create policy encounter_scores_update_same_group on encounter_scores
  for update using (is_group_member(group_id, auth.uid()))
  with check (is_group_member(group_id, auth.uid()));

create policy encounter_scores_delete_same_group on encounter_scores
  for delete using (is_group_member(group_id, auth.uid()));
