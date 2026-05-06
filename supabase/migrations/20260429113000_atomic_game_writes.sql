create or replace function public.assert_group_game_players(
  p_group_id uuid,
  p_game_players jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payload jsonb := coalesce(p_game_players, '[]'::jsonb);
begin
  if jsonb_typeof(v_payload) <> 'array' then
    raise exception 'invalid_game_players_payload';
  end if;

  if jsonb_array_length(v_payload) = 0 then
    raise exception 'players_required';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(v_payload) as gp(
      player_id uuid,
      characters_played text[],
      total_toad_times integer,
      is_winner boolean,
      winning_character text
    )
    where gp.player_id is null
  ) then
    raise exception 'player_id_required';
  end if;

  if exists (
    select 1
    from (
      select gp.player_id, count(*) as c
      from jsonb_to_recordset(v_payload) as gp(
        player_id uuid,
        characters_played text[],
        total_toad_times integer,
        is_winner boolean,
        winning_character text
      )
      group by gp.player_id
    ) dupes
    where dupes.c > 1
  ) then
    raise exception 'duplicate_player';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(v_payload) as gp(
      player_id uuid,
      characters_played text[],
      total_toad_times integer,
      is_winner boolean,
      winning_character text
    )
    where not (
      exists (
        select 1
        from group_members gm
        where gm.group_id = p_group_id
          and gm.player_id = gp.player_id
      )
      or exists (
        select 1
        from group_guest_players ggp
        where ggp.group_id = p_group_id
          and ggp.player_id = gp.player_id
      )
    )
  ) then
    raise exception 'player_not_in_group';
  end if;
end;
$$;

