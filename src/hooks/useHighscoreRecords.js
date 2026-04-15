import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

const CATEGORY_LABELS = {
  most_gold: 'Most Gold',
  most_followers: 'Most Followers',
  most_objects: 'Most Objects',
  most_fate: 'Most Fate',
  most_strength: 'Most Strength',
  most_craft: 'Most Craft',
  most_life: 'Most Life',
  most_deaths: 'Most Deaths',
  most_toad_times: 'Most Times Turned Into Toad',
  longest_toad_streak: 'Longest Toad Streak',
  most_denizens_on_spot: 'Most Denizens on Spot',
}

const DERIVED_CATEGORIES = {
  most_deaths: 'total_deaths',
  most_toad_times: 'total_toad_times',
}

export function useHighscoreRecords() {
  return useQuery({
    queryKey: ['highscoreRecords'],
    queryFn: async () => {
      const [hsResult, gpResult] = await Promise.all([
        supabase
          .from('game_highscores')
          .select(`
            category,
            value,
            player:players ( id, name ),
            game:games ( id, date )
          `),
        supabase
          .from('game_players')
          .select(`
            total_deaths,
            total_toad_times,
            player:players ( id, name ),
            game:games ( id, date )
          `),
      ])

      if (hsResult.error) throw hsResult.error
      if (gpResult.error) throw gpResult.error

      const topByCategory = new Map()
      for (const row of hsResult.data) {
        if (!topByCategory.has(row.category)) topByCategory.set(row.category, [])
        topByCategory.get(row.category).push(row)
      }

      for (const [category, column] of Object.entries(DERIVED_CATEGORIES)) {
        const rows = []
        for (const gp of gpResult.data) {
          const value = Number(gp[column] ?? 0)
          if (value <= 0) continue
          rows.push({ category, value, player: gp.player, game: gp.game })
        }
        topByCategory.set(category, rows)
      }

      for (const [category, rows] of topByCategory) {
        rows.sort((a, b) => Number(b.value) - Number(a.value))
        topByCategory.set(category, rows.slice(0, 5))
      }

      return Object.keys(CATEGORY_LABELS).map((category) => {
        const rows = topByCategory.get(category) ?? []
        return {
          category,
          label: CATEGORY_LABELS[category],
          entries: rows.map((row, _i, arr) => ({
            rank: arr.findIndex((r) => Number(r.value) === Number(row.value)) + 1,
            player: row.player?.name ?? null,
            value: row.value,
            game_date: row.game?.date ?? null,
            game_id: row.game?.id ?? null,
          })),
        }
      })
    },
  })
}
