import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

export function useCharacters() {
  return useQuery({
    queryKey: ['characters'],
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('characters')
        .select('id, name, expansion')
        .order('name', { ascending: true })
      if (error) throw error
      return data
    },
  })
}
