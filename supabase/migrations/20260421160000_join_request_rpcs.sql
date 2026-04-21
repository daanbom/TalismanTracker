-- list_all_groups: public directory (id + name only — no invite_code leakage).
create or replace function list_all_groups()
returns table(id uuid, name text)
language sql
security definer
stable
set search_path = public
as $$
  select id, name from groups order by name;
$$;

revoke all on function list_all_groups() from public;
grant execute on function list_all_groups() to authenticated;

-- get_pending_join_requests: admin-only; joins players to resolve requester name.
create or replace function get_pending_join_requests(p_group_id uuid)
returns table(id uuid, user_id uuid, created_at timestamptz, player_name text)
language sql
security definer
stable
set search_path = public
as $$
  select
    gjr.id,
    gjr.user_id,
    gjr.created_at,
    p.name as player_name
  from group_join_requests gjr
  left join players p on p.user_id = gjr.user_id
  where gjr.group_id = p_group_id
    and gjr.status = 'pending'
    and exists (
      select 1 from groups g
      where g.id = p_group_id
        and g.admin_user_id = auth.uid()
    )
  order by gjr.created_at asc;
$$;

revoke all on function get_pending_join_requests(uuid) from public;
grant execute on function get_pending_join_requests(uuid) to authenticated;

-- approve_join_request: atomically verifies admin, inserts group_members, marks approved.
create or replace function approve_join_request(p_request_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request  group_join_requests%rowtype;
  v_player   uuid;
  v_caller   uuid := auth.uid();
begin
  if v_caller is null then raise exception 'not_authenticated'; end if;

  select * into v_request
  from group_join_requests
  where id = p_request_id
  for update;

  if not found then raise exception 'request_not_found'; end if;
  if v_request.status <> 'pending' then raise exception 'request_not_pending'; end if;

  if not exists (
    select 1 from groups
    where id = v_request.group_id and admin_user_id = v_caller
  ) then
    raise exception 'not_admin';
  end if;

  select id into v_player from players where user_id = v_request.user_id;

  insert into group_members (group_id, user_id, player_id)
    values (v_request.group_id, v_request.user_id, v_player)
    on conflict (group_id, user_id) do nothing;

  update group_join_requests set status = 'approved' where id = p_request_id;

  return v_request.group_id;
end;
$$;

revoke all on function approve_join_request(uuid) from public;
grant execute on function approve_join_request(uuid) to authenticated;
