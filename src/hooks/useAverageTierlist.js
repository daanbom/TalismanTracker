import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

const TIERS = ['S', 'A', 'B', 'C', 'D', 'F']
const TIER_POINTS = { S: 6, A: 5, B: 4, C: 3, D: 2, F: 1 }
const POINT_TO_TIER = { 6: 'S', 5: 'A', 4: 'B', 3: 'C', 2: 'D', 1: 'F' }

const EMPTY_TIERS = { S: [], A: [], B: [], C: [], D: [], F: [] }

function keyFingerprint(ids) {
  return [...ids].sort().join(',')
}

function clampPoint(value) {
  if (value < 1) return 1
  if (value > 6) return 6
  return value
}

function buildGroupedStats(statsSource) {
  const grouped = { S: [], A: [], B: [], C: [], D: [], F: [] }
  const statsByKey = {}

  for (const [key, raw] of Object.entries(statsSource ?? {})) {
    if (!key || !raw) continue

    const average = Number(raw.average ?? 0)
    const count = Number(raw.count ?? 0)
    const total = Number(raw.total ?? average * count)
    if (!Number.isFinite(average) || !Number.isFinite(count) || count <= 0) continue

    const nearestPoint = clampPoint(Math.round(average))
    const assignedTier = POINT_TO_TIER[nearestPoint]
    statsByKey[key] = { average, count, total, tier: assignedTier }
    grouped[assignedTier].push(key)
  }

  for (const tier of TIERS) {
    grouped[tier].sort((left, right) => {
      const leftStats = statsByKey[left]
      const rightStats = statsByKey[right]
      if (!leftStats || !rightStats) return 0
      if (rightStats.average !== leftStats.average) return rightStats.average - leftStats.average
      if (rightStats.count !== leftStats.count) return rightStats.count - leftStats.count
      return left.localeCompare(right)
    })
  }

  return { tiers: grouped, statsByKey }
}

export function useAverageTierlist({
  listType = 'character',
  scope = 'group',
  groupPlayerIds = [],
  enabled = true,
} = {}) {
  return useQuery({
    queryKey: ['averageTierlist', listType, scope, keyFingerprint(groupPlayerIds)],
    enabled,
    queryFn: async () => {
      if (scope === 'group' && groupPlayerIds.length === 0) {
        return {
          tiers: EMPTY_TIERS,
          statsByKey: {},
          playerCount: 0,
          submittedCount: 0,
        }
      }

      if (scope === 'global') {
        const { data, error } = await supabase.rpc('get_platform_average_tierlist', {
          p_list_type: listType,
        })
        if (error) throw error

        const payload = data ?? {}
        const { tiers, statsByKey } = buildGroupedStats(payload.stats_by_key ?? {})

        return {
          tiers,
          statsByKey,
          playerCount: Number(payload.player_count ?? 0),
          submittedCount: Number(payload.submitted_count ?? 0),
        }
      }

      let query = supabase
        .from('tierlists')
        .select('player_id, tiers')
        .eq('list_type', listType)
        .in('player_id', groupPlayerIds)

      const { data, error } = await query

      if (error) throw error

      const totalsByKey = new Map()
      const countsByKey = new Map()
      const submittedPlayers = new Set()

      for (const row of data ?? []) {
        submittedPlayers.add(row.player_id)

        const tiers = row.tiers ?? {}
        const seen = new Set()

        for (const tier of TIERS) {
          const keys = Array.isArray(tiers[tier]) ? tiers[tier] : []
          const points = TIER_POINTS[tier]

          for (const key of keys) {
            if (!key || seen.has(key)) continue
            seen.add(key)
            totalsByKey.set(key, (totalsByKey.get(key) ?? 0) + points)
            countsByKey.set(key, (countsByKey.get(key) ?? 0) + 1)
          }
        }
      }

      const rawStats = {}
      for (const [key, total] of totalsByKey.entries()) {
        const count = Number(countsByKey.get(key) ?? 0)
        if (count <= 0) continue
        rawStats[key] = {
          average: total / count,
          count,
          total,
        }
      }
      const { tiers, statsByKey } = buildGroupedStats(rawStats)

      return {
        tiers,
        statsByKey,
        playerCount: groupPlayerIds.length,
        submittedCount: submittedPlayers.size,
      }
    },
  })
}
