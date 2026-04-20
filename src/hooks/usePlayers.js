import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { useActiveGroup } from './useActiveGroup'
import { useCurrentPlayer } from './useCurrentPlayer'

const PLAYER_COLUMNS =
  'id, name, created_at, icon_key, icon_character_id, favorite_character_id, user_id'

function normalize(p) {
  return {
    id: p.id,
    name: p.name,
    createdAt: p.created_at,
    iconKey: p.icon_key,
    iconCharacterId: p.icon_character_id,
    favoriteCharacterId: p.favorite_character_id,
    userId: p.user_id,
  }
}

export function usePlayers() {
  const { activeGroupId, isLoading: groupsLoading } = useActiveGroup()
  const { data: currentPlayer, isLoading: currentLoading } = useCurrentPlayer()

  return useQuery({
    queryKey: ['players', activeGroupId ?? 'self', currentPlayer?.id ?? null],
    enabled: !groupsLoading && !currentLoading,
    queryFn: async () => {
      if (activeGroupId) {
        const { data, error } = await supabase
          .from('group_members')
          .select(`players(${PLAYER_COLUMNS})`)
          .eq('group_id', activeGroupId)
        if (error) throw error
        return data
          .map((row) => row.players)
          .filter(Boolean)
          .map(normalize)
          .sort((a, b) => a.name.localeCompare(b.name))
      }
      if (!currentPlayer) return []
      return [normalize(currentPlayer)]
    },
  })
}
