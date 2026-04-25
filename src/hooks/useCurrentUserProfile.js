import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { useAuth } from './useAuth'

export function useCurrentUserProfile() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['currentUserProfile', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id, username, created_at')
        .eq('user_id', user.id)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}
