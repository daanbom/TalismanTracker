-- Fix: creating a group via insert().select() fails because the SELECT RLS policy
-- requires membership, but the group_members row isn't inserted until the next
-- statement. Allow admins to select their own groups in addition to members.

drop policy if exists groups_select_members on groups;

create policy groups_select_member_or_admin on groups
  for select using (
    admin_user_id = auth.uid()
    or is_group_member(id, auth.uid())
  );
