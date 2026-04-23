import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { useActiveGroup } from './useActiveGroup'

export function useDeleteGame() {
  const queryClient = useQueryClient()
  const { activeGroupId } = useActiveGroup()

  return useMutation({
    mutationFn: async (gameId) => {
      if (!activeGroupId) {
        throw new Error('Select an active group before deleting a game.')
      }

      const { data, error } = await supabase
        .from('games')
        .delete()
        .eq('group_id', activeGroupId)
        .eq('id', gameId)
        .select('id')
        .maybeSingle()
      if (error) throw error
      if (!data) throw new Error('Game not found in the active group.')
      return gameId
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboardStats'] })
      queryClient.invalidateQueries({ queryKey: ['highscoreRecords'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}
