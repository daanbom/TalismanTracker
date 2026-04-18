import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

export function usePlayers() {
  return useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('players')
        .select('id, name, created_at, icon_key, icon_character_id, favorite_character_id')
        .order('name', { ascending: true })
      if (error) throw error
      return data.map((p) => ({
        id: p.id,
        name: p.name,
        createdAt: p.created_at,
        iconKey: p.icon_key,
        iconCharacterId: p.icon_character_id,
        favoriteCharacterId: p.favorite_character_id,
      }))
    },
  })
}
