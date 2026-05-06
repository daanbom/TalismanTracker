create or replace function public.get_group_game_history(
  p_group_id uuid,
  p_participant_player_id uuid default null,
  p_player_id uuid default null,
  p_ending_id uuid default null,
  p_winner_type text default 'all',
  p_search text default null,
  p_date_from date default null,
  p_date_to date default null,
  p_limit integer default 20,
  p_offset integer default 0
)
returns table(game_id uuid, total_count bigint)
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_search text := nullif(btrim(coalesce(p_search, '')), '');
  v_winner_type text := coalesce(nullif(btrim(coalesce(p_winner_type, '')), ''), 'all');
  v_limit integer := greatest(coalesce(p_limit, 20), 1);
  v_offset integer := greatest(coalesce(p_offset, 0), 0);
begin
  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  if not is_group_member(p_group_id, v_user_id) then
    raise exception 'not_group_member';
  end if;

  if v_winner_type not in ('all', 'player', 'talisman') then
    raise exception 'invalid_winner_type';
  end if;

  return query
  with filtered_games as (
    select
      g.id,
      g.date,
      g.created_at
    from games g
    where g.group_id = p_group_id
      and (v_search is null or g.title ilike '%' || v_search || '%' or coalesce(g.notes, '') ilike '%' || v_search || '%')
      and (p_ending_id is null or g.ending_id = p_ending_id)
      and (p_date_from is null or g.date >= p_date_from)
      and (p_date_to is null or g.date <= p_date_to)
      and (
        p_participant_player_id is null
        or exists (
          select 1
          from game_players gp
          where gp.game_id = g.id
            and gp.player_id = p_participant_player_id
        )
      )
      and (
        p_player_id is null
        or exists (
          select 1
          from game_players gp
          where gp.game_id = g.id
            and gp.player_id = p_player_id
        )
      )
      and (
        v_winner_type = 'all'
        or (
          v_winner_type = 'player'
          and exists (
            select 1
            from game_players gp
            where gp.game_id = g.id
              and gp.is_winner = true
          )
        )
        or (
          v_winner_type = 'talisman'
          and not exists (
            select 1
            from game_players gp
            where gp.game_id = g.id
              and gp.is_winner = true
          )
        )
      )
  ),
  paged_games as (
    select
      fg.id,
      count(*) over() as total_count,
      fg.date,
      fg.created_at
    from filtered_games fg
    order by fg.date desc, fg.created_at desc, fg.id desc
    limit v_limit
    offset v_offset
  )
  select
    pg.id as game_id,
    pg.total_count
  from paged_games pg
  order by pg.date desc, pg.created_at desc, pg.id desc;
end;
$$;

revoke all on function public.get_group_game_history(uuid, uuid, uuid, uuid, text, text, date, date, integer, integer) from public;
grant execute on function public.get_group_game_history(uuid, uuid, uuid, uuid, text, text, date, date, integer, integer) to authenticated;
