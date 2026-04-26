import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { computeLeaderboard } from '../lib/statsHelpers'

export function useLeaderboardStats(groupId) {
  return useQuery({
    queryKey: ['leaderboardStats', groupId ?? 'global'],
    queryFn: async () => {
      let gameIds = null

      if (groupId) {
        const { data: gamesData, error: gamesError } = await supabase
          .from('games')
          .select('id')
          .eq('group_id', groupId)
        if (gamesError) throw gamesError
        gameIds = gamesData.map(g => g.id)
        if (gameIds.length === 0) return []
      }

      let gpQuery = supabase
        .from('game_players')
        .select(`
          game_id,
          characters_played,
          total_toad_times,
          is_winner,
          winning_character,
          player:players ( id, name ),
          game:games ( id, date, created_at )
        `)

      let deathQuery = supabase
        .from('game_player_deaths')
        .select('game_id, player_id, killed_by_player_id, death_type:death_types(name)')

      if (gameIds) {
        gpQuery = gpQuery.in('game_id', gameIds)
        deathQuery = deathQuery.in('game_id', gameIds)
      }

      const [gpResult, deathResult] = await Promise.all([gpQuery, deathQuery])
      if (gpResult.error) throw gpResult.error
      if (deathResult.error) throw deathResult.error

      const deathCounts = new Map()
      const deathTypesByPlayer = new Map()
      for (const d of deathResult.data) {
        const key = `${d.game_id}::${d.player_id}`
        deathCounts.set(key, (deathCounts.get(key) ?? 0) + 1)

        const typeName = d.death_type?.name
        if (typeName) {
          const counts = deathTypesByPlayer.get(d.player_id) ?? new Map()
          counts.set(typeName, (counts.get(typeName) ?? 0) + 1)
          deathTypesByPlayer.set(d.player_id, counts)
        }
      }

      const data = gpResult.data.map(gp => ({
        ...gp,
        total_deaths: deathCounts.get(`${gp.game_id}::${gp.player?.id}`) ?? 0,
      }))
      return computeLeaderboard(data, deathTypesByPlayer, deathResult.data)
    },
  })
}
