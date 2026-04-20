import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

// Reads all invites for a group (admin only, enforced by RLS).
// includeHistory=true extends to revoked/accepted/expired in the last 30 days.
export function useGroupInvites(groupId, { includeHistory = false } = {}) {
  return useQuery({
    queryKey: ['groupInvites', groupId, includeHistory],
    enabled: !!groupId,
    queryFn: async () => {
      let q = supabase
        .from('group_invites')
        .select('id, invited_email, status, expires_at, created_at')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false })
      if (!includeHistory) {
        q = q.eq('status', 'pending')
      } else {
        const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        q = q.gte('created_at', cutoff)
      }
      const { data, error } = await q
      if (error) throw error
      return data
    },
  })
}

function newToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

// Upsert-by-hand: SELECT existing pending row -> UPDATE or INSERT.
// Avoids ON CONFLICT against a partial unique index.
export function useCreateEmailInvite(groupId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (rawEmail) => {
      const email = rawEmail.trim().toLowerCase()
      const token = newToken()
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

      const { data: existing, error: selErr } = await supabase
        .from('group_invites')
        .select('id')
        .eq('group_id', groupId)
        .eq('invited_email', email)
        .eq('status', 'pending')
        .maybeSingle()
      if (selErr) throw selErr

      if (existing) {
        const { error: updErr } = await supabase
          .from('group_invites')
          .update({ token, expires_at: expiresAt })
          .eq('id', existing.id)
        if (updErr) throw updErr
      } else {
        const { error: insErr } = await supabase
          .from('group_invites')
          .insert({ group_id: groupId, invited_email: email, token, status: 'pending', expires_at: expiresAt })
        if (insErr) throw insErr
      }
      return email
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
