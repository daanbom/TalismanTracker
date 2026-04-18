-- Per-player character tierlist.
-- Stored as a JSONB object of { S: [icon_key, ...], A: [...], B: [...], C: [...], D: [...], F: [...] }.
-- Icon keys (not character ids) are stored so that Toad (no character row) is rankable and
-- deletions/renames in the icons table surface as dangling keys that the client filters.

create table tierlists (
  id         uuid primary key default gen_random_uuid(),
  player_id  uuid not null unique references players(id) on delete cascade,
  tiers      jsonb not null default '{"S":[],"A":[],"B":[],"C":[],"D":[],"F":[]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger tierlists_set_updated_at
  before update on tierlists
  for each row execute function set_updated_at();
