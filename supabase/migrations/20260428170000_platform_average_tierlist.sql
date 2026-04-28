create or replace function public.get_platform_average_tierlist(p_list_type text default 'character')
returns jsonb
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_row record;
  v_tier text;
  v_key text;
  v_points integer;
  v_totals jsonb := '{}'::jsonb;
  v_counts jsonb := '{}'::jsonb;
  v_stats jsonb := '{}'::jsonb;
  v_seen text[];
  v_total numeric;
  v_count integer;
  v_player_count integer := 0;
  v_submitted_count integer := 0;
begin
  if p_list_type not in ('character', 'pet') then
    raise exception 'Invalid list_type: %', p_list_type using errcode = '22023';
  end if;

  select count(*) into v_player_count from players;

  select count(distinct player_id)
    into v_submitted_count
  from tierlists
  where list_type = p_list_type;

  for v_row in
    select player_id, tiers
    from tierlists
    where list_type = p_list_type
  loop
    v_seen := array[]::text[];

    foreach v_tier in array ARRAY['S', 'A', 'B', 'C', 'D', 'F']
    loop
      v_points := case v_tier
        when 'S' then 6
        when 'A' then 5
        when 'B' then 4
        when 'C' then 3
        when 'D' then 2
        else 1
      end;

      for v_key in
        select jsonb_array_elements_text(coalesce(v_row.tiers -> v_tier, '[]'::jsonb))
      loop
        if v_key is null or btrim(v_key) = '' then
          continue;
        end if;

        if v_key = any(v_seen) then
          continue;
        end if;

        v_seen := array_append(v_seen, v_key);

        v_totals := jsonb_set(
          v_totals,
          ARRAY[v_key],
          to_jsonb(coalesce((v_totals ->> v_key)::numeric, 0) + v_points),
          true
        );

        v_counts := jsonb_set(
          v_counts,
          ARRAY[v_key],
          to_jsonb(coalesce((v_counts ->> v_key)::integer, 0) + 1),
          true
        );
      end loop;
    end loop;
  end loop;

  for v_key in
    select jsonb_object_keys(v_totals)
  loop
    v_total := coalesce((v_totals ->> v_key)::numeric, 0);
    v_count := coalesce((v_counts ->> v_key)::integer, 0);

    if v_count <= 0 then
      continue;
    end if;

    v_stats := jsonb_set(
      v_stats,
      ARRAY[v_key],
      jsonb_build_object(
        'average', round((v_total / v_count)::numeric, 4),
        'count', v_count,
        'total', v_total
      ),
      true
    );
  end loop;

  return jsonb_build_object(
    'stats_by_key', v_stats,
    'player_count', v_player_count,
    'submitted_count', v_submitted_count
  );
end;
$$;

revoke all on function public.get_platform_average_tierlist(text) from public;
grant execute on function public.get_platform_average_tierlist(text) to authenticated;
