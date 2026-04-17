export const RULEBOOKS = [
  { name: 'Base Game', url: 'https://cdn.1j1ju.com/medias/6b/ae/41-talisman-revised-4th-edition-rulebook.pdf' },
  { name: 'The Reaper', url: 'https://cdn.1j1ju.com/medias/c8/40/47-talisman-the-reaper-rulebook.pdf' },
  { name: 'The Frostmarch', url: 'https://www.talismanisland.com/rules.htm' },
  { name: 'The Dragon', url: 'https://cdn.1j1ju.com/medias/37/48/a6-talisman-revised-4th-edition-the-dragon-rulebook.pdf' },
  { name: 'The Woodland', url: 'https://cdn.1j1ju.com/medias/90/db/fc-talisman-revised-4th-edition-the-woodland-rulebook.pdf' },
  { name: 'The City', url: 'https://cdn.1j1ju.com/medias/f0/bc/72-talisman-the-city-rulebook.pdf' },
  { name: 'The Harbinger', url: 'https://cdn.1j1ju.com/medias/ee/a3/67-talisman-revised-4th-edition-the-harbinger-rulebook.pdf' },
  { name: 'The Firelands', url: 'https://cdn.1j1ju.com/medias/81/08/d9-talisman-the-firelands-rulebook.pdf' },
  { name: 'The Cataclysm', url: 'https://cdn.1j1ju.com/medias/4d/29/9e-talisman-revised-4th-edition-the-cataclysm-rulebook.pdf' },
  { name: 'The Dungeon', url: 'https://cdn.1j1ju.com/medias/5b/5a/11-talisman-the-dungeon-rulebook.pdf' },
  { name: 'The Sacred Pool', url: 'https://images-cdn.fantasyflightgames.com/ffg_content/Talisman/support/talisman-sacred-pool-rules.pdf' },
  { name: 'The Blood Moon', url: 'https://cdn.1j1ju.com/medias/67/98/f0-talisman-revised-4th-edition-the-blood-moon-rulebook.pdf' },
  { name: 'Lost Realms', url: 'https://images-cdn.fantasyflightgames.com/filer_public/03/39/03391605-ede2-4539-bc28-d51052bd71dc/tm14-rules.pdf' },
]

