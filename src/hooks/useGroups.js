import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { useAuth } from './useAuth'

export function useGroups() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['groups', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('group_members')
        .select('groups(id, name, admin_user_id, invite_code)')
        .eq('user_id', user.id)
      if (error) throw error
      return data.map((row) => row.groups).filter(Boolean)
    },
  })
}
