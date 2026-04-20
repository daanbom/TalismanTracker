-- Atomic: verify invite → insert group_members → mark invite accepted.
create or replace function accept_group_invite(p_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite   group_invites%rowtype;
  v_user_id  uuid := auth.uid();
  v_email    text;
  v_player   uuid;
begin
  if v_user_id is null then raise exception 'not_authenticated'; end if;

  select email into v_email from auth.users where id = v_user_id;
  select * into v_invite from group_invites where token = p_token for update;

  if not found then raise exception 'invite_not_found'; end if;
  if v_invite.status <> 'pending' then raise exception 'invite_not_pending'; end if;
  if v_invite.expires_at <= now() then raise exception 'invite_expired'; end if;
  if v_invite.invited_email <> lower(v_email) then raise exception 'invite_email_mismatch'; end if;

  select id into v_player from players where user_id = v_user_id;
  if v_player is null then raise exception 'no_player_profile'; end if;

  insert into group_members (group_id, user_id, player_id)
    values (v_invite.group_id, v_user_id, v_player)
    on conflict (group_id, user_id) do nothing;

  update group_invites set status = 'accepted' where id = v_invite.id;

  update group_invites
    set status = 'accepted'
    where group_id = v_invite.group_id
      and invited_email = lower(v_email)
      and status = 'pending'
      and id <> v_invite.id;

  return v_invite.group_id;
end;
$$;

revoke all on function accept_group_invite(text) from public;
grant execute on function accept_group_invite(text) to authenticated;

-- Link-lookup: resolve invite_code → (id, name) without widening the groups select policy.
create or replace function get_group_by_invite_code(p_code text)
returns table(id uuid, name text)
language sql
security definer
stable
set search_path = public
as $$
  select id, name from groups where invite_code = p_code;
$$;

revoke all on function get_group_by_invite_code(text) from public;
grant execute on function get_group_by_invite_code(text) to authenticated;
