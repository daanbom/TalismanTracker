import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

const CATEGORY_LABELS = {
  most_coins: 'Most Coins',
  most_followers: 'Most Followers',
  most_objects: 'Most Objects',
  most_denizens_on_spot: 'Most Denizens on Spot',
  most_deaths: 'Most Deaths in One Game',
}

export function useHighscoreRecords() {
  return useQuery({
    queryKey: ['highscoreRecords'],
    queryFn: async () => {
      const [highscoresResult, deathsResult] = await Promise.all([
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
            player:players ( id, name ),
            game:games ( id, date )
          `)
          .order('total_deaths', { ascending: false })
          .limit(5),
      ])

      if (highscoresResult.error) throw highscoresResult.error

      const topByCategory = new Map()
      for (const row of highscoresResult.data) {
        if (!topByCategory.has(row.category)) topByCategory.set(row.category, [])
        topByCategory.get(row.category).push(row)
      }
      for (const [category, rows] of topByCategory) {
        rows.sort((a, b) => Number(b.value) - Number(a.value))
        topByCategory.set(category, rows.slice(0, 5))
      }

      const deathsRows = deathsResult.data ?? []
      if (deathsRows.length > 0) {
        topByCategory.set(
          'most_deaths',
          deathsRows.map((r) => ({
            category: 'most_deaths',
            value: r.total_deaths,
            player: r.player,
            game: r.game,
          }))
        )
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
