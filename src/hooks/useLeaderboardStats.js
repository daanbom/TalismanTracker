import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { computeLeaderboard } from '../lib/statsHelpers'

export function useLeaderboardStats() {
  return useQuery({
    queryKey: ['leaderboardStats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('game_players')
        .select(`
          game_id,
          characters_played,
          total_deaths,
          is_winner,
          player:players ( id, name )
        `)
      if (error) throw error
      return computeLeaderboard(data)
    },
  })
}
