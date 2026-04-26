import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { useAuth } from './useAuth'

export function useGroupMembers(groupId) {
  return useQuery({
    queryKey: ['groupMembers', groupId],
    enabled: !!groupId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select('user_id, is_admin, players(id, name)')
        .eq('group_id', groupId)
      if (error) throw error
      return data
        .map((row) => ({ userId: row.user_id, isAdmin: Boolean(row.is_admin), ...row.players }))
        .filter((m) => m.id)
    },
  })
}

export function useRemoveMember(groupId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (userId) => {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', userId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groupMembers', groupId] })
      qc.invalidateQueries({ queryKey: ['players'] })
    },
  })
}

export function useSetMemberAdmin(groupId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId, isAdmin }) => {
      const { error } = await supabase.rpc('set_group_member_admin', {
        p_group_id: groupId,
        p_user_id: userId,
        p_is_admin: isAdmin,
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] })
      qc.invalidateQueries({ queryKey: ['groupMembers', groupId] })
    },
  })
}

export function useRenameGroup(groupId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (name) => {
      const { error } = await supabase
        .from('groups')
        .update({ name })
        .eq('id', groupId)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

export function useLeaveGroup(groupId) {
  const qc = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async () => {
      if (!groupId) throw new Error('No group selected.')
      if (!user?.id) throw new Error('You must be signed in to leave a group.')

      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id)

      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] })
      qc.invalidateQueries({ queryKey: ['groupMembers', groupId] })
      qc.invalidateQueries({ queryKey: ['groupInvites', groupId] })
      qc.invalidateQueries({ queryKey: ['groupJoinRequests', groupId] })
      qc.invalidateQueries({ queryKey: ['games'] })
      qc.invalidateQueries({ queryKey: ['players'] })
    },
  })
}
