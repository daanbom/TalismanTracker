import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { deleteChildRows, insertChildRows } from '../lib/gameWrites'
import { useActiveGroup } from './useActiveGroup'

export function useUpdateGame() {
  const queryClient = useQueryClient()
  const { activeGroupId } = useActiveGroup()

  return useMutation({
    mutationFn: async ({ gameId, formState }) => {
      if (!activeGroupId) {
        throw new Error('Select an active group before editing a game.')
      }

      const { data: updatedGame, error: gErr } = await supabase
        .from('games')
        .update({
          title: formState.title.trim(),
          date: formState.date,
          ending_id: formState.ending_id,
          notes: formState.notes || null,
          optional_expansions: formState.optional_expansions ?? [],
          updated_at: new Date().toISOString(),
        })
        .eq('group_id', activeGroupId)
        .eq('id', gameId)
        .select('id')
        .maybeSingle()
      if (gErr) throw gErr
      if (!updatedGame) throw new Error('Game not found in the active group.')

      await deleteChildRows(gameId)
      await insertChildRows(gameId, formState)

      return gameId
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
