export function computeLeaderboard(gamePlayers, deathTypesByPlayer = new Map(), deathsRaw = []) {
  const byPlayer = new Map()
  const gameHasWinner = new Map()
  const playerNames = new Map()

  for (const gp of gamePlayers) {
    if (gp.game_id) {
      gameHasWinner.set(gp.game_id, (gameHasWinner.get(gp.game_id) || false) || !!gp.is_winner)
    }
    if (!gp.player) continue
    const pid = gp.player.id
    playerNames.set(pid, gp.player.name)
    if (!byPlayer.has(pid)) {
      byPlayer.set(pid, {
        id: pid,
        name: gp.player.name,
        games_played: 0,
        wins: 0,
        total_deaths: 0,
        total_toad_times: 0,
        character_counts: new Map(),
        character_wins: new Map(),
        games_with_zero_deaths: 0,
        game_results: [],
      })
    }
    const row = byPlayer.get(pid)
    row.games_played += 1
    if (gp.is_winner) row.wins += 1
    row.total_deaths += gp.total_deaths ?? 0
    if ((gp.total_deaths ?? 0) === 0) row.games_with_zero_deaths += 1
    row.total_toad_times += gp.total_toad_times ?? 0
    for (const c of gp.characters_played ?? []) {
      row.character_counts.set(c, (row.character_counts.get(c) ?? 0) + 1)
    }
    if (gp.is_winner && gp.winning_character) {
      row.character_wins.set(
        gp.winning_character,
        (row.character_wins.get(gp.winning_character) ?? 0) + 1,
      )
    }
    row.game_results.push({
      date: gp.game?.created_at ?? '',
      isWin: !!gp.is_winner,
    })
  }

  // Nemesis: per player, which other player killed them the most
  const killsByVictim = new Map()
  for (const d of deathsRaw) {
    if (!d.killed_by_player_id || !d.player_id) continue
    const victimKills = killsByVictim.get(d.player_id) ?? new Map()
    victimKills.set(d.killed_by_player_id, (victimKills.get(d.killed_by_player_id) ?? 0) + 1)
    killsByVictim.set(d.player_id, victimKills)
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

      let topDeath = null
      const typeCounts = deathTypesByPlayer.get(row.id)
      if (typeCounts) {
        let maxDeath = 0
        for (const [type, count] of typeCounts) {
          if (count > maxDeath) {
            maxDeath = count
            topDeath = `${type} (${count})`
          }
        }
      }

      // Best character by win rate (min 2 games), fallback to most wins
      let bestCharacter = null
      let bestCharWinRate = -1
      let bestCharGames = 0
      for (const [char, gamesCount] of row.character_counts) {
        if (gamesCount < 2) continue
        const charWins = row.character_wins.get(char) ?? 0
        const rate = charWins / gamesCount
        if (rate > bestCharWinRate || (rate === bestCharWinRate && gamesCount > bestCharGames)) {
          bestCharacter = char
          bestCharWinRate = rate
          bestCharGames = gamesCount
        }
      }
      if (!bestCharacter) {
        let maxWins = 0
        for (const [char, wins] of row.character_wins) {
          if (wins > maxWins) {
            maxWins = wins
            bestCharacter = char
            const played = row.character_counts.get(char) ?? 0
            bestCharWinRate = played > 0 ? wins / played : 0
          }
        }
      }

      // Streaks
      const results = row.game_results.sort((a, b) => a.date.localeCompare(b.date))
      let bestWinStreak = 0
      let longestLoseStreak = 0
      let winRun = 0
      let loseRun = 0
      for (const r of results) {
        if (r.isWin) {
          winRun += 1
          loseRun = 0
          if (winRun > bestWinStreak) bestWinStreak = winRun
        } else {
          loseRun += 1
          winRun = 0
          if (loseRun > longestLoseStreak) longestLoseStreak = loseRun
        }
      }
      let currentStreak = '—'
      if (results.length > 0) {
        const lastIsWin = results[results.length - 1].isWin
        let count = 1
        for (let i = results.length - 2; i >= 0; i--) {
          if (results[i].isWin === lastIsWin) count += 1
          else break
        }
        currentStreak = `${lastIsWin ? 'W' : 'L'}${count}`
      }

      // Survival rate
      const survivalRate = row.games_played > 0
        ? (row.games_with_zero_deaths / row.games_played) * 100
        : 0

      // Nemesis
      let nemesis = '—'
      const victimKills = killsByVictim.get(row.id)
      if (victimKills) {
        let maxKills = 0
        let nemesisId = null
        for (const [killerId, count] of victimKills) {
          if (count > maxKills) {
            maxKills = count
            nemesisId = killerId
          }
        }
        if (nemesisId) {
          nemesis = `${playerNames.get(nemesisId) ?? 'Unknown'} (${maxKills})`
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
        total_toad_times: row.total_toad_times,
        avg_toad_times: row.games_played > 0 ? row.total_toad_times / row.games_played : 0,
        most_played: mostPlayed,
        top_death: topDeath ?? '—',
        best_win_streak: bestWinStreak,
        longest_lose_streak: longestLoseStreak,
        current_streak: currentStreak,
        survival_rate: survivalRate,
        best_character: bestCharacter
          ? `${bestCharacter} (${(bestCharWinRate * 100).toFixed(0)}%)`
          : '—',
        nemesis,
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
      total_toad_times: 0,
      avg_toad_times: 0,
      most_played: '—',
      top_death: '—',
      best_win_streak: 0,
      longest_lose_streak: 0,
      current_streak: '—',
      survival_rate: 0,
      best_character: '—',
      nemesis: '—',
    })
  }

  return playerRows.sort((a, b) => b.wins - a.wins || b.win_rate - a.win_rate)
}
