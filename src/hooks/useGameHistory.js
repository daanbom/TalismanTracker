import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

function normalizeGameRow(g) {
  return {
    id: g.id,
    title: g.title,
    date: g.date,
    notes: g.notes,
    createdAt: g.created_at,
    ending: g.ending,
    players: (g.players ?? []).map((gp) => ({
      id: gp.id,
      player: gp.player,
      characters_played: gp.characters_played ?? [],
      total_toad_times: gp.total_toad_times ?? 0,
      is_winner: gp.is_winner,
      winning_character: gp.winning_character,
    })),
    expansion_events: g.expansion_events ?? [],
  }
}

export function useGameHistory({
  groupId,
  participantPlayerId = null,
  search = '',
  playerId = null,
  endingId = null,
  winnerType = 'all',
  dateFrom = null,
  dateTo = null,
  page = 1,
  pageSize = 20,
}) {
  const normalizedPage = Math.max(1, Number(page) || 1)
  const normalizedPageSize = Math.max(1, Number(pageSize) || 20)
  const offset = (normalizedPage - 1) * normalizedPageSize
  const normalizedSearch = search?.trim() ?? ''
  const normalizedWinnerType = ['all', 'player', 'talisman'].includes(winnerType) ? winnerType : 'all'

  return useQuery({
    queryKey: [
      'gameHistory',
      groupId ?? 'none',
      participantPlayerId ?? 'all-participants',
      normalizedSearch,
      playerId ?? 'all-players',
      endingId ?? 'all-endings',
      normalizedWinnerType,
      dateFrom ?? 'any-start',
      dateTo ?? 'any-end',
      normalizedPage,
      normalizedPageSize,
    ],
    enabled: !!groupId,
    queryFn: async () => {
      const { data: pageRows, error: pageError } = await supabase.rpc('get_group_game_history', {
        p_group_id: groupId,
        p_participant_player_id: participantPlayerId,
        p_player_id: playerId,
        p_ending_id: endingId,
        p_winner_type: normalizedWinnerType,
        p_search: normalizedSearch,
        p_date_from: dateFrom,
        p_date_to: dateTo,
        p_limit: normalizedPageSize,
        p_offset: offset,
      })

      if (pageError) throw pageError

      const ids = (pageRows ?? []).map((row) => row.game_id)
      const total = Number(pageRows?.[0]?.total_count ?? 0)

      if (ids.length === 0) {
        return { games: [], total }
      }

      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select(`
          id,
          title,
          date,
          notes,
          created_at,
          ending:endings ( id, name ),
          players:game_players (
            id,
            characters_played,
            total_toad_times,
            is_winner,
            winning_character,
            player:players ( id, name )
          ),
          expansion_events:game_expansion_events ( id )
        `)
        .in('id', ids)

      if (gamesError) throw gamesError

      const order = new Map(ids.map((id, idx) => [id, idx]))
      const games = (gamesData ?? [])
        .map(normalizeGameRow)
        .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))

      return { games, total }
    },
  })
}
