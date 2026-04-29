import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

export function useSaveTierlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ playerId, listType, tiers }) => {
      const { error } = await supabase
        .from('tierlists')
        .upsert({ player_id: playerId, list_type: listType, tiers }, { onConflict: 'player_id,list_type' })
        .select('id')
      if (error) throw error
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tierlist', variables.playerId, variables.listType] })
    },
  })
}
