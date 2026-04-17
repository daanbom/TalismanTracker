import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

export function useUpdatePlayerIcon() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ playerId, iconKey, iconCharacterId }) => {
      const { error } = await supabase
        .from('players')
        .update({ icon_key: iconKey, icon_character_id: iconCharacterId })
        .eq('id', playerId)
        .select('id')
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
    },
  })
}
