// ============================================================
// Pure stats aggregations for the Stats screen.
// All functions take the raw games payload from useStatsData
// (already filtered by the top-level optional-expansions filter)
// and return table-ready rows.
// ============================================================

export const OPTIONAL_EXPANSION_FILTERS = [
  { key: 'all', label: 'All Games' },
  { key: 'normal', label: 'Normal (no optional)' },
  { key: 'dragon', label: 'With Dragon only' },
  { key: 'harbinger', label: 'With Harbinger only' },
  { key: 'both', label: 'With Dragon + Harbinger' },
]

export function filterGamesByOptionalExpansions(games, filterKey) {
  if (!filterKey || filterKey === 'all') return games
  return games.filter((g) => {
    const arr = g.optional_expansions ?? []
    const hasDragon = arr.includes('dragon')
    const hasHarbinger = arr.includes('harbinger')
    switch (filterKey) {
      case 'normal':
        return !hasDragon && !hasHarbinger
      case 'dragon':
        return hasDragon && !hasHarbinger
      case 'harbinger':
        return hasHarbinger && !hasDragon
      case 'both':
        return hasDragon && hasHarbinger
      default:
        return true
    }
  })
}

// ── Characters ──────────────────────────────────────────────
// Each appearance in characters_played counts as 1 game for that
// character. Deaths: first `total_deaths` characters in the ordered
// array are deaths, the rest are survivors. Wins: matches
// winning_character.
export function computeCharacterStats(games, allCharacters) {
  const stats = new Map()
  const ensure = (name) => {
    if (!stats.has(name)) {
      stats.set(name, {
        character: name,
        expansion: null,
        games: 0,
        wins: 0,
        deaths: 0,
      })
    }
    return stats.get(name)
  }

  for (const game of games) {
    for (const gp of game.players ?? []) {
      const chars = gp.characters_played ?? []
      const deaths = Math.min(gp.total_deaths ?? 0, chars.length)
      chars.forEach((char, idx) => {
        const row = ensure(char)
        row.games += 1
        if (idx < deaths) row.deaths += 1
      })
      if (gp.is_winner && gp.winning_character) {
        ensure(gp.winning_character).wins += 1
      }
    }
  }

  const expansionByName = new Map(
    (allCharacters ?? []).map((c) => [c.name, c.expansion]),
  )
  const rows = Array.from(stats.values()).map((row) => ({
    ...row,
    expansion: expansionByName.get(row.character) ?? 'NA',
    winRate: row.games > 0 ? row.wins / row.games : 0,
    deathRate: row.games > 0 ? row.deaths / row.games : 0,
  }))

  // Characters that exist in seed but were never played get a zero row
  for (const c of allCharacters ?? []) {
    if (!stats.has(c.name)) {
      rows.push({
        character: c.name,
        expansion: c.expansion,
        games: 0,
        wins: 0,
        deaths: 0,
        winRate: 0,
        deathRate: 0,
      })
    }
  }

  return rows
}

// ── Endings ─────────────────────────────────────────────────
// For each ending: times triggered, % of games, player win rate,
// talisman (no-winner) rate, top winning character.
export function computeEndingStats(games) {
  const stats = new Map()
  const totalGames = games.length

  for (const game of games) {
    const ending = game.ending
    if (!ending) continue
    const id = ending.id
    if (!stats.has(id)) {
      stats.set(id, {
        id,
        name: ending.name,
        expansion: ending.expansion,
        times: 0,
        playerWins: 0,
        talismanWins: 0,
        winningCharCounts: new Map(),
      })
    }
    const row = stats.get(id)
    row.times += 1
    const winners = (game.players ?? []).filter((gp) => gp.is_winner)
    if (winners.length > 0) {
      row.playerWins += 1
      for (const w of winners) {
        if (w.winning_character) {
          row.winningCharCounts.set(
            w.winning_character,
            (row.winningCharCounts.get(w.winning_character) ?? 0) + 1,
          )
        }
      }
    } else {
      row.talismanWins += 1
    }
  }

  return Array.from(stats.values()).map((row) => {
    let topChar = null
    let topCount = 0
    for (const [char, count] of row.winningCharCounts.entries()) {
      if (count > topCount) {
        topChar = char
        topCount = count
      }
    }
    return {
      id: row.id,
      name: row.name,
      expansion: row.expansion,
      times: row.times,
      pctOfGames: totalGames > 0 ? row.times / totalGames : 0,
      playerWinRate: row.times > 0 ? row.playerWins / row.times : 0,
      talismanWinRate: row.times > 0 ? row.talismanWins / row.times : 0,
      topWinningCharacter: topChar ? `${topChar} (${topCount})` : 'NA',
    }
  })
}

// ── Expansion events ────────────────────────────────────────
// Per-character aggregation of dungeon_beaten and path_completed,
// plus per-character totals of paths (across all path types) and
// global totals for the filtered game set.
// Events with no character attribution are grouped as "Unknown".
export function computeExpansionEventStats(games) {
  const dungeons = new Map()     // character -> { character, count }
  const paths = new Map()        // `${character}::${path}` -> { character, path, count }
  const pathsTotals = new Map()  // character -> { character, count }
  const pathsByPath = new Map()  // path -> { path, count }
  let totalDungeons = 0
  let totalPaths = 0

  for (const game of games) {
    for (const ev of game.expansion_events ?? []) {
      const character = ev.character || 'Unknown'
      if (ev.event_type === 'dungeon_beaten') {
        const row = dungeons.get(character) ?? { character, count: 0 }
        row.count += 1
        dungeons.set(character, row)
        totalDungeons += 1
      } else if (ev.event_type === 'path_completed') {
        const path = ev.detail || 'NA'
        const key = `${character}::${path}`
        const row = paths.get(key) ?? { character, path, count: 0 }
        row.count += 1
        paths.set(key, row)
        const totalRow = pathsTotals.get(character) ?? { character, count: 0 }
        totalRow.count += 1
        pathsTotals.set(character, totalRow)
        const pathRow = pathsByPath.get(path) ?? { path, count: 0 }
        pathRow.count += 1
        pathsByPath.set(path, pathRow)
        totalPaths += 1
      }
    }
  }

  return {
    dungeons: Array.from(dungeons.values()),
    paths: Array.from(paths.values()),
    pathsTotals: Array.from(pathsTotals.values()),
    pathsByPath: Array.from(pathsByPath.values()),
    totals: { dungeons: totalDungeons, paths: totalPaths },
  }
}
