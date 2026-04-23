import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { useAuth } from './useAuth'

// Resolves a code to a group; caller supplies player_id since the hook shouldn't
// re-query it (useCurrentPlayer is already cached in the page).
export async function lookupGroupByCode(code) {
  const { data, error } = await supabase.rpc('get_group_by_invite_code', { p_code: code })
  if (error) throw error
  return data?.[0] ?? null
}

export function useJoinByCode() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async ({ groupId, playerId }) => {
      const { error } = await supabase
        .from('group_members')
        .insert({ group_id: groupId, user_id: user.id, player_id: playerId })
      if (error && error.code !== '23505') throw error  // unique_violation = already a member, tolerate
    },
    onSuccess: (_data, { groupId }) => {
      qc.invalidateQueries({ queryKey: ['groups', user?.id] })
      qc.invalidateQueries({ queryKey: ['groupMembers', groupId] })
    },
  })
}
