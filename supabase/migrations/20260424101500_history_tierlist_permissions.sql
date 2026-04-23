-- Issue #96 and #97 permissions:
-- - Tierlists: owner can edit, group members can view
-- - Games: admin deletes, admin or participants edit

create or replace function can_edit_game(p_game_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from games g
    where g.id = p_game_id
      and (
        exists (
          select 1
          from groups grp
          where grp.id = g.group_id
            and grp.admin_user_id = p_user_id
        )
        or exists (
          select 1
          from group_members gm
          join game_players gp
            on gp.player_id = gm.player_id
           and gp.game_id = g.id
          where gm.group_id = g.group_id
            and gm.user_id = p_user_id
        )
      )
  );
$$;

revoke all on function can_edit_game(uuid, uuid) from public;
grant execute on function can_edit_game(uuid, uuid) to authenticated;

create or replace function can_view_tierlist_player(p_player_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from players p
    where p.id = p_player_id
      and p.user_id = p_user_id
  )
  or exists (
    select 1
    from group_members target
    join group_members viewer
      on viewer.group_id = target.group_id
    where target.player_id = p_player_id
      and viewer.user_id = p_user_id
  );
$$;

revoke all on function can_view_tierlist_player(uuid, uuid) from public;
grant execute on function can_view_tierlist_player(uuid, uuid) to authenticated;

-- games
drop policy if exists games_select_all on games;
drop policy if exists games_insert_all on games;
drop policy if exists games_update_all on games;
drop policy if exists games_delete_all on games;
drop policy if exists games_select_same_group on games;
drop policy if exists games_insert_same_group on games;
drop policy if exists games_update_admin_or_participant on games;
drop policy if exists games_delete_admin_only on games;

create policy games_select_same_group on games
  for select using (is_group_member(group_id, auth.uid()));

create policy games_insert_same_group on games
  for insert with check (is_group_member(group_id, auth.uid()));

create policy games_update_admin_or_participant on games
  for update using (can_edit_game(id, auth.uid()))
  with check (can_edit_game(id, auth.uid()));

create policy games_delete_admin_only on games
  for delete using (
    exists (
      select 1
      from groups grp
      where grp.id = games.group_id
        and grp.admin_user_id = auth.uid()
    )
  );

-- game_players
drop policy if exists game_players_select_all on game_players;
drop policy if exists game_players_insert_all on game_players;
drop policy if exists game_players_update_all on game_players;
drop policy if exists game_players_delete_all on game_players;
drop policy if exists game_players_select_same_group on game_players;
drop policy if exists game_players_insert_editable_game on game_players;
drop policy if exists game_players_update_editable_game on game_players;
drop policy if exists game_players_delete_editable_game on game_players;

create policy game_players_select_same_group on game_players
  for select using (
    exists (
      select 1
      from games g
      where g.id = game_players.game_id
        and is_group_member(g.group_id, auth.uid())
    )
  );

create policy game_players_insert_editable_game on game_players
  for insert with check (can_edit_game(game_id, auth.uid()));

create policy game_players_update_editable_game on game_players
  for update using (can_edit_game(game_id, auth.uid()))
  with check (can_edit_game(game_id, auth.uid()));

create policy game_players_delete_editable_game on game_players
  for delete using (can_edit_game(game_id, auth.uid()));

-- game_highscores
drop policy if exists game_highscores_select_all on game_highscores;
drop policy if exists game_highscores_insert_all on game_highscores;
drop policy if exists game_highscores_update_all on game_highscores;
drop policy if exists game_highscores_delete_all on game_highscores;
drop policy if exists game_highscores_select_same_group on game_highscores;
drop policy if exists game_highscores_insert_editable_game on game_highscores;
drop policy if exists game_highscores_update_editable_game on game_highscores;
drop policy if exists game_highscores_delete_editable_game on game_highscores;

create policy game_highscores_select_same_group on game_highscores
  for select using (
    exists (
      select 1
      from games g
      where g.id = game_highscores.game_id
        and is_group_member(g.group_id, auth.uid())
    )
  );

create policy game_highscores_insert_editable_game on game_highscores
  for insert with check (can_edit_game(game_id, auth.uid()));

