-- Rename the "Crown of Command" death type to "Ending" (covers all ending deaths, not only CoC).
update death_types
set name = 'Ending',
    description = 'Killed at the game''s ending'
where name = 'Crown of Command';