export const HOUSE_RULES = [
  {
    ruleset: 'Classic Talisman Houserules',
    slug: 'classic',
    sections: [
      {
        name: 'Set up',
        slug: 'classic-set-up',
        topics: [
          {
            name: 'Character selection',
            intro:
              'At the start of the game each player may randomly draw 3 characters, from whom they will choose 1 character to start the game.',
            rules: [
              'If you get a character which you have played with in your last 2 games you may discard that character and draw another character to replace it.',
              'If you get a character which you have won with in your last game or the game before that, you have to discard it and draw a new character to replace it.',
              'You may discard 1 of the dragon expansion characters if you don\u2019t play with the dragon expansion in this game. You draw a new character to replace the dragon expansion character.',
            ],
          },
          {
            name: 'Ending selection',
            intro:
              'All players vote/decide if they want to play the normal ending, a certain revealed ending, a random revealed ending or a random hidden ending.',
            rules: ['In the case of a tie you do a dice roll and the winner decides.'],
          },
          {
            name: 'Starting the game',
            intro: 'All players roll a die to determine who gets the first turn.',
            rules: ['You cannot fate or dark fate this roll.'],
          },
          {
            name: 'Warlock\u2019s Cave',
            intro: 'Draw 4 random quest cards and put them face up on the Warlock\u2019s Cave.',
            rules: [
              'Whenever a character lands on this space he may choose one of the four available quests. When a quest is chosen, draw a new quest to replace it.',
            ],
          },
          {
            name: 'Woodland Entrance',
            intro: 'This space has 4 random paths on it instead of the normal 3.',
            rules: ['If a path is taken by a player, draw a new path to replace it.'],
          },
        ],
      },
      {
        name: 'General',
        slug: 'classic-general',
        topics: [
          {
            name: 'Reaper',
            intro:
              'If you roll a \u20181\u2019 for your movement you finish your turn as normal. After your turn you take a turn for the Reaper.',
            rules: [
              'Characters have to interact with the Reaper if the Reaper ends their movement on the space that a character is standing on.',
              'Characters can safely move to a space where the Reaper is standing.',
              'The Reaper can move in any direction in all expansions.',
              'The Reaper cannot move into the inner region.',
              'The Reaper can move freely between the outer and middle region by using the sentinel bridge.',
              'The Reaper can go in the opposite direction in the City expansion.',
              'The Reaper can freely cross the bridge in the Deep Realms connecting the City expansion and the Dungeon expansion.',
              'If the Reaper reaches the \u2018Meeting with Destiny\u2019 space or the \u2018Treasure Chamber\u2019, it can teleport to any space in the outer or middle region, even if there are characters in that space.',
              'If the Reaper does this, characters that are present in the space that the Reaper teleports to have to interact with the Reaper.',
              'Instead of moving the Reaper normally, you may move them to any character\u2019s space not in the inner region. If moved in this way, the character does NOT roll on the Reaper chart (the character is only being watched at this time).',
            ],
          },
          {
            name: 'Werewolf',
            intro:
              'If you roll a \u20186\u2019 for your movement you finish your turn as normal. After your turn you take a turn for the Werewolf.',
            rules: [
              'Characters have to interact with the Werewolf if the Werewolf ends their movement on the space that a character is standing on.',
              'Characters can safely move to a space where the Werewolf is standing.',
              'If it\u2019s nighttime, the Werewolf has to end their movement on a space that a character is standing on, if able.',
              'If the Werewolf is in range of a character it will always go to that character.',
              'If more than 1 character is in range of the Werewolf, the character that rolled a \u20186\u2019 for movement may choose which character gets visited by the Werewolf.',
              'The Werewolf can move in any direction in all expansions.',
              'The Werewolf cannot move into the inner region.',
              'The Werewolf can move freely between the outer and middle region by using the sentinel bridge.',
              'The Werewolf can go in the opposite direction in the City expansion.',
              'The Werewolf can freely cross the bridge in the Deep Realms connecting the City expansion and the Dungeon expansion.',
              'If the Werewolf reaches the \u2018Meeting with Destiny\u2019 space or the \u2018Treasure Chamber\u2019, it can teleport to any space in the outer or middle region, even if there are characters in that space.',
              'If the Werewolf does this, characters that are present in the space that the Werewolf teleports to have to interact with the Werewolf.',
            ],
          },
          {
            name: 'Toad',
            intro:
              'When you revert back to your normal character after being turned into a slimy little toad, you can use the power of your froggy legs to move 1 space instead of your normal movement.',
            rules: [
              'This only applies to the first turn you take after you\u2019ve been turned back to your original character.',
            ],
          },
          {
            name: 'Warlock Quests',
            intro:
              'When you land on the Warlock\u2019s Cave, you can choose 1 of the 4 quests that are face up on this space.',
            rules: [
              'Characters can only have 1 quest at a time.',
              'If you can get a Warlock Quest whilst you already have an active Warlock Quest, you can decide to discard the one you had and take the new one.',
              'If you can complete the quest, you have to complete it.',
              'Except for \u2018visiting-quests\u2019. E.g. If you have a quest that tells you to visit the cursed glade and you have enough movement to visit it, you can also choose to use your movement differently.',
              'When you complete your quest you may immediately reap the rewards without teleporting to the Warlock\u2019s Cave.',
            ],
          },
          {
            name: 'Character Interaction',
            intro:
              'Characters with the same alignment can trade objects with each other if they meet in the same space.',
            rules: ['You can also use gold or dragon scales to trade with.'],
          },
          {
            name: 'Trophies',
            intro: 'Characters can turn in trophies to level up Strength or Craft.',
            rules: [
              'In order to gain an extra Strength you have to have x+1 value of Strength trophy points where x = your current Strength value.',
              'In order to gain an extra Craft you have to have x+1 value of Craft trophy points where x = your current Craft value.',
              {
                text: 'You can fight some enemies with either Strength or Craft.',
                subrules: [
                  'If you acquired the trophy using Strength, it counts as a Strength trophy.',
                  'If you acquired the trophy using Craft, it counts as a Craft trophy.',
                ],
              },
            ],
          },
        ],
      },
      {
        name: 'Cataclysm Board',
        slug: 'classic-cataclysm',
        topics: [
          {
            name: 'Graveyard',
            intro:
              'In addition to encountering a Denizen, evil characters may choose to replenish up to 2 Fate for free. Good characters lose 1 life.',
            rules: [
              'In addition to encountering a Denizen, neutral characters can choose to replenish Fate up to Fate value for 1 gold each.',
              'If an enemy or stranger is present in the Graveyard it has to be interacted with first before encountering a Denizen or replenishing Fate.',
              'If you lose or have a stand-off in battle you cannot encounter a Denizen or replenish Fate.',
              'If objects, followers or gold are present in the Graveyard it can only be interacted with after encountering a Denizen.',
              'If a place is present in the Graveyard a character has to choose to either encounter a Denizen and replenish Fate or visit the place.',
            ],
          },
          {
            name: 'Chapel',
            intro:
              'In addition to encountering a Denizen, good characters may choose to heal up to 2 lives for free. Evil characters lose 1 life.',
            rules: [
              'In addition to encountering a Denizen, neutral characters can choose to heal up to your Life value for 1 gold each.',
              'If an enemy or stranger is present in the Chapel it has to be interacted with first before encountering a Denizen or healing lives.',
              'If you lose or have a stand-off in battle you cannot encounter a Denizen or heal lives.',
              'If objects, followers or gold are present in the Chapel it can only be interacted with after encountering a Denizen.',
              'If a place is present in the Chapel a character has to choose to either encounter a Denizen and heal lives or visit the place.',
            ],
          },
          {
            name: 'Tavern',
            intro:
              'In addition to encountering a Denizen, you can choose to have a drink at the Tavern and roll a die with the following results:',
            tables: [
              {
                headers: ['Roll', 'Outcome'],
                rows: [
                  ['1', 'You got drunk and collapsed in a corner. Lose 1 turn.'],
                  ['2\u20133', 'You have a nice drink and banter with the local crowd.'],
                  ['4\u20135', 'You can buy a potion card for 1 gold (draw 1 random potion card).'],
                  ['6', 'You get a potion card for free (draw 1 random potion card).'],
                ],
              },
            ],
            rules: [
              'If an enemy or stranger is present in the Tavern it has to be interacted with first before encountering a Denizen or having a drink at the Tavern.',
              'If you lose or have a stand-off in battle you cannot encounter a Denizen or have a drink at the Tavern.',
              'If objects, followers or gold are present in the Tavern it can only be interacted with after encountering a Denizen.',
              'You can pick up objects, followers and gold before having a drink at the Tavern.',
              'If a place is present in the Tavern a character has to choose to either encounter a Denizen and have a drink at the Tavern or visit the place.',
            ],
          },
          {
            name: 'City',
            intro:
              'In addition to encountering a Denizen at the City, you can choose to visit the Alchemist and transfuse (discard) 1 object for 1 gold.',
            rules: [
              'You cannot transfuse a Talisman.',
              'You cannot transfuse cursed items (items that have a negative effect and need a specific requirement to get rid of them).',
              'OR: You can transfuse cursed items but you have to pay the Alchemist 1 gold to do so.',
              'You won\u2019t get a gold from the Alchemist if you transfuse a cursed item.',
              'If an enemy or stranger is present in the City it has to be interacted with first before encountering a Denizen or visiting the Alchemist.',
              'If you lose or have a stand-off in battle you cannot encounter a Denizen or visit the Alchemist.',
              'If objects, followers or gold are present in the City it can only be interacted with after encountering a Denizen.',
              'You can pick up objects, followers and gold before visiting the Alchemist.',
              'If a place is present in the City a character has to choose to either encounter a Denizen and visit the Alchemist or visit the place.',
            ],
          },
          {
            name: 'Castle',
            intro:
              'In addition to encountering a Denizen, you can choose to visit the Royal Doctor to heal lives up to your Life value for 1 gold each. Characters of all alignments are able to do this.',
            rules: [
              'If an enemy or stranger is present in the Castle it has to be interacted with first before encountering a Denizen or visiting the Royal Doctor.',
              'If you lose or have a stand-off in battle you cannot encounter a Denizen or visit the Royal Doctor.',
              'If objects, followers or gold are present in the Castle it can only be interacted with after encountering a Denizen.',
              'You can pick up objects, followers and gold before visiting the Royal Doctor.',
              'If a place is present in the Castle a character has to choose to either encounter a Denizen and visit the Royal Doctor or visit the place.',
            ],
          },
        ],
      },
      {
        name: 'The City (Region)',
        slug: 'classic-city-region',
        topics: [
          {
            name: 'Combat',
            intro: 'You cannot use the Warhorse in combat in the City Region.',
          },
          {
            name: 'Apothecary',
            intro: 'When you buy a potion, you draw a random potion card.',
          },
          {
            name: 'Shop Prices',
            intro: 'Prices in the shop have been altered. These are the new shop prices:',
            tables: [
              {
                title: 'Armoury',
                headers: ['Item', 'Price'],
                rows: [
                  ['Stiletto', '1G'],
                  ['Bow', '2G'],
                  ['Greatsword', '3G'],
                  ['Battle Axe', '4G'],
                  ['Full Plate', '5G'],
                  ['Flail', '6G'],
                ],
              },
              {
                title: 'Stables',
                headers: ['Item', 'Price'],
                rows: [
                  ['Mule', '2G'],
                  ['Horse and Cart', '3G'],
                  ['Riding Horse', '3G'],
                  ['Warhorse', '5G'],
                ],
              },
            ],
          },
          {
            name: 'City Gate',
            intro:
              'You can choose to get a wanted poster for free if you pass the City Gate with your movement. You don\u2019t have to land exactly on it to buy a wanted poster (but you still can).',
            rules: [
              {
                text: 'You can turn in completed wanted posters at the following places:',
                subrules: [
                  'City (main board space)',
                  'Village',
                  'Tavern',
                  'Castle',
                  'Anywhere in the City Region',
                ],
              },
              'Wanted posters cannot be ditched if you are instructed to ditch an object.',
              'Wanted posters cannot be discarded if you are instructed to discard an object.',
              'Wanted posters cannot be traded if you are instructed to trade an object.',
              'Wanted posters cannot be transmuted.',
            ],
          },
          {
            name: 'Menagerie',
            intro: 'When you buy a pet, you draw a random pet card.',
            rules: [
              'If you are in the Menagerie as a Toad and another character enters the shop, that character can choose to buy you as a Toad-pet for 1 gold.',
              'The Toad-character now travels alongside the other character and encounters spaces together.',
              'If the character fights enemies the Toad adds its Strength or Craft in battle. The Toad-player doesn\u2019t lose lives if the encounter is lost.',
              'If the character visits a place, the Toad-player can choose to also visit that place with a separate dice roll.',
              'When the Toad-player is returned to normal, the character that originally bought the Toad is rewarded with 1 Strength or 1 Craft. Afterwards both players high-five.',
            ],
          },
        ],
      },
      {
        name: 'The Dungeon',
        slug: 'classic-dungeon',
        topics: [
          {
            name: 'Movement',
            intro: 'You cannot use the riding horse for movement in the Dungeon.',
            rules: [
              'You can use the riding horse for movement in the outer region to enter the Dungeon, but once you enter the Dungeon you can use half of your remaining movement to move further into the Dungeon.',
            ],
          },
        ],
      },
      {
        name: 'The Woodlands',
        slug: 'classic-woodlands',
        topics: [
          {
            name: 'Movement',
            intro: 'You cannot use the riding horse for movement in the Woodlands.',
            rules: [
              'You can use the riding horse for movement in the outer region to enter the Woodlands, but once you enter the Woodlands you can use half of your remaining movement to move further into the Woodlands.',
            ],
          },
          {
            name: 'Objects \u2014 Talisman',
            rules: [
              'Talismans do not count towards the carried object limit.',
              'You can only have 1 Talisman at a time.',
              'A Talisman cannot be ditched, discarded, traded or sold if you have other objects.',
            ],
          },
        ],
      },
    ],
  },
]
