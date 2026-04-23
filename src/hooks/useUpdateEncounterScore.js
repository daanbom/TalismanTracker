import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

export function useUpdateEncounterScore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ groupId, encounterName, column, delta }) => {
      if (!groupId) {
        throw new Error('Select an active group before updating encounter counters.')
      }

      const { data, error } = await supabase.rpc('increment_encounter_score', {
        p_group_id: groupId,
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
