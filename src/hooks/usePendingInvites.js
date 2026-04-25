import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { useAuth } from './useAuth'
import { useCurrentPlayer } from './useCurrentPlayer'

// Invites addressed to the current user, pending, not expired.
// Uses a SECURITY DEFINER RPC so the group name comes back even though the
// invitee isn't a group member yet (the groups select policy is members-only).
export function usePendingInvites() {
  const { user } = useAuth()
  const { data: player } = useCurrentPlayer()
  return useQuery({
    queryKey: ['pendingInvites', user?.id],
    enabled: !!user && !!player,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_pending_invites_for_me')
      if (error) throw error
      return data
    },
  })
}
