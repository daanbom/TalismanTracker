import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { useActiveGroup } from './useActiveGroup'

export function useGames() {
  const { activeGroupId, isLoading: groupsLoading } = useActiveGroup()

  return useQuery({
    queryKey: ['games', activeGroupId ?? 'none'],
    enabled: !groupsLoading,
    queryFn: async () => {
      if (!activeGroupId) return []

      const { data, error } = await supabase
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
        .eq('group_id', activeGroupId)
        .order('date', { ascending: false })
      if (error) throw error
      return data.map((g) => ({
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
    },
  })
}
