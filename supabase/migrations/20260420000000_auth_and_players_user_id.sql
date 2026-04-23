-- Link players to auth.users (one player per user).
alter table players
  add column user_id uuid references auth.users(id) on delete set null;

create unique index players_user_id_unique on players(user_id) where user_id is not null;

-- Drop name uniqueness so two users can pick the same display name.
alter table players drop constraint if exists players_name_key;

-- Enable RLS on every existing table with permissive policies.
-- Later issues (#72/#73) will tighten these per-table once active-group scoping lands.

do $$
declare
  t text;
  tables text[] := array[
    'players',
    'characters',
    'endings',
    'games',
    'game_players',
    'game_highscores',
    'game_expansion_events',
    'death_types',
    'game_player_deaths',
    'encounter_scores',
    'icons',
    'tierlists'
  ];
begin
  foreach t in array tables loop
    execute format('alter table %I enable row level security', t);
    execute format(
      'create policy %I on %I for select using (true)',
      t || '_select_all', t
    );
    execute format(
      'create policy %I on %I for insert with check (true)',
      t || '_insert_all', t
    );
    execute format(
      'create policy %I on %I for update using (true) with check (true)',
      t || '_update_all', t
    );
    execute format(
      'create policy %I on %I for delete using (true)',
      t || '_delete_all', t
    );
  end loop;
end $$;

-- Tighten players write policies: only the matching auth user may update or delete their own row.
drop policy if exists players_update_all on players;
drop policy if exists players_delete_all on players;

create policy players_update_self on players
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy players_delete_self on players
  for delete using (user_id = auth.uid());

-- Inserts stay permissive; /setup sets user_id = auth.uid() on insert.
-- Tighter insert policy (require user_id = auth.uid()) can land in a later issue
-- once legacy player rows are reassigned.
