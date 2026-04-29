import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

export function usePets() {
  return useQuery({
    queryKey: ['pets'],
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pets')
        .select('id, key, name, expansion, ability_text')
        .order('name', { ascending: true })
      if (error) throw error
      return data
    },
  })
}
