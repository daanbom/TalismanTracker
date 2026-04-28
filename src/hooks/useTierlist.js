import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

export const EMPTY_TIERS = { S: [], A: [], B: [], C: [], D: [], F: [] }

export function useTierlist(playerId, listType = 'character', { enabled = true } = {}) {
  return useQuery({
    queryKey: ['tierlist', playerId, listType],
    enabled: !!playerId && enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tierlists')
        .select('id, player_id, list_type, tiers, updated_at')
        .eq('player_id', playerId)
        .eq('list_type', listType)
        .maybeSingle()
      if (error) throw error
      if (!data) return { id: null, playerId, listType, tiers: EMPTY_TIERS, updatedAt: null }
      const merged = { ...EMPTY_TIERS, ...(data.tiers ?? {}) }
      return {
        id: data.id,
        playerId: data.player_id,
        listType: data.list_type,
        tiers: merged,
        updatedAt: data.updated_at,
      }
    },
  })
}
