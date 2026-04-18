-- Global encounter score counters (not per-game)
-- Tracks creature wins vs player wins for specific encounters.

create table encounter_scores (
  id              uuid primary key default gen_random_uuid(),
  encounter_name  text not null unique,
  creature_wins   int not null default 0,
  player_wins     int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger encounter_scores_set_updated_at
  before update on encounter_scores
  for each row execute function set_updated_at();

-- Atomic increment/decrement with upsert and floor at 0
create or replace function increment_encounter_score(
  p_encounter_name text,
  p_column text,
  p_delta int
)
returns encounter_scores
language plpgsql as $$
declare
  result encounter_scores;
begin
  insert into encounter_scores (encounter_name, creature_wins, player_wins)
  values (
    p_encounter_name,
    case when p_column = 'creature_wins' then greatest(0, p_delta) else 0 end,
    case when p_column = 'player_wins'   then greatest(0, p_delta) else 0 end
  )
  on conflict (encounter_name) do update set
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

-- Seed initial rows
insert into encounter_scores (encounter_name) values
  ('Basilisk'),
  ('Dark Fey');
