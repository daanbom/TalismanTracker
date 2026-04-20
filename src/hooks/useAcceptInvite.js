import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { useAuth } from './useAuth'

export function useAcceptInvite() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (token) => {
      const { data, error } = await supabase.rpc('accept_group_invite', { p_token: token })
      if (error) throw error
      return data  // group_id
    },
    onSuccess: (groupId) => {
      qc.invalidateQueries({ queryKey: ['groups', user?.id] })
      qc.invalidateQueries({ queryKey: ['pendingInvites', user?.id] })
      qc.invalidateQueries({ queryKey: ['groupMembers', groupId] })
    },
  })
}

export function useDeclineInvite() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (inviteId) => {
      const { error } = await supabase
        .from('group_invites')
        .update({ status: 'revoked' })
        .eq('id', inviteId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pendingInvites', user?.id] }),
  })
}
