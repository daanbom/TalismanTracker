export const MOCK_PLAYERS = [
  { id: '1', name: 'Daan', created_at: '2026-01-15' },
  { id: '2', name: 'Erik', created_at: '2026-01-15' },
  { id: '3', name: 'Jasper', created_at: '2026-01-20' },
  { id: '4', name: 'Thijs', created_at: '2026-02-01' },
  { id: '5', name: 'Sander', created_at: '2026-02-10' },
]

export const MOCK_CHARACTERS = [
  { id: '1', name: 'Warrior', expansion: 'base' },
  { id: '2', name: 'Wizard', expansion: 'base' },
  { id: '3', name: 'Troll', expansion: 'base' },
  { id: '4', name: 'Elf', expansion: 'base' },
  { id: '5', name: 'Dwarf', expansion: 'base' },
  { id: '6', name: 'Assassin', expansion: 'base' },
  { id: '7', name: 'Monk', expansion: 'base' },
  { id: '8', name: 'Priestess', expansion: 'base' },
  { id: '9', name: 'Prophetess', expansion: 'base' },
  { id: '10', name: 'Ghoul', expansion: 'base' },
  { id: '11', name: 'Minstrel', expansion: 'base' },
  { id: '12', name: 'Sorceress', expansion: 'base' },
  { id: '13', name: 'Thief', expansion: 'base' },
  { id: '14', name: 'Druid', expansion: 'base' },
  { id: '15', name: 'Knight', expansion: 'reaper' },
  { id: '16', name: 'Sage', expansion: 'reaper' },
  { id: '17', name: 'Dark Cultist', expansion: 'reaper' },
  { id: '18', name: 'Merchant', expansion: 'reaper' },
  { id: '19', name: 'Amazon', expansion: 'dungeon' },
  { id: '20', name: 'Swashbuckler', expansion: 'dungeon' },
  { id: '21', name: 'Gypsy', expansion: 'dungeon' },
  { id: '22', name: 'Valkyrie', expansion: 'frostmarch' },
  { id: '23', name: 'Necromancer', expansion: 'frostmarch' },
  { id: '24', name: 'Vampire Hunter', expansion: 'highland' },
  { id: '25', name: 'Alchemist', expansion: 'highland' },
  { id: '26', name: 'Dread Knight', expansion: 'sacred_pool' },
  { id: '27', name: 'Chivalric Knight', expansion: 'sacred_pool' },
  { id: '28', name: 'Spy', expansion: 'city' },
  { id: '29', name: 'Cat Burglar', expansion: 'city' },
  { id: '30', name: 'Scout', expansion: 'woodland' },
  { id: '31', name: 'Ancient Oak', expansion: 'woodland' },
  { id: '32', name: 'Black Witch', expansion: 'blood_moon' },
  { id: '33', name: 'Vampire', expansion: 'blood_moon' },
  { id: '34', name: 'Celestial', expansion: 'harbinger' },
  { id: '35', name: 'Ascendant Divine', expansion: 'harbinger' },
]

export const MOCK_ENDINGS = [
  { id: '1', name: 'Crown of Command', expansion: 'base' },
  { id: '2', name: 'Armageddon', expansion: 'base' },
  { id: '3', name: 'Sudden Death', expansion: 'base' },
  { id: '4', name: 'Blood Moon Rising', expansion: 'blood_moon' },
  { id: '5', name: 'The Harbinger', expansion: 'harbinger' },
  { id: '6', name: 'A Dragon King', expansion: 'dungeon' },
  { id: '7', name: 'The Werewolf Lord', expansion: 'blood_moon' },
  { id: '8', name: 'Eagle King', expansion: 'woodland' },
  { id: '9', name: 'Hand of Doom', expansion: 'reaper' },
  { id: '10', name: 'Demon Lord', expansion: 'nether' },
]

