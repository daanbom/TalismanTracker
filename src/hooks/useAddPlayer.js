import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

export function useAddPlayer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (name) => {
      const trimmed = name.trim()
      if (!trimmed) throw new Error('Name is required')
      const { data, error } = await supabase
        .from('players')
        .insert({ name: trimmed })
        .select('id, name, created_at')
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] })
      queryClient.invalidateQueries({ queryKey: ['leaderboardStats'] })
    },
  })
}
