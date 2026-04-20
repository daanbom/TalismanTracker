import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { useAuth } from './useAuth'
import { useCurrentPlayer } from './useCurrentPlayer'

// Invites addressed to the current user's email, pending, not expired.
// RLS already filters by email+status+expires_at — query stays simple.
export function usePendingInvites() {
  const { user } = useAuth()
  const { data: player } = useCurrentPlayer()
  return useQuery({
    queryKey: ['pendingInvites', user?.id],
    enabled: !!user && !!player,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_invites')
        .select('id, token, group_id, expires_at, groups(name)')
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
      if (error) throw error
      return data
    },
  })
}
