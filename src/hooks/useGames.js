import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

export function useGames() {
  return useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('games')
        .select(`
          id,
          date,
          notes,
          created_at,
          ending:endings ( id, name ),
          players:game_players (
            id,
            characters_played,
            total_deaths,
            is_winner,
            winning_character,
            player:players ( id, name )
          ),
          expansion_events:game_expansion_events ( id )
        `)
        .order('date', { ascending: false })
      if (error) throw error
      return data.map((g) => ({
        id: g.id,
        date: g.date,
        notes: g.notes,
        createdAt: g.created_at,
        ending: g.ending,
        players: (g.players ?? []).map((gp) => ({
          id: gp.id,
          player: gp.player,
          characters_played: gp.characters_played ?? [],
          total_deaths: gp.total_deaths,
          is_winner: gp.is_winner,
          winning_character: gp.winning_character,
        })),
        expansion_events: g.expansion_events ?? [],
      }))
    },
  })
}
