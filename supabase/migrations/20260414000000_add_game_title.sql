-- Add mandatory title column to games
alter table games add column title text;

update games
set title = 'Game on ' || to_char(date, 'YYYY-MM-DD')
where title is null;

alter table games alter column title set not null;
alter table games add constraint games_title_length check (char_length(title) between 1 and 100);
