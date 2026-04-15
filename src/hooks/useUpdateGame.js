import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { deleteChildRows, insertChildRows } from '../lib/gameWrites'

export function useUpdateGame() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ gameId, formState }) => {
      const { error: gErr } = await supabase
        .from('games')
        .update({
          title: formState.title.trim(),
          date: formState.date,
          ending_id: formState.ending_id,
          notes: formState.notes || null,
          optional_expansions: formState.optional_expansions ?? [],
          updated_at: new Date().toISOString(),
        })
        .eq('id', gameId)
      if (gErr) throw gErr

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
