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
  for (const [category, entry] of Object.entries(formState.highscores ?? {})) {
    if (!entry) continue
    if (entry.value === '' || entry.value == null) continue
    const isGameLevel = GAME_LEVEL_HIGHSCORES.has(category)
    if (!isGameLevel && !entry.player_id) continue
    rows.push({
      game_id: gameId,
      player_id: isGameLevel ? null : entry.player_id,
      category,
      value: Number(entry.value),
    })
  }
  return rows
}

export function buildExpansionEventRows(gameId, formState) {
  const rows = []
  const events = formState.expansionEvents ?? {}

  for (const playerId of formState.players ?? []) {
    const perPlayer = events[playerId]
    if (!perPlayer) continue

    for (const path of perPlayer.woodland?.paths_completed ?? []) {
      if (!path) continue
      rows.push({
        game_id: gameId,
        player_id: playerId,
        expansion: 'woodland',
        event_type: 'path_completed',
        detail: path,
      })
    }

    if (perPlayer.dungeon?.beaten) {
      rows.push({
        game_id: gameId,
        player_id: playerId,
        expansion: 'dungeon',
        event_type: 'dungeon_beaten',
        detail: null,
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
