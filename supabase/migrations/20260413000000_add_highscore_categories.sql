-- Add new highscore categories
alter table game_highscores
  drop constraint game_highscores_category_check;

alter table game_highscores
  add constraint game_highscores_category_check
    check (category in (
      'most_followers',
      'most_objects',
      'most_denizens_on_spot',
      'most_deaths',
      'most_gold',
      'most_fate',
      'most_strength',
      'most_craft',
      'most_life',
      'most_toad_times',
      'longest_toad_streak'
    ));
