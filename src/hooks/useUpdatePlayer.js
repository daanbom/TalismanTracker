import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

export function useUpdatePlayer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ playerId, name, iconKey = null, iconCharacterId = null, favoriteCharacterId = null }) => {
      const trimmed = name.trim()
      if (!trimmed) throw new Error('Name is required')
      const { error } = await supabase
        .from('players')
        .update({ name: trimmed, icon_key: iconKey, icon_character_id: iconCharacterId, favorite_character_id: favoriteCharacterId })
        .eq('id', playerId)
        .select('id')
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboardStats'] })
    },
  })
}
