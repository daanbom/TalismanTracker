import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

export function useGroupHouseRules(groupId) {
  return useQuery({
    queryKey: ['groupHouseRules', groupId],
    enabled: !!groupId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_house_rules')
        .select('group_id, content, updated_at, updated_by')
        .eq('group_id', groupId)
        .maybeSingle()
      if (error) throw error
      if (!data) return { groupId, content: { sections: [] }, updatedAt: null, exists: false }
      return {
        groupId: data.group_id,
        content: data.content ?? { sections: [] },
        updatedAt: data.updated_at,
        updatedBy: data.updated_by,
        exists: true,
      }
    },
  })
}
