import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

export function useEncounterScores(groupId) {
  return useQuery({
    queryKey: ['encounterScores', groupId ?? 'global'],
    queryFn: async () => {
      let query = supabase
        .from('encounter_scores')
        .select('id, encounter_name, creature_wins, player_wins')
        .order('encounter_name')

      if (groupId) query = query.eq('group_id', groupId)

      const { data, error } = await query
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
