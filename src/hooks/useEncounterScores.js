import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

export function useEncounterScores() {
  return useQuery({
    queryKey: ['encounterScores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('encounter_scores')
        .select('id, encounter_name, creature_wins, player_wins')
        .order('encounter_name')
      if (error) throw error
      return (data ?? []).map((row) => ({
        id: row.id,
        encounterName: row.encounter_name,
        creatureWins: row.creature_wins,
        playerWins: row.player_wins,
      }))
    },
  })
}
