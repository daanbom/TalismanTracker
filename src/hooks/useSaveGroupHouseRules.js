import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { useAuth } from './useAuth'

export function useSaveGroupHouseRules(groupId) {
  const qc = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ content, expectedUpdatedAt }) => {
      if (!groupId) throw new Error('No group selected.')
      if (!user?.id) throw new Error('Not authenticated.')

      // Brand-new doc: insert.
      if (!expectedUpdatedAt) {
        const { data, error } = await supabase
          .from('group_house_rules')
          .insert({ group_id: groupId, content, updated_by: user.id })
          .select('group_id, content, updated_at, updated_by')
          .single()
        if (error) throw error
        return { stale: false, row: data }
      }

      // Existing doc: optimistic update.
      const { data, error } = await supabase
        .from('group_house_rules')
        .update({ content, updated_by: user.id })
        .eq('group_id', groupId)
        .eq('updated_at', expectedUpdatedAt)
        .select('group_id, content, updated_at, updated_by')

      if (error) throw error
      if (!data || data.length === 0) {
        return { stale: true, row: null }
      }
      return { stale: false, row: data[0] }
    },
    onSuccess: (result) => {
      if (!result.stale) {
        qc.invalidateQueries({ queryKey: ['groupHouseRules', groupId] })
      }
    },
  })
}
