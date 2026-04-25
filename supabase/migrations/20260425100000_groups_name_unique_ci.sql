-- Prevent duplicate group names (case-insensitive, trimmed).
create unique index if not exists groups_name_unique_ci
  on groups (lower(btrim(name)));
