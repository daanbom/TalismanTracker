import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

export function useUpdateEncounterScore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ encounterName, column, delta }) => {
      const { data, error } = await supabase.rpc('increment_encounter_score', {
        p_encounter_name: encounterName,
        p_column: column,
        p_delta: delta,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['encounterScores'] })
    },
  })
}
