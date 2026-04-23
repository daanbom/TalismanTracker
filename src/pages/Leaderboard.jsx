import { useEffect, useState } from 'react'
import { useLeaderboardStats } from '../hooks/useLeaderboardStats'
import { useActiveGroup } from '../hooks/useActiveGroup'
import ScopeToggle from '../components/ScopeToggle'

const TALISMAN_SHOW = new Set(['name', 'games_played', 'wins', 'win_rate'])

const COLUMNS = [
  { key: 'name', label: 'Player', align: 'left' },
  { key: 'games_played', label: 'Games', align: 'center' },
  { key: 'wins', label: 'Wins', align: 'center' },
  { key: 'win_rate', label: 'Win %', align: 'center', format: v => `${v.toFixed(1)}%` },
  { key: 'best_win_streak', label: 'Best W Streak', align: 'center' },
  { key: 'longest_lose_streak', label: 'Worst L Streak', align: 'center' },
  { key: 'current_streak', label: 'Streak', align: 'center' },
  { key: 'total_deaths', label: 'Deaths', align: 'center' },
  { key: 'avg_deaths', label: 'Avg Deaths', align: 'center', format: v => v.toFixed(2) },
  { key: 'survival_rate', label: 'Survival %', align: 'center', format: v => `${v.toFixed(1)}%` },
  { key: 'total_toad_times', label: 'Toads', align: 'center' },
  { key: 'avg_toad_times', label: 'Avg Toads', align: 'center', format: v => v.toFixed(2) },
  { key: 'most_played', label: 'Most Played', align: 'left' },
  { key: 'best_character', label: 'Best Character', align: 'left' },
  { key: 'top_death', label: 'Top Death', align: 'left' },
  { key: 'nemesis', label: 'Nemesis', align: 'left' },
]

