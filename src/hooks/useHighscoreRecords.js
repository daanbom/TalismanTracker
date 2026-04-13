import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

const CATEGORY_LABELS = {
  most_gold: 'Most Gold',
  most_followers: 'Most Followers',
  most_objects: 'Most Objects',
  most_fate: 'Most Fate',
  most_strength: 'Most Strength (without bonus)',
  most_craft: 'Most Craft (without bonus)',
  most_life: 'Most Life',
  most_deaths: 'Most Deaths',
  most_toad_times: 'Most Times Turned Into Toad',
  longest_toad_streak: 'Longest Toad Streak (consecutive turns)',
  most_denizens_on_spot: 'Most Denizens on Spot',
}

export function useHighscoreRecords() {
  return useQuery({
    queryKey: ['highscoreRecords'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('game_highscores')
        .select(`
          category,
          value,
          player:players ( id, name ),
          game:games ( id, date )
        `)
      if (error) throw error

      const bestByCategory = new Map()
      for (const row of data) {
        const current = bestByCategory.get(row.category)
        if (!current || Number(row.value) > Number(current.value)) {
          bestByCategory.set(row.category, row)
        }
      }

      return Object.keys(CATEGORY_LABELS).map((category) => {
        const best = bestByCategory.get(category)
        if (!best) {
          return {
            category,
            label: CATEGORY_LABELS[category],
            player: null,
            value: null,
            game_date: null,
            game_id: null,
          }
        }
        return {
          category,
          label: CATEGORY_LABELS[category],
          player: best.player?.name ?? null,
          value: best.value,
          game_date: best.game?.date ?? null,
          game_id: best.game?.id ?? null,
        }
      })
    },
  })
}
