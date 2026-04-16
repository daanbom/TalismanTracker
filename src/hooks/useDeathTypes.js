import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

export function useDeathTypes() {
  return useQuery({
    queryKey: ['deathTypes'],
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('death_types')
        .select('id, name, description')
        .order('name', { ascending: true })
      if (error) throw error
      return data
    },
  })
}
