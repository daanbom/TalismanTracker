import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { useActiveGroup } from './useActiveGroup'

export function useAddPlayer() {
  const queryClient = useQueryClient()
  const { activeGroupId } = useActiveGroup()
  return useMutation({
    mutationFn: async ({ name, iconKey = null, iconCharacterId = null, favoriteCharacterId = null }) => {
      const trimmed = name.trim()
      if (!trimmed) throw new Error('Name is required')
      if (!activeGroupId) throw new Error('Select an active group before adding a guest player.')

      const { data, error } = await supabase.rpc('create_group_guest_player', {
        p_group_id: activeGroupId,
        p_name: trimmed,
        p_icon_key: iconKey,
        p_icon_character_id: iconCharacterId,
        p_favorite_character_id: favoriteCharacterId,
      })
      if (error) throw error

      const created = Array.isArray(data) ? data[0] : data
      if (!created?.id) throw new Error('Guest player was created but no id was returned.')

      return {
        id: created.id,
        name: created.name,
        created_at: created.created_at,
        icon_key: created.icon_key,
        icon_character_id: created.icon_character_id,
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboardStats'] })
    },
  })
}
