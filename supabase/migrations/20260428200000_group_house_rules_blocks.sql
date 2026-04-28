-- Issue #87: per-group house rules with editable ordered blocks.

create table if not exists group_house_rules_blocks (
  id         uuid primary key default gen_random_uuid(),
  group_id   uuid not null references groups(id) on delete cascade,
  position   integer not null check (position >= 0),
  kind       text not null default 'text' check (kind in ('text', 'bullets')),
  title      text not null check (length(btrim(title)) > 0),
  content    text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists group_house_rules_blocks_group_idx
  on group_house_rules_blocks(group_id, position);

alter table group_house_rules_blocks enable row level security;

create policy group_house_rules_blocks_select_same_group on group_house_rules_blocks
  for select using (is_group_member(group_id, auth.uid()));

create policy group_house_rules_blocks_insert_admin on group_house_rules_blocks
  for insert with check (is_group_admin(group_id, auth.uid()));

create policy group_house_rules_blocks_update_admin on group_house_rules_blocks
  for update using (is_group_admin(group_id, auth.uid()))
  with check (is_group_admin(group_id, auth.uid()));

create policy group_house_rules_blocks_delete_admin on group_house_rules_blocks
  for delete using (is_group_admin(group_id, auth.uid()));

create or replace function touch_group_house_rules_blocks_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger trg_group_house_rules_blocks_touch
before update on group_house_rules_blocks
for each row
execute function touch_group_house_rules_blocks_updated_at();

create or replace function replace_group_house_rules_blocks(
  p_group_id uuid,
  p_blocks jsonb
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

  if p_blocks is null then
    raise exception 'blocks_required';
  end if;

  if jsonb_typeof(p_blocks) <> 'array' then
    raise exception 'blocks_must_be_array';
  end if;

  delete from group_house_rules_blocks
  where group_id = p_group_id;

  insert into group_house_rules_blocks (group_id, position, kind, title, content)
  select
    p_group_id,
    coalesce((item->>'position')::integer, ordinality - 1),
    coalesce(item->>'kind', 'text'),
    coalesce(nullif(btrim(item->>'title'), ''), 'Untitled'),
    coalesce(item->>'content', '')
  from jsonb_array_elements(p_blocks) with ordinality as rows(item, ordinality)
  where item is not null;
end;
$$;

revoke all on function replace_group_house_rules_blocks(uuid, jsonb) from public;
grant execute on function replace_group_house_rules_blocks(uuid, jsonb) to authenticated;
