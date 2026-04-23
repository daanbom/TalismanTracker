import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

export const EMPTY_TIERS = { S: [], A: [], B: [], C: [], D: [], F: [] }

export function useTierlist(playerId, { enabled = true } = {}) {
  return useQuery({
    queryKey: ['tierlist', playerId],
    enabled: !!playerId && enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tierlists')
        .select('id, player_id, tiers, updated_at')
        .eq('player_id', playerId)
        .maybeSingle()
      if (error) throw error
      if (!data) return { id: null, playerId, tiers: EMPTY_TIERS, updatedAt: null }
      const merged = { ...EMPTY_TIERS, ...(data.tiers ?? {}) }
      return {
        id: data.id,
        playerId: data.player_id,
        tiers: merged,
        updatedAt: data.updated_at,
      }
    },
  })
}
