import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { useActiveGroup } from './useActiveGroup'
import { useAuth } from './useAuth'

export function useClaimGuestPlayer() {
  const queryClient = useQueryClient()
  const { activeGroupId } = useActiveGroup()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ guestPlayerId }) => {
      if (!activeGroupId) throw new Error('Select an active group before claiming a guest player.')
      const { data, error } = await supabase.rpc('claim_group_guest_player', {
        p_group_id: activeGroupId,
        p_guest_player_id: guestPlayerId,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
      queryClient.invalidateQueries({ queryKey: ['currentPlayer', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['groupMembers', activeGroupId] })
      queryClient.invalidateQueries({ queryKey: ['leaderboardStats'] })
      queryClient.invalidateQueries({ queryKey: ['highscoreRecords'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
      queryClient.invalidateQueries({ queryKey: ['games'] })
      queryClient.invalidateQueries({ queryKey: ['tierlist'] })
    },
  })
}
