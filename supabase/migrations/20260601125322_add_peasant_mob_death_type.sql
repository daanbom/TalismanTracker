insert into death_types (name, description)
values ('Peasant Mob', 'Killed by a peasant mob')
on conflict (name) do update set
  description = excluded.description;
