export function computeLeaderboard(gamePlayers) {
  const byPlayer = new Map()
  const gameHasWinner = new Map()

  for (const gp of gamePlayers) {
    if (gp.game_id) {
      gameHasWinner.set(gp.game_id, (gameHasWinner.get(gp.game_id) || false) || !!gp.is_winner)
    }
    if (!gp.player) continue
    const pid = gp.player.id
    if (!byPlayer.has(pid)) {
      byPlayer.set(pid, {
        id: pid,
        name: gp.player.name,
        games_played: 0,
        wins: 0,
        total_deaths: 0,
        character_counts: new Map(),
      })
    }
    const row = byPlayer.get(pid)
    row.games_played += 1
    if (gp.is_winner) row.wins += 1
    row.total_deaths += gp.total_deaths ?? 0
    for (const c of gp.characters_played ?? []) {
      row.character_counts.set(c, (row.character_counts.get(c) ?? 0) + 1)
    }
  }

  const totalGames = gameHasWinner.size
  const talismanWins = Array.from(gameHasWinner.values()).filter(won => !won).length

  const playerRows = Array.from(byPlayer.values())
    .map((row) => {
      let mostPlayed = null
      let maxCount = 0
      for (const [char, count] of row.character_counts) {
        if (count > maxCount) {
          maxCount = count
          mostPlayed = char
        }
      }
      return {
        id: row.id,
        name: row.name,
        games_played: row.games_played,
        wins: row.wins,
        win_rate: row.games_played > 0 ? (row.wins / row.games_played) * 100 : 0,
        total_deaths: row.total_deaths,
        avg_deaths: row.games_played > 0 ? row.total_deaths / row.games_played : 0,
        most_played: mostPlayed,
      }
    })

  if (totalGames > 0) {
    playerRows.push({
      id: '__talisman__',
      name: 'Talisman',
      games_played: totalGames,
      wins: talismanWins,
      win_rate: (talismanWins / totalGames) * 100,
      total_deaths: 0,
      avg_deaths: 0,
      most_played: '—',
    })
  }

  return playerRows.sort((a, b) => b.wins - a.wins || b.win_rate - a.win_rate)
}
