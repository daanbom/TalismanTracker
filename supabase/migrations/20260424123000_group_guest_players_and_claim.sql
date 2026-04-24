-- Group-scoped guest players and claim flow (issue #95).

create table group_guest_players (
  group_id             uuid not null references groups(id) on delete cascade,
  player_id            uuid not null references players(id) on delete cascade,
  created_by_user_id   uuid not null references auth.users(id) on delete cascade,
  created_at           timestamptz not null default now(),
  primary key (group_id, player_id)
);

create index group_guest_players_group_idx on group_guest_players(group_id);
create index group_guest_players_player_idx on group_guest_players(player_id);

alter table group_guest_players enable row level security;

create policy group_guest_players_select_same_group on group_guest_players
  for select using (is_group_member(group_id, auth.uid()));

create policy group_guest_players_insert_member on group_guest_players
  for insert with check (
    created_by_user_id = auth.uid()
    and is_group_member(group_id, auth.uid())
    and exists (
      select 1
      from players p
      where p.id = group_guest_players.player_id
        and p.user_id is null
    )
  );

create or replace function create_group_guest_player(
  p_group_id uuid,
  p_name text,
  p_icon_key text default null,
  p_icon_character_id uuid default null,
  p_favorite_character_id uuid default null
)
returns players
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_name text := btrim(coalesce(p_name, ''));
  v_player players%rowtype;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if not is_group_member(p_group_id, v_user_id) then
    raise exception 'not_group_member';
  end if;

  if v_name = '' then
    raise exception 'name_required';
  end if;

  insert into players (
    name,
    icon_key,
    icon_character_id,
    favorite_character_id,
    user_id
  )
  values (
    v_name,
    p_icon_key,
    p_icon_character_id,
    p_favorite_character_id,
    null
  )
  returning * into v_player;

  insert into group_guest_players (group_id, player_id, created_by_user_id)
  values (p_group_id, v_player.id, v_user_id);

  return v_player;
end;
$$;

revoke all on function create_group_guest_player(uuid, text, text, uuid, uuid) from public;
grant execute on function create_group_guest_player(uuid, text, text, uuid, uuid) to authenticated;

create or replace function claim_group_guest_player(
  p_group_id uuid,
  p_guest_player_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_guest players%rowtype;
  v_current players%rowtype;
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if not is_group_member(p_group_id, v_user_id) then
    raise exception 'not_group_member';
  end if;

  if not exists (
    select 1
    from group_guest_players ggp
    where ggp.group_id = p_group_id
      and ggp.player_id = p_guest_player_id
  ) then
    raise exception 'guest_not_in_group';
  end if;

  select *
  into v_guest
  from players
  where id = p_guest_player_id
  for update;

  if not found then
    raise exception 'guest_not_found';
  end if;

  if v_guest.user_id is not null then
    raise exception 'guest_already_linked';
  end if;

  select *
  into v_current
  from players
  where user_id = v_user_id
  for update;

  if not found then
    raise exception 'current_player_not_found';
  end if;

  if v_current.id = v_guest.id then
    return v_guest.id;
  end if;

  -- Active-group only remap: keep this user's identity stable in the selected group.
  update game_players gp
  set player_id = v_guest.id
  from games g
  where gp.game_id = g.id
    and g.group_id = p_group_id
    and gp.player_id = v_current.id;

  update game_highscores gh
  set player_id = v_guest.id
  from games g
  where gh.game_id = g.id
    and g.group_id = p_group_id
    and gh.player_id = v_current.id;

  update game_expansion_events gee
  set player_id = v_guest.id
  from games g
  where gee.game_id = g.id
    and g.group_id = p_group_id
    and gee.player_id = v_current.id;

  update game_player_deaths gpd
  set player_id = v_guest.id
  from games g
  where gpd.game_id = g.id
    and g.group_id = p_group_id
    and gpd.player_id = v_current.id;

  update game_player_deaths gpd
  set killed_by_player_id = v_guest.id
  from games g
  where gpd.game_id = g.id
    and g.group_id = p_group_id
    and gpd.killed_by_player_id = v_current.id;

  update group_members
  set player_id = v_guest.id
  where group_id = p_group_id
    and user_id = v_user_id;

  -- Move the current user's tierlist to the claimed identity to avoid data loss.
  delete from tierlists where player_id = v_guest.id;
  update tierlists
  set player_id = v_guest.id
  where player_id = v_current.id;

  -- Preserve account-owned profile fields; guests do not edit their own profile data.
  update players
  set user_id = null
  where id = v_current.id;

  update players
  set user_id = v_user_id,
      name = v_current.name,
      icon_key = v_current.icon_key,
      icon_character_id = v_current.icon_character_id,
      favorite_character_id = v_current.favorite_character_id
  where id = v_guest.id;

  delete from group_guest_players
  where group_id = p_group_id
    and player_id = v_guest.id;

  return v_guest.id;
end;
$$;

revoke all on function claim_group_guest_player(uuid, uuid) from public;
grant execute on function claim_group_guest_player(uuid, uuid) to authenticated;
