-- Platform-wide analytics RPCs for global scope views.

create or replace function public.get_platform_game_ids_by_player_count(
  p_player_count_filter text default 'all'
)
returns table(game_id uuid)
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_target_count integer := null;
begin
  if p_player_count_filter is null or p_player_count_filter = 'all' then
    v_target_count := null;
  elsif p_player_count_filter ~ '^[0-9]+$' then
    v_target_count := p_player_count_filter::integer;
  else
    raise exception 'Invalid player_count_filter: %', p_player_count_filter using errcode = '22023';
  end if;

  return query
  select g.id
  from games g
  where v_target_count is null
    or (
      select count(*)
      from game_players gp
      where gp.game_id = g.id
    ) = v_target_count;
end;
$$;

create or replace function public.get_platform_leaderboard_payload(
  p_player_count_filter text default 'all'
)
returns jsonb
language sql
security definer
stable
set search_path = public
as $$
  with filtered_games as (
    select g.id, g.date, g.created_at
    from games g
    join get_platform_game_ids_by_player_count(p_player_count_filter) fg
      on fg.game_id = g.id
  )
  select jsonb_build_object(
    'game_players', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'game_id', gp.game_id,
            'characters_played', gp.characters_played,
            'total_toad_times', gp.total_toad_times,
            'is_winner', gp.is_winner,
            'winning_character', gp.winning_character,
            'player', jsonb_build_object('id', p.id, 'name', p.name),
            'game', jsonb_build_object('id', fg.id, 'date', fg.date, 'created_at', fg.created_at)
          )
        )
        from game_players gp
        join players p on p.id = gp.player_id
        join filtered_games fg on fg.id = gp.game_id
      ),
      '[]'::jsonb
    ),
    'deaths', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'game_id', d.game_id,
            'player_id', d.player_id,
            'killed_by_player_id', d.killed_by_player_id,
            'death_type', jsonb_build_object('name', dt.name)
          )
        )
        from game_player_deaths d
        left join death_types dt on dt.id = d.death_type_id
        join filtered_games fg on fg.id = d.game_id
      ),
      '[]'::jsonb
    )
  );
$$;

create or replace function public.get_platform_highscore_payload(
  p_player_count_filter text default 'all'
)
returns jsonb
language sql
security definer
stable
set search_path = public
as $$
  with filtered_games as (
    select g.id, g.date
    from games g
    join get_platform_game_ids_by_player_count(p_player_count_filter) fg
      on fg.game_id = g.id
  )
  select jsonb_build_object(
    'highscores', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'category', hs.category,
            'value', hs.value,
            'player', case
              when p.id is null then null
              else jsonb_build_object('id', p.id, 'name', p.name)
            end,
            'game', jsonb_build_object('id', fg.id, 'date', fg.date)
          )
        )
        from game_highscores hs
        left join players p on p.id = hs.player_id
        join filtered_games fg on fg.id = hs.game_id
      ),
      '[]'::jsonb
    ),
    'game_players', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'game_id', gp.game_id,
            'total_toad_times', gp.total_toad_times,
            'player', jsonb_build_object('id', p.id, 'name', p.name),
            'game', jsonb_build_object('id', fg.id, 'date', fg.date)
          )
        )
        from game_players gp
        join players p on p.id = gp.player_id
        join filtered_games fg on fg.id = gp.game_id
      ),
      '[]'::jsonb
    ),
    'deaths', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'game_id', d.game_id,
            'player_id', d.player_id
          )
        )
        from game_player_deaths d
        join filtered_games fg on fg.id = d.game_id
      ),
      '[]'::jsonb
    )
  );
$$;

create or replace function public.get_platform_stats_games()
returns jsonb
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', g.id,
        'optional_expansions', coalesce(to_jsonb(g.optional_expansions), '[]'::jsonb),
        'ending', (
          select jsonb_build_object('id', e.id, 'name', e.name, 'expansion', e.expansion)
          from endings e
          where e.id = g.ending_id
        ),
        'players', coalesce(
          (
            select jsonb_agg(
              jsonb_build_object(
                'id', gp.id,
                'characters_played', gp.characters_played,
                'is_winner', gp.is_winner,
                'winning_character', gp.winning_character,
                'player', jsonb_build_object('id', p.id, 'name', p.name)
              )
            )
            from game_players gp
            join players p on p.id = gp.player_id
            where gp.game_id = g.id
          ),
          '[]'::jsonb
        ),
        'expansion_events', coalesce(
          (
            select jsonb_agg(
              jsonb_build_object(
                'id', gee.id,
                'expansion', gee.expansion,
                'event_type', gee.event_type,
                'detail', gee.detail,
                'character', gee.character,
                'player', case
                  when p.id is null then null
                  else jsonb_build_object('id', p.id, 'name', p.name)
                end
              )
            )
            from game_expansion_events gee
            left join players p on p.id = gee.player_id
            where gee.game_id = g.id
          ),
          '[]'::jsonb
        ),
        'deaths', coalesce(
          (
            select jsonb_agg(
              jsonb_build_object(
                'id', d.id,
                'player_id', d.player_id,
                'killed_by_player_id', d.killed_by_player_id,
                'death_type', case
                  when dt.id is null then null
                  else jsonb_build_object('id', dt.id, 'name', dt.name)
                end,
                'character', case
                  when c.id is null then null
                  else jsonb_build_object('id', c.id, 'name', c.name)
                end,
                'killed_by', case
                  when kb.id is null then null
                  else jsonb_build_object('id', kb.id, 'name', kb.name)
                end
              )
            )
            from game_player_deaths d
            left join death_types dt on dt.id = d.death_type_id
            left join characters c on c.id = d.character_id
            left join players kb on kb.id = d.killed_by_player_id
            where d.game_id = g.id
          ),
          '[]'::jsonb
        )
      )
    ),
    '[]'::jsonb
  )
  from games g;
$$;

create or replace function public.get_platform_encounter_totals()
returns table(encounter_name text, creature_wins bigint, player_wins bigint)
language sql
security definer
stable
set search_path = public
as $$
  select
    es.encounter_name,
    sum(es.creature_wins)::bigint as creature_wins,
    sum(es.player_wins)::bigint as player_wins
  from encounter_scores es
  group by es.encounter_name
  order by es.encounter_name;
$$;

revoke all on function public.get_platform_game_ids_by_player_count(text) from public;

revoke all on function public.get_platform_leaderboard_payload(text) from public;
grant execute on function public.get_platform_leaderboard_payload(text) to authenticated;

revoke all on function public.get_platform_highscore_payload(text) from public;
grant execute on function public.get_platform_highscore_payload(text) to authenticated;

revoke all on function public.get_platform_stats_games() from public;
grant execute on function public.get_platform_stats_games() to authenticated;

revoke all on function public.get_platform_encounter_totals() from public;
grant execute on function public.get_platform_encounter_totals() to authenticated;
