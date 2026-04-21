-- Fix approve_join_request: move admin check before FOR UPDATE lock; add null guard on v_player.
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
  v_group_id uuid;
begin
  if v_caller is null then raise exception 'not_authenticated'; end if;

  -- Read group_id without locking to verify admin before acquiring FOR UPDATE.
  select group_id into v_group_id
  from group_join_requests
  where id = p_request_id;

  if not found then raise exception 'request_not_found'; end if;

  if not exists (
    select 1 from groups
    where id = v_group_id and admin_user_id = v_caller
  ) then
    raise exception 'not_admin';
  end if;

  -- Now lock the row for the atomic update.
  select * into v_request
  from group_join_requests
  where id = p_request_id
  for update;

  if v_request.status <> 'pending' then raise exception 'request_not_pending'; end if;

  select id into v_player from players where user_id = v_request.user_id;
  if v_player is null then raise exception 'no_player_profile'; end if;

  insert into group_members (group_id, user_id, player_id)
    values (v_request.group_id, v_request.user_id, v_player)
    on conflict (group_id, user_id) do nothing;

  update group_join_requests set status = 'approved' where id = p_request_id;

  return v_request.group_id;
end;
$$;

revoke all on function approve_join_request(uuid) from public;
grant execute on function approve_join_request(uuid) to authenticated;
