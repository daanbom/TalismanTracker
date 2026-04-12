import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

export function useEndings() {
  return useQuery({
    queryKey: ['endings'],
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('endings')
        .select('id, name, expansion')
        .order('name', { ascending: true })
      if (error) throw error
      return data
    },
  })
}
