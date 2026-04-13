import { supabase } from '../supabaseClient'

export function buildGamePlayerRows(gameId, formState) {
  return formState.players.map((playerId) => {
    const pd = formState.playerData?.[playerId] ?? {}
    return {
      game_id: gameId,
      player_id: playerId,
      characters_played: pd.characters_played ?? [],
      total_deaths: Number(pd.total_deaths ?? 0),
      is_winner: !!pd.is_winner,
      winning_character: pd.is_winner ? pd.winning_character ?? null : null,
    }
  })
}

const GAME_LEVEL_HIGHSCORES = new Set(['most_denizens_on_spot'])

export function buildHighscoreRows(gameId, formState) {
  const rows = []
  for (const [category, entries] of Object.entries(formState.highscores ?? {})) {
    if (!Array.isArray(entries)) continue
    const isGameLevel = GAME_LEVEL_HIGHSCORES.has(category)
    for (const entry of entries) {
      if (!entry) continue
      if (entry.value === '' || entry.value == null) continue
      if (!isGameLevel && !entry.player_id) continue
      rows.push({
        game_id: gameId,
        player_id: isGameLevel ? null : entry.player_id,
        category,
        value: Number(entry.value),
      })
    }
  }
  return rows
}

export function buildExpansionEventRows(gameId, formState) {
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
        game_id: gameId,
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
        game_id: gameId,
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

export async function insertChildRows(gameId, formState) {
  const playerRows = buildGamePlayerRows(gameId, formState)
  const { error: pErr } = await supabase.from('game_players').insert(playerRows)
  if (pErr) throw pErr

  const highscoreRows = buildHighscoreRows(gameId, formState)
  if (highscoreRows.length > 0) {
    const { error: hErr } = await supabase.from('game_highscores').insert(highscoreRows)
    if (hErr) throw hErr
  }

  const eventRows = buildExpansionEventRows(gameId, formState)
  if (eventRows.length > 0) {
    const { error: eErr } = await supabase.from('game_expansion_events').insert(eventRows)
    if (eErr) throw eErr
  }
}

export async function deleteChildRows(gameId) {
  const tables = ['game_players', 'game_highscores', 'game_expansion_events']
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().eq('game_id', gameId)
    if (error) throw error
  }
}