export const MOCK_GAMES = [
  {
    id: '1',
    date: '2026-03-28',
    ending: { id: '1', name: 'Crown of Command' },
    notes: 'Epic 4-hour marathon. Daan clutched it with the Warrior after 3 deaths.',
    players: [
      { player: { id: '1', name: 'Daan' }, characters_played: ['Ghoul', 'Monk', 'Warrior'], total_deaths: 3, is_winner: true, winning_character: 'Warrior' },
      { player: { id: '2', name: 'Erik' }, characters_played: ['Wizard', 'Elf'], total_deaths: 1, is_winner: false, winning_character: null },
      { player: { id: '3', name: 'Jasper' }, characters_played: ['Troll'], total_deaths: 0, is_winner: false, winning_character: null },
      { player: { id: '4', name: 'Thijs' }, characters_played: ['Assassin', 'Prophetess'], total_deaths: 2, is_winner: false, winning_character: null },
    ],
    highscores: [
      { category: 'most_coins', player: { id: '3', name: 'Jasper' }, value: 47 },
      { category: 'most_followers', player: { id: '1', name: 'Daan' }, value: 5 },
    ],
    expansion_events: [
      { expansion: 'woodland', event_type: 'path_completed', detail: 'Way of Light' },
    ],
  },
  {
    id: '2',
    date: '2026-03-14',
    ending: { id: '2', name: 'Armageddon' },
    notes: 'Quick game, Armageddon ending triggered early.',
    players: [
      { player: { id: '2', name: 'Erik' }, characters_played: ['Knight'], total_deaths: 0, is_winner: true, winning_character: 'Knight' },
      { player: { id: '5', name: 'Sander' }, characters_played: ['Sorceress'], total_deaths: 1, is_winner: false, winning_character: null },
      { player: { id: '1', name: 'Daan' }, characters_played: ['Druid', 'Thief'], total_deaths: 2, is_winner: false, winning_character: null },
    ],
    highscores: [
      { category: 'most_objects', player: { id: '2', name: 'Erik' }, value: 8 },
    ],
    expansion_events: [],
  },
  {
    id: '3',
    date: '2026-02-22',
    ending: { id: '6', name: 'A Dragon King' },
    notes: null,
    players: [
      { player: { id: '3', name: 'Jasper' }, characters_played: ['Amazon', 'Necromancer'], total_deaths: 1, is_winner: true, winning_character: 'Necromancer' },
      { player: { id: '4', name: 'Thijs' }, characters_played: ['Valkyrie'], total_deaths: 0, is_winner: false, winning_character: null },
      { player: { id: '1', name: 'Daan' }, characters_played: ['Spy'], total_deaths: 1, is_winner: false, winning_character: null },
      { player: { id: '2', name: 'Erik' }, characters_played: ['Scout', 'Dark Cultist'], total_deaths: 1, is_winner: false, winning_character: null },
      { player: { id: '5', name: 'Sander' }, characters_played: ['Vampire'], total_deaths: 2, is_winner: false, winning_character: null },
    ],
    highscores: [
      { category: 'most_coins', player: { id: '5', name: 'Sander' }, value: 32 },
      { category: 'most_followers', player: { id: '4', name: 'Thijs' }, value: 7 },
      { category: 'most_denizens_on_spot', player: { id: '3', name: 'Jasper' }, value: 4 },
    ],
    expansion_events: [
      { expansion: 'dungeon', event_type: 'dungeon_beaten', detail: 'Floor 3' },
    ],
  },
  {
    id: '4',
    date: '2026-02-08',
    ending: { id: '5', name: 'The Harbinger' },
    notes: 'Harbinger ending was intense. Thijs barely made it.',
    players: [
      { player: { id: '4', name: 'Thijs' }, characters_played: ['Celestial'], total_deaths: 0, is_winner: true, winning_character: 'Celestial' },
      { player: { id: '1', name: 'Daan' }, characters_played: ['Alchemist', 'Minstrel'], total_deaths: 2, is_winner: false, winning_character: null },
      { player: { id: '3', name: 'Jasper' }, characters_played: ['Cat Burglar'], total_deaths: 1, is_winner: false, winning_character: null },
    ],
    highscores: [
      { category: 'most_objects', player: { id: '4', name: 'Thijs' }, value: 11 },
      { category: 'most_coins', player: { id: '1', name: 'Daan' }, value: 28 },
    ],
    expansion_events: [],
  },
  {
    id: '5',
    date: '2026-01-25',
    ending: { id: '3', name: 'Sudden Death' },
    notes: 'First game of the year!',
    players: [
      { player: { id: '5', name: 'Sander' }, characters_played: ['Dread Knight', 'Black Witch'], total_deaths: 1, is_winner: true, winning_character: 'Black Witch' },
      { player: { id: '2', name: 'Erik' }, characters_played: ['Swashbuckler'], total_deaths: 0, is_winner: false, winning_character: null },
      { player: { id: '4', name: 'Thijs' }, characters_played: ['Priestess', 'Sage'], total_deaths: 2, is_winner: false, winning_character: null },
      { player: { id: '1', name: 'Daan' }, characters_played: ['Warrior'], total_deaths: 1, is_winner: false, winning_character: null },
    ],
    highscores: [
      { category: 'most_followers', player: { id: '5', name: 'Sander' }, value: 6 },
    ],
    expansion_events: [
      { expansion: 'woodland', event_type: 'path_completed', detail: 'Path of Destiny' },
      { expansion: 'dungeon', event_type: 'dungeon_beaten', detail: 'Floor 4' },
    ],
  },
]

export const MOCK_LEADERBOARD = [
  { id: '1', name: 'Daan', games_played: 5, wins: 1, win_rate: 20.0, total_deaths: 9, avg_deaths: 1.8, most_played: 'Warrior' },
  { id: '2', name: 'Erik', games_played: 4, wins: 1, win_rate: 25.0, total_deaths: 2, avg_deaths: 0.5, most_played: 'Knight' },
  { id: '3', name: 'Jasper', games_played: 3, wins: 1, win_rate: 33.3, total_deaths: 2, avg_deaths: 0.67, most_played: 'Troll' },
  { id: '4', name: 'Thijs', games_played: 4, wins: 1, win_rate: 25.0, total_deaths: 4, avg_deaths: 1.0, most_played: 'Valkyrie' },
  { id: '5', name: 'Sander', games_played: 3, wins: 1, win_rate: 33.3, total_deaths: 4, avg_deaths: 1.33, most_played: 'Sorceress' },
]

export const MOCK_HIGHSCORE_RECORDS = [
  { category: 'most_coins', label: 'Most Coins', player: 'Jasper', value: 47, game_date: '2026-03-28', game_id: '1' },
  { category: 'most_followers', label: 'Most Followers', player: 'Thijs', value: 7, game_date: '2026-02-22', game_id: '3' },
  { category: 'most_objects', label: 'Most Objects', player: 'Thijs', value: 11, game_date: '2026-02-08', game_id: '4' },
  { category: 'most_denizens_on_spot', label: 'Most Denizens on Spot', player: 'Jasper', value: 4, game_date: '2026-02-22', game_id: '3' },
]

export const HIGHSCORE_CATEGORIES = [
  { key: 'most_coins', label: 'Most Coins' },
  { key: 'most_followers', label: 'Most Followers' },
  { key: 'most_objects', label: 'Most Objects' },
  { key: 'most_denizens_on_spot', label: 'Most Denizens on Spot' },
]

export const WOODLAND_PATHS = [
  'Way of Light',
  'Path of Destiny',
  'Sylvan Path',
  'Ancient Way',
  'Dark Path',
]
