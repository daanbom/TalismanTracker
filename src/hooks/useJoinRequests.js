import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { useAuth } from './useAuth'

export function useAllGroups() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['allGroups', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('list_all_groups')
      if (error) throw error
      return (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        memberCount: Number(row.member_count ?? 0),
      }))
    },
  })
}

export function useMyJoinRequests() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['myJoinRequests', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_join_requests')
        .select('id, group_id, status')
        .eq('user_id', user.id)
      if (error) throw error
      return data ?? []
    },
  })
}

export function useGroupJoinRequests(groupId) {
  return useQuery({
    queryKey: ['groupJoinRequests', groupId],
    enabled: !!groupId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_pending_join_requests', {
        p_group_id: groupId,
      })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useRequestToJoin() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async ({ groupId }) => {
      // unique constraint on (group_id, user_id) — check for rejected row first
      const { data: existing, error: selErr } = await supabase
        .from('group_join_requests')
        .select('id, status')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .maybeSingle()
      if (selErr) throw selErr

      if (existing?.status === 'rejected') {
        const { error: delErr } = await supabase
          .from('group_join_requests')
          .delete()
          .eq('id', existing.id)
        if (delErr) throw delErr
      } else if (existing?.status === 'pending' || existing?.status === 'approved') {
        return // already pending or approved, no-op
      }

      const { error: insErr } = await supabase
        .from('group_join_requests')
        .insert({ group_id: groupId, user_id: user.id, status: 'pending' })
      if (insErr) throw insErr
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myJoinRequests', user?.id] })
    },
  })
}

export function useApproveJoinRequest(groupId) {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (requestId) => {
      const { data, error } = await supabase.rpc('approve_join_request', {
        p_request_id: requestId,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groupJoinRequests', groupId] })
      qc.invalidateQueries({ queryKey: ['groups', user?.id] })
    },
  })
}

export function useDeclineJoinRequest(groupId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (requestId) => {
      const { error } = await supabase
        .from('group_join_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groupJoinRequests', groupId] })
      qc.invalidateQueries({ queryKey: ['myJoinRequests'] })
    },
  })
}
