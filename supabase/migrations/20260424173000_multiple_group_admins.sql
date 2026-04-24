-- Issue #91: support multiple admins per group.

alter table group_members
  add column if not exists is_admin boolean not null default false;

-- Backfill existing owners as admins in their member row.
update group_members gm
set is_admin = true
from groups g
where g.id = gm.group_id
  and g.admin_user_id = gm.user_id
  and gm.is_admin is distinct from true;

create index if not exists group_members_admin_idx
  on group_members(group_id)
  where is_admin = true;

create or replace function is_group_admin(p_group_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from groups g
    where g.id = p_group_id
      and g.admin_user_id = p_user_id
  )
  or exists (
    select 1
    from group_members gm
    where gm.group_id = p_group_id
      and gm.user_id = p_user_id
      and gm.is_admin = true
  );
$$;

revoke all on function is_group_admin(uuid, uuid) from public;
grant execute on function is_group_admin(uuid, uuid) to authenticated;

drop policy if exists groups_update_admin on groups;
create policy groups_update_admin on groups
  for update using (is_group_admin(id, auth.uid()))
  with check (is_group_admin(id, auth.uid()));

drop policy if exists groups_delete_admin on groups;
create policy groups_delete_admin on groups
  for delete using (is_group_admin(id, auth.uid()));

drop policy if exists group_members_insert_self on group_members;
create policy group_members_insert_self on group_members
  for insert with check (
    user_id = auth.uid()
    and (
      is_admin = false
      or is_group_admin(group_id, auth.uid())
    )
  );

drop policy if exists group_members_delete_self_or_admin on group_members;
create policy group_members_delete_self_or_admin on group_members
  for delete using (
    user_id = auth.uid()
    or (
      is_group_admin(group_id, auth.uid())
      and not exists (
        select 1
        from groups g
        where g.id = group_members.group_id
          and g.admin_user_id = group_members.user_id
      )
    )
  );

drop policy if exists group_invites_select_admin_or_target on group_invites;
create policy group_invites_select_admin_or_target on group_invites
  for select using (
    is_group_admin(group_id, auth.uid())
    or invited_email = lower(auth.jwt() ->> 'email')
  );

drop policy if exists group_invites_insert_admin on group_invites;
create policy group_invites_insert_admin on group_invites
  for insert with check (is_group_admin(group_id, auth.uid()));

drop policy if exists group_invites_update_admin on group_invites;
create policy group_invites_update_admin on group_invites
  for update using (is_group_admin(group_id, auth.uid()));

drop policy if exists group_invites_delete_admin on group_invites;
create policy group_invites_delete_admin on group_invites
  for delete using (is_group_admin(group_id, auth.uid()));

drop policy if exists group_join_requests_select_admin_or_self on group_join_requests;
create policy group_join_requests_select_admin_or_self on group_join_requests
  for select using (
    user_id = auth.uid()
    or is_group_admin(group_id, auth.uid())
  );

drop policy if exists group_join_requests_update_admin on group_join_requests;
create policy group_join_requests_update_admin on group_join_requests
  for update using (is_group_admin(group_id, auth.uid()));

drop policy if exists group_join_requests_delete_admin_or_self on group_join_requests;
create policy group_join_requests_delete_admin_or_self on group_join_requests
  for delete using (
    user_id = auth.uid()
    or is_group_admin(group_id, auth.uid())
  );

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
        is_group_admin(g.group_id, p_user_id)
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

drop policy if exists games_delete_admin_only on games;
create policy games_delete_admin_only on games
  for delete using (is_group_admin(group_id, auth.uid()));

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
    and is_group_admin(p_group_id, auth.uid())
  order by gjr.created_at asc;
$$;

revoke all on function get_pending_join_requests(uuid) from public;
grant execute on function get_pending_join_requests(uuid) to authenticated;

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

  if not is_group_admin(v_group_id, v_caller) then
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

create or replace function set_group_member_admin(
  p_group_id uuid,
  p_user_id uuid,
  p_is_admin boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
begin
  if v_caller is null then
    raise exception 'not_authenticated';
  end if;

  if not is_group_admin(p_group_id, v_caller) then
    raise exception 'not_admin';
  end if;

  if not exists (
    select 1
    from group_members gm
    where gm.group_id = p_group_id
      and gm.user_id = p_user_id
  ) then
    raise exception 'member_not_found';
  end if;

  if exists (
    select 1
    from groups g
    where g.id = p_group_id
      and g.admin_user_id = p_user_id
      and p_is_admin = false
  ) then
    raise exception 'cannot_demote_owner';
  end if;

  update group_members
  set is_admin = p_is_admin
  where group_id = p_group_id
    and user_id = p_user_id;
end;
$$;

revoke all on function set_group_member_admin(uuid, uuid, boolean) from public;
grant execute on function set_group_member_admin(uuid, uuid, boolean) to authenticated;
