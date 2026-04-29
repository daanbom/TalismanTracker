-- Issue #87: per-group house rules stored as a JSONB document.

create table if not exists group_house_rules (
  group_id   uuid primary key references groups(id) on delete cascade,
  content    jsonb not null default '{"sections": []}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table group_house_rules enable row level security;

create policy group_house_rules_select on group_house_rules
  for select using (is_group_member(group_id, auth.uid()));

create policy group_house_rules_insert on group_house_rules
  for insert with check (is_group_admin(group_id, auth.uid()));

create policy group_house_rules_update on group_house_rules
  for update using (is_group_admin(group_id, auth.uid()))
            with check (is_group_admin(group_id, auth.uid()));

create policy group_house_rules_delete on group_house_rules
  for delete using (is_group_admin(group_id, auth.uid()));

create or replace function touch_group_house_rules_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_group_house_rules_touch on group_house_rules;

create trigger trg_group_house_rules_touch
  before update on group_house_rules
  for each row execute function touch_group_house_rules_updated_at();
