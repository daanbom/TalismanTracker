export function buildGamePlayerRows(formState) {
  return formState.players.map((playerId) => {
    const pd = formState.playerData?.[playerId] ?? {}
    const chars = pd.characters_played ?? []
    return {
      player_id: playerId,
      characters_played: chars,
      total_toad_times: Number(pd.total_toad_times ?? 0),
      is_winner: !!pd.is_winner,
      winning_character: pd.is_winner && chars.length > 0 ? chars[chars.length - 1] : null,
    }
  })
}

const GAME_LEVEL_HIGHSCORES = new Set(['most_denizens_on_spot'])

export function buildHighscoreRows(formState) {
  const rows = []
  for (const [category, entries] of Object.entries(formState.highscores ?? {})) {
    if (!Array.isArray(entries)) continue
    const isGameLevel = GAME_LEVEL_HIGHSCORES.has(category)
    for (const entry of entries) {
      if (!entry) continue
      if (entry.value === '' || entry.value == null) continue
      if (!isGameLevel && !entry.player_id) continue
      rows.push({
        player_id: isGameLevel ? null : entry.player_id,
        category,
        value: Number(entry.value),
      })
    }
  }
  return rows
}

export function buildDeathRows(formState) {
  const rows = []
  for (const playerId of formState.players ?? []) {
    const deaths = formState.playerData?.[playerId]?.deaths ?? []
    for (const death of deaths) {
      if (!death.death_type_id) continue
      rows.push({
        player_id: playerId,
        death_type_id: death.death_type_id,
        character_id: death.character_id,
        killed_by_player_id: death.killed_by_player_id || null,
      })
    }
  }
  return rows
}

export function buildExpansionEventRows(formState) {
  const rows = []
  const events = formState.expansionEvents ?? {}

  for (const playerId of formState.players ?? []) {
    const perPlayer = events[playerId]
    if (!perPlayer) continue

    const playedChars = formState.playerData?.[playerId]?.characters_played ?? []
    const fallbackChar = playedChars.length === 1 ? playedChars[0] : null

    for (const entry of perPlayer.woodland?.paths_completed ?? []) {
      const path = typeof entry === 'string' ? entry : entry?.path
      if (!path) continue
      const character = (typeof entry === 'object' && entry?.character) || fallbackChar || null
      rows.push({
        player_id: playerId,
        expansion: 'woodland',
        event_type: 'path_completed',
        detail: path,
        character,
      })
    }

    const dungeon = perPlayer.dungeon
    if (dungeon?.beaten) {
      const character = dungeon.character || fallbackChar || null
      rows.push({
        player_id: playerId,
        expansion: 'dungeon',
        event_type: 'dungeon_beaten',
        detail: null,
        character,
      })
    }
  }

  return rows
}

export function buildGameWritePayload(formState) {
  return {
    game_players: buildGamePlayerRows(formState),
    highscores: buildHighscoreRows(formState),
    deaths: buildDeathRows(formState),
    expansion_events: buildExpansionEventRows(formState),
  }
}
