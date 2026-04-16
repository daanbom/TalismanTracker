import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { computeLeaderboard } from '../lib/statsHelpers'

export function useLeaderboardStats() {
  return useQuery({
    queryKey: ['leaderboardStats'],
    queryFn: async () => {
      const [gpResult, deathResult] = await Promise.all([
        supabase
          .from('game_players')
          .select(`
            game_id,
            characters_played,
            total_toad_times,
            is_winner,
            player:players ( id, name )
          `),
        supabase
          .from('game_player_deaths')
          .select('game_id, player_id'),
      ])
      if (gpResult.error) throw gpResult.error
      if (deathResult.error) throw deathResult.error

      const deathCounts = new Map()
      for (const d of deathResult.data) {
        const key = `${d.game_id}::${d.player_id}`
        deathCounts.set(key, (deathCounts.get(key) ?? 0) + 1)
      }

      const data = gpResult.data.map(gp => ({
        ...gp,
        total_deaths: deathCounts.get(`${gp.game_id}::${gp.player?.id}`) ?? 0,
      }))
      return computeLeaderboard(data)
    },
  })
}
