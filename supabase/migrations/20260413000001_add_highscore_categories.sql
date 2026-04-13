-- Expand allowed highscore categories.
-- Replaces the original 4-value constraint with the full set.
-- Migrate legacy 'most_coins' rows to 'most_gold' before re-adding the constraint.
alter table game_highscores
  drop constraint game_highscores_category_check;

update game_highscores set category = 'most_gold' where category = 'most_coins';

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
