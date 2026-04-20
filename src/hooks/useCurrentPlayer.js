import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { useAuth } from './useAuth'

export function useCurrentPlayer() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['currentPlayer', user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })
}
