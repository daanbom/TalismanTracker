import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { useAuth } from './useAuth'
import { useCurrentPlayer } from './useCurrentPlayer'

// Invites addressed to the current user's email, pending, not expired.
// Explicit invited_email filter — RLS admin branch would otherwise leak
// every invite on the admin's groups into their own pending list.
export function usePendingInvites() {
  const { user } = useAuth()
  const { data: player } = useCurrentPlayer()
  const email = user?.email?.toLowerCase() ?? null
  return useQuery({
    queryKey: ['pendingInvites', user?.id],
    enabled: !!user && !!player && !!email,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_invites')
        .select('id, token, group_id, expires_at, groups(name)')
        .eq('invited_email', email)
        .eq('status', 'pending')
        .gt('expires_at', new Date().toISOString())
      if (error) throw error
      return data
    },
  })
}
