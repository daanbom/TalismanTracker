import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

export function useDeleteGame() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (gameId) => {
      const { error } = await supabase.from('games').delete().eq('id', gameId)
      if (error) throw error
      return gameId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboardStats'] })
      queryClient.invalidateQueries({ queryKey: ['highscoreRecords'] })
    },
  })
}