create or replace function public.create_game_atomic(
  p_group_id uuid,
  p_title text,
  p_date date,
  p_ending_id uuid,
  p_notes text,
  p_optional_expansions text[] default '{}',
  p_game_players jsonb default '[]'::jsonb,
  p_highscores jsonb default '[]'::jsonb,
  p_deaths jsonb default '[]'::jsonb,
  p_expansion_events jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_game_id uuid;
  v_title text := btrim(coalesce(p_title, ''));
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if not is_group_member(p_group_id, v_user_id) then
    raise exception 'not_group_member';
  end if;

  if v_title = '' then
    raise exception 'title_required';
  end if;

  perform assert_group_game_players(p_group_id, p_game_players);

  insert into games (
    title,
    date,
    ending_id,
    group_id,
    notes,
    optional_expansions
  ) values (
    v_title,
    p_date,
    p_ending_id,
    p_group_id,
    nullif(p_notes, ''),
    coalesce(p_optional_expansions, '{}')
  )
  returning id into v_game_id;

  insert into game_players (
    game_id,
    player_id,
    characters_played,
    total_toad_times,
    is_winner,
    winning_character
  )
  select
    v_game_id,
    gp.player_id,
    coalesce(gp.characters_played, '{}'),
    coalesce(gp.total_toad_times, 0),
    coalesce(gp.is_winner, false),
    gp.winning_character
  from jsonb_to_recordset(coalesce(p_game_players, '[]'::jsonb)) as gp(
    player_id uuid,
    characters_played text[],
    total_toad_times integer,
    is_winner boolean,
    winning_character text
  );

  insert into game_highscores (
    game_id,
    player_id,
    category,
    value
  )
  select
    v_game_id,
    hs.player_id,
    hs.category,
    hs.value
  from jsonb_to_recordset(coalesce(p_highscores, '[]'::jsonb)) as hs(
    player_id uuid,
    category text,
    value numeric
  );

  insert into game_player_deaths (
    game_id,
    player_id,
    death_type_id,
    character_id,
    killed_by_player_id
  )
  select
    v_game_id,
    d.player_id,
    d.death_type_id,
    d.character_id,
    d.killed_by_player_id
  from jsonb_to_recordset(coalesce(p_deaths, '[]'::jsonb)) as d(
    player_id uuid,
    death_type_id uuid,
    character_id uuid,
    killed_by_player_id uuid
  );

  insert into game_expansion_events (
    game_id,
    player_id,
    expansion,
    event_type,
    detail,
    character
  )
  select
    v_game_id,
    e.player_id,
    e.expansion,
    e.event_type,
    e.detail,
    e.character
  from jsonb_to_recordset(coalesce(p_expansion_events, '[]'::jsonb)) as e(
    player_id uuid,
    expansion text,
    event_type text,
    detail text,
    character text
  );

  return v_game_id;
end;
$$;

create or replace function public.update_game_atomic(
  p_game_id uuid,
  p_title text,
  p_date date,
  p_ending_id uuid,
  p_notes text,
  p_optional_expansions text[] default '{}',
  p_game_players jsonb default '[]'::jsonb,
  p_highscores jsonb default '[]'::jsonb,
  p_deaths jsonb default '[]'::jsonb,
  p_expansion_events jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_group_id uuid;
  v_title text := btrim(coalesce(p_title, ''));
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if v_title = '' then
    raise exception 'title_required';
  end if;

  select g.group_id
  into v_group_id
  from games g
  where g.id = p_game_id
  for update;

  if not found then
    raise exception 'game_not_found';
  end if;

  if not can_edit_game(p_game_id, v_user_id) then
    raise exception 'not_authorized';
  end if;

  perform assert_group_game_players(v_group_id, p_game_players);

  update games
  set
    title = v_title,
    date = p_date,
    ending_id = p_ending_id,
    notes = nullif(p_notes, ''),
    optional_expansions = coalesce(p_optional_expansions, '{}')
  where id = p_game_id;

  delete from game_player_deaths where game_id = p_game_id;
  delete from game_highscores where game_id = p_game_id;
  delete from game_expansion_events where game_id = p_game_id;
  delete from game_players where game_id = p_game_id;

  insert into game_players (
    game_id,
    player_id,
    characters_played,
    total_toad_times,
    is_winner,
    winning_character
  )
  select
    p_game_id,
    gp.player_id,
    coalesce(gp.characters_played, '{}'),
    coalesce(gp.total_toad_times, 0),
    coalesce(gp.is_winner, false),
    gp.winning_character
  from jsonb_to_recordset(coalesce(p_game_players, '[]'::jsonb)) as gp(
    player_id uuid,
    characters_played text[],
    total_toad_times integer,
    is_winner boolean,
    winning_character text
  );

  insert into game_highscores (
    game_id,
    player_id,
    category,
    value
  )
  select
    p_game_id,
    hs.player_id,
    hs.category,
    hs.value
  from jsonb_to_recordset(coalesce(p_highscores, '[]'::jsonb)) as hs(
    player_id uuid,
    category text,
    value numeric
  );

  insert into game_player_deaths (
    game_id,
    player_id,
    death_type_id,
    character_id,
    killed_by_player_id
  )
  select
    p_game_id,
    d.player_id,
    d.death_type_id,
    d.character_id,
    d.killed_by_player_id
  from jsonb_to_recordset(coalesce(p_deaths, '[]'::jsonb)) as d(
    player_id uuid,
    death_type_id uuid,
    character_id uuid,
    killed_by_player_id uuid
  );

  insert into game_expansion_events (
    game_id,
    player_id,
    expansion,
    event_type,
    detail,
    character
  )
  select
    p_game_id,
    e.player_id,
    e.expansion,
    e.event_type,
    e.detail,
    e.character
  from jsonb_to_recordset(coalesce(p_expansion_events, '[]'::jsonb)) as e(
    player_id uuid,
    expansion text,
    event_type text,
    detail text,
    character text
  );

  return p_game_id;
end;
$$;

revoke all on function public.assert_group_game_players(uuid, jsonb) from public;

revoke all on function public.create_game_atomic(uuid, text, date, uuid, text, text[], jsonb, jsonb, jsonb, jsonb) from public;
grant execute on function public.create_game_atomic(uuid, text, date, uuid, text, text[], jsonb, jsonb, jsonb, jsonb) to authenticated;

revoke all on function public.update_game_atomic(uuid, text, date, uuid, text, text[], jsonb, jsonb, jsonb, jsonb) from public;
grant execute on function public.update_game_atomic(uuid, text, date, uuid, text, text[], jsonb, jsonb, jsonb, jsonb) to authenticated;
