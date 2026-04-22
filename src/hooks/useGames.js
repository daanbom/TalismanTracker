import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { useActiveGroup } from './useActiveGroup'

export function useGames(groupIdOverride, participantPlayerId = null) {
  const { activeGroupId, isLoading: groupsLoading } = useActiveGroup()
  const resolvedGroupId = groupIdOverride === undefined ? activeGroupId : groupIdOverride
  const explicitScope = groupIdOverride !== undefined
  const normalizedParticipantPlayerId = participantPlayerId ? participantPlayerId : null
  const participantScope = normalizedParticipantPlayerId ?? 'all-participants'

  return useQuery({
    queryKey: ['games', resolvedGroupId === null ? 'global' : resolvedGroupId ?? 'none', participantScope],
    enabled: explicitScope || !groupsLoading,
    queryFn: async () => {
      if (!explicitScope && !resolvedGroupId) return []

      let query = supabase
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
        .order('date', { ascending: false })

      if (resolvedGroupId) {
        query = query.eq('group_id', resolvedGroupId)
      }

      const { data, error } = await query
      if (error) throw error

      const normalizedGames = (data ?? []).map((g) => ({
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
      }))

      if (normalizedParticipantPlayerId) {
        return normalizedGames.filter((game) =>
          game.players.some((gp) => gp.player?.id === normalizedParticipantPlayerId)
        )
      }

      return normalizedGames
    },
  })
}
