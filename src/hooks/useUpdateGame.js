import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { buildGameWritePayload } from '../lib/gameWrites'
import { useActiveGroup } from './useActiveGroup'

export function useUpdateGame() {
  const queryClient = useQueryClient()
  const { activeGroupId } = useActiveGroup()

  return useMutation({
    mutationFn: async ({ gameId, formState }) => {
      if (!activeGroupId) {
        throw new Error('Select an active group before editing a game.')
      }

      const payload = buildGameWritePayload(formState)
      const { data, error } = await supabase.rpc('update_game_atomic', {
        p_game_id: gameId,
        p_title: formState.title.trim(),
        p_date: formState.date,
        p_ending_id: formState.ending_id,
        p_notes: formState.notes || null,
        p_optional_expansions: formState.optional_expansions ?? [],
        p_game_players: payload.game_players,
        p_highscores: payload.highscores,
        p_deaths: payload.deaths,
        p_expansion_events: payload.expansion_events,
      })
      if (error) throw error
      if (!data) throw new Error('Game not found in the active group.')
      return data
    },
    onSuccess: (gameId) => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
      queryClient.invalidateQueries({ queryKey: ['game', gameId] })
      queryClient.invalidateQueries({ queryKey: ['leaderboardStats'] })
      queryClient.invalidateQueries({ queryKey: ['highscoreRecords'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}
