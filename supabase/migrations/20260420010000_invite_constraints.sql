-- Case-insensitive storage for invited emails.
alter table group_invites
  add constraint group_invites_email_lowercase
  check (invited_email = lower(invited_email));

-- One pending invite per (group, email). Admin re-invite updates the existing row.
create unique index group_invites_one_pending_per_email
  on group_invites (group_id, invited_email)
  where status = 'pending';

-- Default 7-day expiry; backfill, then NOT NULL.
alter table group_invites
  alter column expires_at set default (now() + interval '7 days');
update group_invites set expires_at = now() + interval '7 days' where expires_at is null;
alter table group_invites alter column expires_at set not null;

-- Target-side select: case-insensitive, pending-only, non-expired.
drop policy group_invites_select_admin_or_target on group_invites;
create policy group_invites_select_admin_or_target on group_invites
  for select using (
    exists (select 1 from groups g where g.id = group_invites.group_id and g.admin_user_id = auth.uid())
    or (
      invited_email = lower((select email from auth.users where id = auth.uid()))
      and status = 'pending'
      and expires_at > now()
    )
  );

-- Decline: the target user may flip their own pending invite to revoked.
create policy group_invites_update_target_decline on group_invites
  for update using (
    invited_email = lower((select email from auth.users where id = auth.uid()))
    and status = 'pending'
  ) with check (status = 'revoked');