create policy game_highscores_update_editable_game on game_highscores
  for update using (can_edit_game(game_id, auth.uid()))
  with check (can_edit_game(game_id, auth.uid()));

create policy game_highscores_delete_editable_game on game_highscores
  for delete using (can_edit_game(game_id, auth.uid()));

-- game_expansion_events
drop policy if exists game_expansion_events_select_all on game_expansion_events;
drop policy if exists game_expansion_events_insert_all on game_expansion_events;
drop policy if exists game_expansion_events_update_all on game_expansion_events;
drop policy if exists game_expansion_events_delete_all on game_expansion_events;
drop policy if exists game_expansion_events_select_same_group on game_expansion_events;
drop policy if exists game_expansion_events_insert_editable_game on game_expansion_events;
drop policy if exists game_expansion_events_update_editable_game on game_expansion_events;
drop policy if exists game_expansion_events_delete_editable_game on game_expansion_events;

create policy game_expansion_events_select_same_group on game_expansion_events
  for select using (
    exists (
      select 1
      from games g
      where g.id = game_expansion_events.game_id
        and is_group_member(g.group_id, auth.uid())
    )
  );

create policy game_expansion_events_insert_editable_game on game_expansion_events
  for insert with check (can_edit_game(game_id, auth.uid()));

create policy game_expansion_events_update_editable_game on game_expansion_events
  for update using (can_edit_game(game_id, auth.uid()))
  with check (can_edit_game(game_id, auth.uid()));

create policy game_expansion_events_delete_editable_game on game_expansion_events
  for delete using (can_edit_game(game_id, auth.uid()));

-- game_player_deaths
drop policy if exists game_player_deaths_select_all on game_player_deaths;
drop policy if exists game_player_deaths_insert_all on game_player_deaths;
drop policy if exists game_player_deaths_update_all on game_player_deaths;
drop policy if exists game_player_deaths_delete_all on game_player_deaths;
drop policy if exists game_player_deaths_select_same_group on game_player_deaths;
drop policy if exists game_player_deaths_insert_editable_game on game_player_deaths;
drop policy if exists game_player_deaths_update_editable_game on game_player_deaths;
drop policy if exists game_player_deaths_delete_editable_game on game_player_deaths;

create policy game_player_deaths_select_same_group on game_player_deaths
  for select using (
    exists (
      select 1
      from games g
      where g.id = game_player_deaths.game_id
        and is_group_member(g.group_id, auth.uid())
    )
  );

create policy game_player_deaths_insert_editable_game on game_player_deaths
  for insert with check (can_edit_game(game_id, auth.uid()));

create policy game_player_deaths_update_editable_game on game_player_deaths
  for update using (can_edit_game(game_id, auth.uid()))
  with check (can_edit_game(game_id, auth.uid()));

create policy game_player_deaths_delete_editable_game on game_player_deaths
  for delete using (can_edit_game(game_id, auth.uid()));

-- tierlists
drop policy if exists tierlists_select_all on tierlists;
drop policy if exists tierlists_insert_all on tierlists;
drop policy if exists tierlists_update_all on tierlists;
drop policy if exists tierlists_delete_all on tierlists;
drop policy if exists tierlists_select_visible_in_group on tierlists;
drop policy if exists tierlists_insert_own_player on tierlists;
drop policy if exists tierlists_update_own_player on tierlists;
drop policy if exists tierlists_delete_own_player on tierlists;

create policy tierlists_select_visible_in_group on tierlists
  for select using (can_view_tierlist_player(player_id, auth.uid()));

create policy tierlists_insert_own_player on tierlists
  for insert with check (
    exists (
      select 1
      from players p
      where p.id = tierlists.player_id
        and p.user_id = auth.uid()
    )
  );

create policy tierlists_update_own_player on tierlists
  for update using (
    exists (
      select 1
      from players p
      where p.id = tierlists.player_id
        and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from players p
      where p.id = tierlists.player_id
        and p.user_id = auth.uid()
    )
  );

create policy tierlists_delete_own_player on tierlists
  for delete using (
    exists (
      select 1
      from players p
      where p.id = tierlists.player_id
        and p.user_id = auth.uid()
    )
  );

