do $$
begin
  if exists (select 1 from games where group_id is null) then
    raise exception 'games.group_id still contains null rows; backfill before applying this migration';
  end if;
end;
$$;

alter table games
alter column group_id set not null;
