-- Public group directory count should include both members and guests.
create or replace function list_all_groups()
returns table(id uuid, name text, member_count bigint)
language sql
security definer
stable
set search_path = public
as $$
  select
    g.id,
    g.name,
    (
      select count(*)
      from (
        select gm.player_id
        from group_members gm
        where gm.group_id = g.id
        union
        select ggp.player_id
        from group_guest_players ggp
        where ggp.group_id = g.id
      ) as players_in_group
    )::bigint as member_count
  from groups g
  order by g.name;
$$;

revoke all on function list_all_groups() from public;
grant execute on function list_all_groups() to authenticated;
