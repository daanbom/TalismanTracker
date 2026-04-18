import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

export function useIcons() {
  return useQuery({
    queryKey: ['icons'],
    staleTime: Infinity,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('icons')
        .select('id, key, name, expansion, character_id')
        .order('name', { ascending: true })
      if (error) throw error
      return data
    },
  })
}
