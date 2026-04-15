-- Add total_toad_times to game_players and stop storing most_deaths /
-- most_toad_times in game_highscores. Both are now derived from
-- game_players on the client (see useHighscoreRecords).

alter table game_players
  add column total_toad_times int not null default 0
    check (total_toad_times >= 0);

delete from game_highscores
  where category in ('most_deaths', 'most_toad_times');

alter table game_highscores
  drop constraint game_highscores_category_check;

alter table game_highscores
  add constraint game_highscores_category_check
    check (category in (
      'most_followers',
      'most_objects',
      'most_denizens_on_spot',
      'most_gold',
      'most_fate',
      'most_strength',
      'most_craft',
      'most_life',
      'longest_toad_streak'
    ));
