-- The previous select/update policies called `select email from auth.users`,
-- which executes with the caller's privileges and fails with "permission
-- denied for table users" for regular authenticated clients. The failing
-- subquery also poisons the admin branch of the OR, so admins got 403 too.
-- Replace with auth.jwt() ->> 'email', which reads from JWT claims and
-- requires no table permissions.

drop policy if exists group_invites_select_admin_or_target on group_invites;
create policy group_invites_select_admin_or_target on group_invites
  for select using (
    exists (select 1 from groups g where g.id = group_invites.group_id and g.admin_user_id = auth.uid())
    or (
      invited_email = lower(auth.jwt() ->> 'email')
      and status = 'pending'
      and expires_at > now()
    )
  );

drop policy if exists group_invites_update_target_decline on group_invites;
create policy group_invites_update_target_decline on group_invites
  for update using (
    invited_email = lower(auth.jwt() ->> 'email')
    and status = 'pending'
  ) with check (status = 'revoked');
