export const PLAYER_COUNT_FILTERS = [
  { key: 'all', label: 'All' },
  { key: '2', label: '2P' },
  { key: '3', label: '3P' },
  { key: '4', label: '4P' },
  { key: '5', label: '5P' },
]

export function matchesPlayerCountFilter(playerCount, filterKey) {
  if (!filterKey || filterKey === 'all') return true
  const target = Number(filterKey)
  if (!Number.isFinite(target)) return true
  return playerCount === target
}

export function filterGamesByPlayerCount(games, filterKey) {
  if (!filterKey || filterKey === 'all') return games
  return games.filter((game) => {
    const count = Array.isArray(game.players) ? game.players.length : 0
    return matchesPlayerCountFilter(count, filterKey)
  })
}
