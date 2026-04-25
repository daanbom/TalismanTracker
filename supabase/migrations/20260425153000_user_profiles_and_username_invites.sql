-- Issue #105: move identity concerns to user_profiles and switch invite/login to username-first.

create table if not exists user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  created_at timestamptz not null default now(),
  constraint user_profiles_username_lowercase
    check (username = lower(username)),
  constraint user_profiles_username_format
    check (username ~ '^[a-z0-9_]{3,20}$')
);

create unique index if not exists user_profiles_username_unique_ci
  on user_profiles (lower(username));

alter table user_profiles enable row level security;

drop policy if exists user_profiles_select_self on user_profiles;
create policy user_profiles_select_self on user_profiles
  for select using (user_id = auth.uid());

drop policy if exists user_profiles_insert_self on user_profiles;
create policy user_profiles_insert_self on user_profiles
  for insert with check (user_id = auth.uid());

drop policy if exists user_profiles_update_self on user_profiles;
create policy user_profiles_update_self on user_profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table group_invites
  add column if not exists invited_user_id uuid references user_profiles(user_id) on delete cascade;

alter table group_invites
  alter column invited_email drop not null;

create index if not exists group_invites_invited_user_idx
  on group_invites(invited_user_id);

create unique index if not exists group_invites_one_pending_per_user
  on group_invites (group_id, invited_user_id)
  where status = 'pending' and invited_user_id is not null;

drop policy if exists group_invites_select_admin_or_target on group_invites;
create policy group_invites_select_admin_or_target on group_invites
  for select using (
    is_group_admin(group_id, auth.uid())
    or (
      invited_user_id = auth.uid()
      and status = 'pending'
      and expires_at > now()
    )
  );

drop policy if exists group_invites_update_target_decline on group_invites;
create policy group_invites_update_target_decline on group_invites
  for update using (
    invited_user_id = auth.uid()
    and status = 'pending'
  ) with check (status = 'revoked');

create or replace function get_email_for_username(p_username text)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select lower(au.email)
  from user_profiles up
  join auth.users au on au.id = up.user_id
  where up.username = lower(trim(p_username))
  limit 1;
$$;

revoke all on function get_email_for_username(text) from public;
grant execute on function get_email_for_username(text) to anon, authenticated;

create or replace function create_group_invite_by_username(
  p_group_id uuid,
  p_username text,
  p_token text,
  p_expires_at timestamptz default null
)
returns table(id uuid, invited_username text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller uuid := auth.uid();
  v_target_user_id uuid;
  v_target_username text;
  v_existing_id uuid;
  v_expires_at timestamptz := coalesce(p_expires_at, now() + interval '7 days');
begin
  if v_caller is null then raise exception 'not_authenticated'; end if;
  if not is_group_admin(p_group_id, v_caller) then raise exception 'not_admin'; end if;

  if coalesce(length(trim(p_token)), 0) < 16 then
    raise exception 'invalid_token';
  end if;

  select up.user_id, up.username
  into v_target_user_id, v_target_username
  from user_profiles up
  where up.username = lower(trim(p_username))
  limit 1;

  if v_target_user_id is null then raise exception 'username_not_found'; end if;
  if v_target_user_id = v_caller then raise exception 'cannot_invite_self'; end if;

  select gi.id
  into v_existing_id
  from group_invites gi
  where gi.group_id = p_group_id
    and gi.invited_user_id = v_target_user_id
    and gi.status = 'pending'
  for update;

  if v_existing_id is null then
    insert into group_invites (group_id, invited_user_id, token, status, expires_at)
    values (p_group_id, v_target_user_id, p_token, 'pending', v_expires_at)
    returning group_invites.id into v_existing_id;
  else
    update group_invites
    set token = p_token,
        expires_at = v_expires_at
    where group_invites.id = v_existing_id;
  end if;

  return query
  select v_existing_id, v_target_username;
end;
$$;

revoke all on function create_group_invite_by_username(uuid, text, text, timestamptz) from public;
grant execute on function create_group_invite_by_username(uuid, text, text, timestamptz) to authenticated;

create or replace function get_group_invites_for_admin(
  p_group_id uuid,
  p_include_history boolean default false
)
returns table(
  id uuid,
  invited_user_id uuid,
  invited_username text,
  status text,
  expires_at timestamptz,
  created_at timestamptz
)
language sql
security definer
stable
set search_path = public
as $$
  select
    gi.id,
    gi.invited_user_id,
    up.username as invited_username,
    gi.status,
    gi.expires_at,
    gi.created_at
  from group_invites gi
  left join user_profiles up on up.user_id = gi.invited_user_id
  where gi.group_id = p_group_id
    and is_group_admin(p_group_id, auth.uid())
    and (
      (not coalesce(p_include_history, false) and gi.status = 'pending')
      or (coalesce(p_include_history, false) and gi.created_at >= now() - interval '30 days')
    )
  order by gi.created_at desc;
$$;

revoke all on function get_group_invites_for_admin(uuid, boolean) from public;
grant execute on function get_group_invites_for_admin(uuid, boolean) to authenticated;

-- Atomic: verify invite -> insert group_members -> mark invite accepted.
create or replace function accept_group_invite(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite   group_invites%rowtype;
  v_user_id  uuid := auth.uid();
  v_player   uuid;
begin
  if v_user_id is null then raise exception 'not_authenticated'; end if;

  select * into v_invite from group_invites where token = p_token for update;

  if not found then raise exception 'invite_not_found'; end if;
  if v_invite.status <> 'pending' then raise exception 'invite_not_pending'; end if;
  if v_invite.expires_at <= now() then raise exception 'invite_expired'; end if;
  if v_invite.invited_user_id is distinct from v_user_id then raise exception 'invite_target_mismatch'; end if;

  select id into v_player from players where user_id = v_user_id;
  if v_player is null then raise exception 'no_player_profile'; end if;

  insert into group_members (group_id, user_id, player_id)
    values (v_invite.group_id, v_user_id, v_player)
    on conflict (group_id, user_id) do nothing;

  update group_invites
    set status = 'accepted'
    where group_id = v_invite.group_id
      and invited_user_id = v_user_id
      and status = 'pending';

  return v_invite.group_id;
end;
$$;

revoke all on function accept_group_invite(text) from public;
grant execute on function accept_group_invite(text) to authenticated;

create or replace function get_pending_invites_for_me()
returns table (
  id uuid,
  token text,
  group_id uuid,
  expires_at timestamptz,
  group_name text
)
language sql
security definer
stable
set search_path = public
as $$
  select gi.id, gi.token, gi.group_id, gi.expires_at, g.name as group_name
  from group_invites gi
  join groups g on g.id = gi.group_id
  where gi.invited_user_id = auth.uid()
    and gi.status = 'pending'
    and gi.expires_at > now()
  order by gi.created_at desc;
$$;

revoke all on function get_pending_invites_for_me() from public;
grant execute on function get_pending_invites_for_me() to authenticated;