function SortIcon({ active, direction }) {
  return (
    <span className={`inline-block ml-1 text-[10px] transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
      {direction === 'asc' ? '▲' : '▼'}
    </span>
  )
}

export default function Leaderboard() {
  const { activeGroupId, activeGroup } = useActiveGroup()
  const [scope, setScope] = useState(() => activeGroupId ? 'group' : 'global')
  const [sortKey, setSortKey] = useState('wins')
  const [sortDir, setSortDir] = useState('desc')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScope(activeGroupId ? 'group' : 'global')
  }, [activeGroupId])

  const groupId = scope === 'group' ? activeGroupId : null
  const { data: rows = [], error, isLoading } = useLeaderboardStats(groupId)

  const sorted = [...rows].sort((a, b) => {
    const aVal = a[sortKey]
    const bVal = b[sortKey]
    if (typeof aVal === 'string') return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    return sortDir === 'asc' ? aVal - bVal : bVal - aVal
  })

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fade-up text-center">
        <h1 className="font-heading text-3xl text-parchment tracking-wide">Leaderboard</h1>
        <div className="ornament-divider mt-3">
          <span className="text-gold-dim">&#9670;</span>
        </div>
        <div className="mt-3 flex justify-center">
          <ScopeToggle value={scope} onChange={setScope} groupName={activeGroup?.name ?? null} />
        </div>
        <p className="text-muted text-sm font-body mt-3">Click any column to sort.</p>
      </div>

      {error && (
        <p className="text-danger text-sm font-body mb-4">{error.message}</p>
      )}

      {!isLoading && rows.length === 0 ? (
        <p className="text-muted text-sm font-body italic text-center">No stats yet. Log a game to populate the leaderboard.</p>
      ) : (
      <>
      {/* Desktop table */}
      <div className="hidden md:block animate-fade-up delay-2">
        <div className="bg-surface border border-gold-dim/15 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[1200px]">
            <thead>
              <tr className="border-b border-gold-dim/20">
                <th className="w-10 px-4 py-3.5 text-center text-xs font-heading text-muted tracking-wider">#</th>
                {COLUMNS.map(col => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className={`px-4 py-3.5 text-xs font-heading text-muted tracking-wider cursor-pointer group select-none hover:text-parchment/80 transition-colors ${
                      col.align === 'center' ? 'text-center' : 'text-left'
                    }`}
                  >
                    {col.label}
                    <SortIcon active={sortKey === col.key} direction={sortDir} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((player, idx) => (
                <tr
                  key={player.id}
                  className="border-b border-gold-dim/8 last:border-0 hover:bg-elevated/50 transition-colors"
                >
                  <td className="px-4 py-3.5 text-center">
                    <span className={`text-sm font-heading ${idx === 0 ? 'text-gold' : idx === 1 ? 'text-parchment/60' : idx === 2 ? 'text-amber-700' : 'text-muted'}`}>
                      {idx + 1}
                    </span>
                  </td>
                  {COLUMNS.map(col => {
                    const isTalisman = player.id === '__talisman__'
                    const showX = isTalisman && !TALISMAN_SHOW.has(col.key)
                    return (
                      <td
                        key={col.key}
                        className={`px-4 py-3.5 font-body text-sm ${col.align === 'center' ? 'text-center' : 'text-left'} ${
                          showX ? 'text-muted/40' :
                          col.key === 'name' ? 'font-heading text-parchment tracking-wide' :
                          col.key === 'win_rate' ? 'text-gold/80' :
                          'text-parchment/70'
                        }`}
                      >
                        {showX ? 'X' : col.format ? col.format(player[col.key]) : player[col.key]}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3 animate-fade-up delay-2">
        {sorted.map((player, idx) => (
          <div key={player.id} className="card-ornate bg-surface border border-gold-dim/15 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className={`text-lg font-heading ${idx === 0 ? 'text-gold' : idx === 1 ? 'text-parchment/60' : idx === 2 ? 'text-amber-700' : 'text-muted'}`}>
                  #{idx + 1}
                </span>
                <span className="font-heading text-parchment tracking-wide">{player.name}</span>
              </div>
              <span className="text-gold font-heading text-sm">{player.win_rate.toFixed(1)}% WR</span>
            </div>
            {player.id === '__talisman__' ? (
              <div className="grid grid-cols-3 gap-y-2 text-sm font-body">
                <div>
                  <span className="text-muted block text-xs">Games</span>
                  <span className="text-parchment/80">{player.games_played}</span>
                </div>
                <div>
                  <span className="text-muted block text-xs">Wins</span>
                  <span className="text-parchment/80">{player.wins}</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-y-2 text-sm font-body">
                <div>
                  <span className="text-muted block text-xs">Games</span>
                  <span className="text-parchment/80">{player.games_played}</span>
                </div>
                <div>
                  <span className="text-muted block text-xs">Wins</span>
                  <span className="text-parchment/80">{player.wins}</span>
                </div>
                <div>
                  <span className="text-muted block text-xs">Streak</span>
                  <span className="text-parchment/80">{player.current_streak}</span>
                </div>
                <div>
                  <span className="text-muted block text-xs">Best W Streak</span>
                  <span className="text-parchment/80">{player.best_win_streak}</span>
                </div>
                <div>
                  <span className="text-muted block text-xs">Worst L Streak</span>
                  <span className="text-parchment/80">{player.longest_lose_streak}</span>
                </div>
                <div>
                  <span className="text-muted block text-xs">Survival %</span>
                  <span className="text-parchment/80">{player.survival_rate.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-muted block text-xs">Deaths</span>
                  <span className="text-parchment/80">{player.total_deaths}</span>
                </div>
                <div>
                  <span className="text-muted block text-xs">Avg Deaths</span>
                  <span className="text-parchment/80">{player.avg_deaths.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted block text-xs">Toads</span>
                  <span className="text-parchment/80">{player.total_toad_times}</span>
                </div>
                <div className="col-span-3">
                  <span className="text-muted block text-xs">Most Played</span>
                  <span className="text-parchment/80">{player.most_played}</span>
                </div>
                <div className="col-span-3">
                  <span className="text-muted block text-xs">Best Character</span>
                  <span className="text-parchment/80">{player.best_character}</span>
                </div>
                <div className="col-span-3">
                  <span className="text-muted block text-xs">Top Death</span>
                  <span className="text-parchment/80">{player.top_death}</span>
                </div>
                <div className="col-span-3">
                  <span className="text-muted block text-xs">Nemesis</span>
                  <span className="text-parchment/80">{player.nemesis}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      </>
      )}
    </div>
  )
}
