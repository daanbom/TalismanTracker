import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

export function usePlayers() {
  return useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('id, name, created_at')
        .order('name', { ascending: true })
      if (error) throw error
      return data.map((p) => ({
        id: p.id,
        name: p.name,
        createdAt: p.created_at,
      }))
    },
  })
}
