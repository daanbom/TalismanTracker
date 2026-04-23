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

export function useHighscoreRecords(groupId) {
  return useQuery({
    queryKey: ['highscoreRecords', groupId ?? 'global'],
    queryFn: async () => {
      let gameIds = null

      if (groupId) {
        const { data: gamesData, error: gamesError } = await supabase
          .from('games')
          .select('id')
          .eq('group_id', groupId)
        if (gamesError) throw gamesError
        gameIds = gamesData.map(g => g.id)
        if (gameIds.length === 0) return Object.keys(CATEGORY_LABELS).map((category) => ({
          category,
          label: CATEGORY_LABELS[category],
          entries: [],
        }))
      }

      let hsQuery = supabase
        .from('game_highscores')
        .select(`
          category,
          value,
          player:players ( id, name ),
          game:games ( id, date )
        `)

      let gpQuery = supabase
        .from('game_players')
        .select(`
          game_id,
          total_toad_times,
          player:players ( id, name ),
          game:games ( id, date )
        `)

      let deathQuery = supabase
        .from('game_player_deaths')
        .select('game_id, player_id')

      if (gameIds) {
        hsQuery = hsQuery.in('game_id', gameIds)
        gpQuery = gpQuery.in('game_id', gameIds)
        deathQuery = deathQuery.in('game_id', gameIds)
      }

      const [hsResult, gpResult, deathResult] = await Promise.all([hsQuery, gpQuery, deathQuery])

      if (hsResult.error) throw hsResult.error
      if (gpResult.error) throw gpResult.error
      if (deathResult.error) throw deathResult.error

      const deathCounts = new Map()
      for (const d of deathResult.data) {
        const key = `${d.game_id}::${d.player_id}`
        deathCounts.set(key, (deathCounts.get(key) ?? 0) + 1)
      }

      const gpWithDeaths = gpResult.data.map(gp => ({
        ...gp,
        total_deaths: deathCounts.get(`${gp.game_id}::${gp.player?.id}`) ?? 0,
      }))

      const topByCategory = new Map()
      for (const row of hsResult.data) {
        if (!topByCategory.has(row.category)) topByCategory.set(row.category, [])
        topByCategory.get(row.category).push(row)
      }

      for (const [category, column] of Object.entries(DERIVED_CATEGORIES)) {
        const rows = []
        for (const gp of gpWithDeaths) {
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
