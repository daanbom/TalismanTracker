-- Groups
create table groups (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  admin_user_id   uuid not null references auth.users(id) on delete cascade,
  invite_code     text not null unique,
  created_at      timestamptz not null default now()
);

create index groups_admin_user_id_idx on groups(admin_user_id);

-- Membership: one user can be in multiple groups.
create table group_members (
  group_id    uuid not null references groups(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  player_id   uuid not null references players(id) on delete cascade,
  joined_at   timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index group_members_user_idx on group_members(user_id);
create index group_members_player_idx on group_members(player_id);

-- Invite by email (used in #67).
create table group_invites (
  id              uuid primary key default gen_random_uuid(),
  group_id        uuid not null references groups(id) on delete cascade,
  invited_email   text not null,
  token           text not null unique,
  status          text not null default 'pending' check (status in ('pending','accepted','revoked','expired')),
  expires_at      timestamptz,
  created_at      timestamptz not null default now()
);

create index group_invites_group_idx on group_invites(group_id);

-- Request-to-join (used in #68).
create table group_join_requests (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references groups(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  status      text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at  timestamptz not null default now(),
  unique (group_id, user_id)
);

-- Schema prep for #72/#73: nullable today, populated and NOT NULL later.
alter table games add column group_id uuid references groups(id) on delete set null;
create index games_group_id_idx on games(group_id);

alter table encounter_scores add column group_id uuid references groups(id) on delete set null;
create index encounter_scores_group_id_idx on encounter_scores(group_id);

-- RLS
alter table groups               enable row level security;
alter table group_members        enable row level security;
alter table group_invites        enable row level security;
alter table group_join_requests  enable row level security;

-- Helper: checks group membership without re-triggering RLS on group_members.
-- SECURITY DEFINER bypasses RLS inside the function body, avoiding infinite recursion
-- when policies on group_members / groups need to read group_members.
create or replace function is_group_member(p_group_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from group_members
    where group_id = p_group_id and user_id = p_user_id
  );
$$;

revoke all on function is_group_member(uuid, uuid) from public;
grant execute on function is_group_member(uuid, uuid) to authenticated;

-- groups: readable by members; admin can update/delete; any authed user can insert themselves as admin.
create policy groups_select_members on groups
  for select using (is_group_member(id, auth.uid()));

create policy groups_insert_self_admin on groups
  for insert with check (auth.uid() is not null and admin_user_id = auth.uid());

create policy groups_update_admin on groups
  for update using (admin_user_id = auth.uid()) with check (admin_user_id = auth.uid());

create policy groups_delete_admin on groups
  for delete using (admin_user_id = auth.uid());

-- group_members: readable by any member of the same group; a user can insert their own membership;
-- deletion allowed by the member themselves or by the group admin.
create policy group_members_select_same_group on group_members
  for select using (is_group_member(group_id, auth.uid()));

create policy group_members_insert_self on group_members
  for insert with check (user_id = auth.uid());

create policy group_members_delete_self_or_admin on group_members
  for delete using (
    user_id = auth.uid()
    or exists (select 1 from groups g where g.id = group_members.group_id and g.admin_user_id = auth.uid())
  );

-- group_invites: readable by group admin or by the invited email's user; writable by admin only.
create policy group_invites_select_admin_or_target on group_invites
  for select using (
    exists (select 1 from groups g where g.id = group_invites.group_id and g.admin_user_id = auth.uid())
    or invited_email = (select email from auth.users where id = auth.uid())
  );

create policy group_invites_insert_admin on group_invites
  for insert with check (
    exists (select 1 from groups g where g.id = group_invites.group_id and g.admin_user_id = auth.uid())
  );

create policy group_invites_update_admin on group_invites
  for update using (
    exists (select 1 from groups g where g.id = group_invites.group_id and g.admin_user_id = auth.uid())
  );

create policy group_invites_delete_admin on group_invites
  for delete using (
    exists (select 1 from groups g where g.id = group_invites.group_id and g.admin_user_id = auth.uid())
  );

-- group_join_requests: admin of the group and the requester can read; requester can insert;
-- only admin can update status (approve/reject).
create policy group_join_requests_select_admin_or_self on group_join_requests
  for select using (
    user_id = auth.uid()
    or exists (select 1 from groups g where g.id = group_join_requests.group_id and g.admin_user_id = auth.uid())
  );

create policy group_join_requests_insert_self on group_join_requests
  for insert with check (user_id = auth.uid());

create policy group_join_requests_update_admin on group_join_requests
  for update using (
    exists (select 1 from groups g where g.id = group_join_requests.group_id and g.admin_user_id = auth.uid())
  );

create policy group_join_requests_delete_admin_or_self on group_join_requests
  for delete using (
    user_id = auth.uid()
    or exists (select 1 from groups g where g.id = group_join_requests.group_id and g.admin_user_id = auth.uid())
  );
