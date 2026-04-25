-- Expose member counts in public group directory.
drop function if exists list_all_groups();

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
    count(gm.user_id)::bigint as member_count
  from groups g
  left join group_members gm on gm.group_id = g.id
  group by g.id, g.name
  order by g.name;
$$;

revoke all on function list_all_groups() from public;
grant execute on function list_all_groups() to authenticated;
