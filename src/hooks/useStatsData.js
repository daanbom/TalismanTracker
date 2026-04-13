import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

export function useStatsData() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('games')
        .select(`
          id,
          optional_expansions,
          ending:endings ( id, name, expansion ),
          players:game_players (
            id,
            characters_played,
            total_deaths,
            is_winner,
            winning_character,
            player:players ( id, name )
          ),
          expansion_events:game_expansion_events (
            id,
            expansion,
            event_type,
            detail,
            character,
            player:players ( id, name )
          )
        `)
      if (error) throw error
      return data ?? []
    },
  })
}
