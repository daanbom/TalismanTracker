import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

export function useGame(id) {
  return useQuery({
    queryKey: ['game', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('games')
        .select(`
          id,
          date,
          notes,
          optional_expansions,
          created_at,
          updated_at,
          ending:endings ( id, name, expansion ),
          players:game_players (
            id,
            characters_played,
            total_deaths,
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
          )
        `)
        .eq('id', id)
        .single()
      if (error) throw error
      return {
        id: data.id,
        date: data.date,
        notes: data.notes,
        optional_expansions: data.optional_expansions ?? [],
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        ending: data.ending,
        players: (data.players ?? []).map((gp) => ({
          id: gp.id,
          player: gp.player,
          characters_played: gp.characters_played ?? [],
          total_deaths: gp.total_deaths,
          is_winner: gp.is_winner,
          winning_character: gp.winning_character,
        })),
        highscores: data.highscores ?? [],
        expansion_events: data.expansion_events ?? [],
      }
    },
  })
}
