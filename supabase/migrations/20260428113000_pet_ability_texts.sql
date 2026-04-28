update pets
set ability_text = case key
  when 'fang' then 'Once per battle or psychic combat, you may reroll your attack roll. Fang cannot be taken by another character''s special ability or Spell.'
  when 'fez' then 'Whenever you land on a space with instructions to draw 1 or more Adventure Cards, before you encounter the space you may move 1 faceup Adventure Card in the same Region to your space. You may only do this once per turn.'
  when 'glitter' then 'You always have at least 1 Spell, regardless of your Craft. If, at any time, you do not have a Spell, gain 1 Spell.'
  when 'hopper' then 'Whenever you land on a space with a card or character, you may move to the next space, continuing in the same direction you were moving (clockwise or counterclockwise).'
  when 'lucky' then 'At the start of your turn, you may replenish 1 fate.'
  when 'luna' then 'Whenever you pay a fate to reroll a die, you choose which result on the die to use instead of rolling it.'
  when 'singe' then 'Add 1 to your Strength and 1 to your Craft. If you are defeated by an Enemy Dragon, you must discard Singe.'
  when 'stinker' then 'Instead of attacking an Enemy, you may place it in the next space clockwise or counterclockwise. You may only do this once per turn.'
  when 'stompy' then 'After you have finished moving, you may discard 1 Adventure Card on your space.'
  when 'terrance' then 'Instead of rolling the die for your movement, you may move 1 space.'
  when 'wart' then 'After you resolve an encounter with another character, the character must roll a die. If he rolls a 1, he is turned into a slimy little Toad for 3 turns.'
  when 'whiskers' then 'Whenever you encounter a space with instructions to draw 1 or more Adventure Cards, you may draw 1 extra Adventure card and place it in that space.'
  else ability_text
end
where key in (
  'fang',
  'fez',
  'glitter',
  'hopper',
  'lucky',
  'luna',
  'singe',
  'stinker',
  'stompy',
  'terrance',
  'wart',
  'whiskers'
);
