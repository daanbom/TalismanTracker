import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

// Reads group invites for admins via SECURITY DEFINER RPC.
// includeHistory=true extends to revoked/accepted/expired in the last 30 days.
export function useGroupInvites(groupId, { includeHistory = false } = {}) {
  return useQuery({
    queryKey: ['groupInvites', groupId, includeHistory],
    enabled: !!groupId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_group_invites_for_admin', {
        p_group_id: groupId,
        p_include_history: includeHistory,
      })
      if (error) throw error
      return data
    },
  })
}

function newToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

// Create (or refresh) a pending invite for an existing username.
export function useCreateUsernameInvite(groupId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (rawUsername) => {
      const username = rawUsername.trim().toLowerCase()
      const token = newToken()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

      const { data, error } = await supabase.rpc('create_group_invite_by_username', {
        p_group_id: groupId,
        p_username: username,
        p_token: token,
        p_expires_at: expiresAt,
      })
      if (error) throw error
      return data?.[0]?.invited_username ?? username
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groupInvites', groupId] }),
  })
}

export function useRevokeInvite(groupId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (inviteId) => {
      const { error } = await supabase
        .from('group_invites')
        .update({ status: 'revoked' })
        .eq('id', inviteId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['groupInvites', groupId] }),
  })
}

function newInviteCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  return Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 12)
}

export function useRegenerateInviteCode(groupId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const code = newInviteCode()
      const { error } = await supabase
        .from('groups')
        .update({ invite_code: code })
        .eq('id', groupId)
      if (error) throw error
      return code
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}
