import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { useActiveGroup } from './useActiveGroup'

export function useGame(id) {
  const { activeGroupId, isLoading: groupsLoading } = useActiveGroup()

  return useQuery({
    queryKey: ['game', id, activeGroupId ?? 'none'],
    enabled: !!id && !groupsLoading,
    queryFn: async () => {
      if (!activeGroupId) return null

      const { data, error } = await supabase
        .from('games')
        .select(`
          id,
          title,
          date,
          notes,
          optional_expansions,
          created_at,
          updated_at,
          ending:endings ( id, name, expansion ),
          players:game_players (
            id,
            characters_played,
            total_toad_times,
            is_winner,
            winning_character,
            player:players ( id, name )
          ),
          highscores:game_highscores (
            id,
            category,
            value,
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
        .eq('id', id)
        .eq('group_id', activeGroupId)
        .maybeSingle()
      if (error) throw error
      if (!data) return null
      const allDeaths = data.deaths ?? []
      return {
        id: data.id,
        title: data.title,
        date: data.date,
        notes: data.notes,
        optional_expansions: data.optional_expansions ?? [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        ending: data.ending,
        players: (data.players ?? []).map((gp) => {
          const playerDeaths = allDeaths.filter(d => d.player_id === gp.player.id)
          return {
            id: gp.id,
            player: gp.player,
            characters_played: gp.characters_played ?? [],
            total_deaths: playerDeaths.length,
            deaths: playerDeaths,
            total_toad_times: gp.total_toad_times ?? 0,
            is_winner: gp.is_winner,
            winning_character: gp.winning_character,
          }
        }),
        highscores: data.highscores ?? [],
        expansion_events: data.expansion_events ?? [],
      }
    },
  })
}
