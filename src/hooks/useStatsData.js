import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

export function useStatsData(groupId) {
  return useQuery({
    queryKey: ['stats', groupId ?? 'global'],
    queryFn: async () => {
      let query = supabase
        .from('games')
        .select(`
          id,
          optional_expansions,
          ending:endings ( id, name, expansion ),
          players:game_players (
            id,
            characters_played,
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
          ),
          deaths:game_player_deaths (
            id,
            player_id,
            killed_by_player_id,
            death_type:death_types ( id, name ),
            character:characters ( id, name ),
            killed_by:players!game_player_deaths_killed_by_fkey ( id, name )
          )
        `)

      if (groupId) query = query.eq('group_id', groupId)

      const { data, error } = await query
      if (error) throw error
      return (data ?? []).map(game => {
        const allDeaths = game.deaths ?? []
        return {
          ...game,
          players: (game.players ?? []).map(gp => ({
            ...gp,
            total_deaths: allDeaths.filter(d => d.player_id === gp.player.id).length,
            deaths: allDeaths.filter(d => d.player_id === gp.player.id),
          })),
        }
      })
    },
  })
}
