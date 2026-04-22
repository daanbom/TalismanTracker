import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { insertChildRows } from '../lib/gameWrites'
import { useActiveGroup } from './useActiveGroup'

export function useLogGame() {
  const queryClient = useQueryClient()
  const { activeGroupId } = useActiveGroup()

  return useMutation({
    mutationFn: async (formState) => {
      if (!activeGroupId) {
        throw new Error('Select an active group before logging a game.')
      }

      const { data: game, error: gErr } = await supabase
        .from('games')
        .insert({
          title: formState.title.trim(),
          date: formState.date,
          ending_id: formState.ending_id,
          group_id: activeGroupId,
          notes: formState.notes || null,
          optional_expansions: formState.optional_expansions ?? [],
        })
        .select('id')
        .single()
      if (gErr) throw gErr

      try {
        await insertChildRows(game.id, formState)
      } catch (err) {
        await supabase.from('games').delete().eq('id', game.id)
        throw err
      }

      return game.id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboardStats'] })
      queryClient.invalidateQueries({ queryKey: ['highscoreRecords'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}
