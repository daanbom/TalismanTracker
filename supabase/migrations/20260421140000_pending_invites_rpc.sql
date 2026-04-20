-- usePendingInvites needs the group name, but the `groups` select policy is
-- members-only — pending invitees aren't members yet, so the embedded
-- groups(name) join comes back null. SECURITY DEFINER function returns the
-- join result scoped to the caller's email without widening any policy.

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
  where gi.invited_email = lower(auth.jwt() ->> 'email')
    and gi.status = 'pending'
    and gi.expires_at > now()
  order by gi.created_at desc;
$$;

revoke all on function get_pending_invites_for_me() from public;
grant execute on function get_pending_invites_for_me() to authenticated;
