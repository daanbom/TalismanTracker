import { useEffect, useMemo, useState } from 'react'
import { WoodlandPathTooltip } from '../components/WoodlandPathTooltip'
import { useStatsData } from '../hooks/useStatsData'
import { useCharacters } from '../hooks/useCharacters'
import { useActiveGroup } from '../hooks/useActiveGroup'
import ScopeToggle from '../components/ScopeToggle'
import {
  OPTIONAL_EXPANSION_FILTERS,
  filterGamesByOptionalExpansions,
  computeCharacterStats,
  computeCharacterStatsByPlayer,
  computeEndingStats,
  computeExpansionEventStats,
  computeDeathTypeStats,
  computePlayerDeathBreakdown,
  computeCharacterDeathBreakdown,
  computePvpKillLeaderboard,
} from '../lib/statsAggregations'

const TABS = [
  { key: 'characters', label: 'Characters' },
  { key: 'endings', label: 'Endings' },
  { key: 'expansions', label: 'Expansions' },
  { key: 'deaths', label: 'Deaths' },
]

function SortIcon({ active, direction }) {
  return (
    <span className={`inline-block ml-1 text-[10px] transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
      {direction === 'asc' ? '▲' : '▼'}
    </span>
  )
}

function useSort(initialKey, initialDir = 'desc') {
  const [sortKey, setSortKey] = useState(initialKey)
  const [sortDir, setSortDir] = useState(initialDir)
  const toggle = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }
  const sort = (rows) => [...rows].sort((a, b) => {
    const aVal = a[sortKey]
    const bVal = b[sortKey]
    if (typeof aVal === 'string') return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    return sortDir === 'asc' ? (aVal ?? 0) - (bVal ?? 0) : (bVal ?? 0) - (aVal ?? 0)
  })
  return { sortKey, sortDir, toggle, sort }
}

function StatsTable({ columns, rows, sort, sortKey, sortDir, onSort, emptyMessage, compact }) {
  const sorted = sort(rows)
  if (sorted.length === 0) {
    return <p className="text-muted text-sm font-body italic">{emptyMessage}</p>
  }
  return (
    <div className="bg-surface border border-gold-dim/15 rounded-xl overflow-hidden overflow-x-auto">
      <table className={`w-full ${compact ? '' : 'min-w-[640px]'}`}>
        <thead>
          <tr className="border-b border-gold-dim/20">
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => col.sortable !== false && onSort(col.key)}
                className={`px-4 py-3.5 text-xs font-heading text-muted tracking-wider ${col.sortable === false ? '' : 'cursor-pointer group select-none hover:text-parchment/80'} transition-colors ${col.align === 'center' ? 'text-center' : 'text-left'}`}
              >
                {col.label}
                {col.sortable !== false && <SortIcon active={sortKey === col.key} direction={sortDir} />}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, idx) => (
            <tr key={row.id ?? row.character ?? row.path ?? idx} className="border-b border-gold-dim/8 last:border-0 hover:bg-elevated/50 transition-colors">
              {columns.map(col => (
                <td
                  key={col.key}
                  className={`px-4 py-3 font-body text-sm ${col.align === 'center' ? 'text-center' : 'text-left'} ${col.accent ? 'text-gold/80' : 'text-parchment/70'}`}
                >
                  {col.format ? col.format(row[col.key], row) : (row[col.key] ?? 'NA')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const pct = (v) => `${(v * 100).toFixed(1)}%`

function CharactersTab({ games, allCharacters }) {
  const [expansionFilter, setExpansionFilter] = useState('all')
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const { sortKey, sortDir, toggle, sort } = useSort('games', 'desc')
  const playerSort = useSort('games', 'desc')

  const rows = useMemo(
    () => computeCharacterStats(games, allCharacters),
    [games, allCharacters],
  )
  const byPlayerRows = useMemo(
    () => computeCharacterStatsByPlayer(games, allCharacters),
    [games, allCharacters],
  )

  const expansions = useMemo(() => {
    const set = new Set(rows.map(r => r.expansion).filter(Boolean))
    return Array.from(set).sort()
  }, [rows])

  const playerNames = useMemo(() => {
    const set = new Set(byPlayerRows.map(r => r.playerName))
    return Array.from(set).sort()
  }, [byPlayerRows])

  const filtered = expansionFilter === 'all'
    ? rows
    : rows.filter(r => r.expansion === expansionFilter)

  const filteredByPlayer = useMemo(() => {
    if (!selectedPlayer) {
      return [...byPlayerRows].sort((a, b) => b.games - a.games).slice(0, 5)
    }
    return byPlayerRows.filter(r => r.playerName === selectedPlayer)
  }, [byPlayerRows, selectedPlayer])

  const globalColumns = [
    { key: 'character', label: 'Character', align: 'left' },
    { key: 'expansion', label: 'Expansion', align: 'left' },
    { key: 'games', label: 'Games', align: 'center' },
    { key: 'wins', label: 'Wins', align: 'center' },
    { key: 'winRate', label: 'Win %', align: 'center', format: pct, accent: true },
    { key: 'deaths', label: 'Deaths', align: 'center' },
    { key: 'deathRate', label: 'Death %', align: 'center', format: pct },
    { key: 'topDeath', label: 'Top Death', align: 'left', sortable: false },
  ]

  const playerColumns = [
    ...(!selectedPlayer ? [{ key: 'playerName', label: 'Player', align: 'left' }] : []),
    { key: 'character', label: 'Character', align: 'left' },
    { key: 'expansion', label: 'Expansion', align: 'left' },
    { key: 'games', label: 'Games', align: 'center' },
    { key: 'wins', label: 'Wins', align: 'center' },
    { key: 'winRate', label: 'Win %', align: 'center', format: pct, accent: true },
    { key: 'deaths', label: 'Deaths', align: 'center' },
    { key: 'deathRate', label: 'Death %', align: 'center', format: pct },
    { key: 'topDeath', label: 'Top Death', align: 'left', sortable: false },
  ]

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-body text-muted uppercase tracking-wider">Expansion</span>
          <select
            className="input-field text-sm py-1.5 w-auto"
            value={expansionFilter}
            onChange={e => setExpansionFilter(e.target.value)}
          >
            <option value="all">All</option>
            {expansions.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>
        <StatsTable
          columns={globalColumns}
          rows={filtered}
          sort={sort}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={toggle}
          emptyMessage="No character data yet."
        />
      </section>
      <section className="space-y-4">
        <h3 className="font-heading text-lg text-parchment tracking-wide">Characters by Player</h3>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-body text-muted uppercase tracking-wider">Player</span>
          <select
            className="input-field text-sm py-1.5 w-auto"
            value={selectedPlayer}
            onChange={e => setSelectedPlayer(e.target.value)}
          >
            <option value="">Top 5</option>
            {playerNames.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
        <StatsTable
          columns={playerColumns}
          rows={filteredByPlayer}
          sort={playerSort.sort}
          sortKey={playerSort.sortKey}
          sortDir={playerSort.sortDir}
          onSort={playerSort.toggle}
          emptyMessage="No character data for this player."
        />
      </section>
    </div>
  )
}

function EndingsTab({ games }) {
  const { sortKey, sortDir, toggle, sort } = useSort('times', 'desc')
  const rows = useMemo(() => computeEndingStats(games), [games])

  const columns = [
    { key: 'name', label: 'Ending', align: 'left' },
    { key: 'expansion', label: 'Expansion', align: 'left' },
    { key: 'times', label: 'Times', align: 'center' },
    { key: 'pctOfGames', label: '% Games', align: 'center', format: pct },
    { key: 'playerWinRate', label: 'Player Win %', align: 'center', format: pct, accent: true },
    { key: 'talismanWinRate', label: 'Talisman Win %', align: 'center', format: pct },
    { key: 'avgDeathsPerGame', label: 'Avg Deaths / Game', align: 'center', format: v => v.toFixed(2) },
    { key: 'topWinningCharacter', label: 'Top Winner', align: 'left', sortable: false },
    { key: 'topDeath', label: 'Top Death', align: 'left', sortable: false },
  ]

  return (
    <StatsTable
      columns={columns}
      rows={rows}
      sort={sort}
      sortKey={sortKey}
      sortDir={sortDir}
      onSort={toggle}
      emptyMessage="No ending data yet."
    />
  )
}

function TotalCard({ label, value }) {
  return (
    <div className="bg-surface border border-gold-dim/15 rounded-xl px-5 py-4 flex-1 min-w-[180px]">
      <p className="text-xs font-body text-muted uppercase tracking-wider">{label}</p>
      <p className="font-display text-3xl text-gold mt-1 tracking-wider">{value}</p>
    </div>
  )
}

function ExpansionsTab({ games }) {
  const dungeonSort = useSort('count', 'desc')
  const dungeonPlayerSort = useSort('count', 'desc')
  const pathTotalsSort = useSort('count', 'desc')
  const pathTotalsPlayerSort = useSort('count', 'desc')
  const pathByPathSort = useSort('count', 'desc')
  const pathPlayerSort = useSort('count', 'desc')
  const pathSort = useSort('count', 'desc')
  const [pathPlayer, setPathPlayer] = useState('')
  const [pathCharacter, setPathCharacter] = useState('')
  const { dungeons, dungeonsByPlayer, paths, pathsTotals, pathsTotalsByPlayer, pathsByPath, pathsByPlayer, totals } = useMemo(
    () => computeExpansionEventStats(games),
    [games],
  )

  const pathPlayerNames = useMemo(() => {
    const set = new Set(pathsByPlayer.map(r => r.playerName))
    return Array.from(set).sort()
  }, [pathsByPlayer])

  const pathCharacterNames = useMemo(() => {
    const set = new Set(paths.map(r => r.character))
    return Array.from(set).sort()
  }, [paths])

  const filteredPathsByPlayer = useMemo(() => {
    if (!pathPlayer) {
      return [...pathsByPlayer].sort((a, b) => b.count - a.count).slice(0, 5)
    }
    return pathsByPlayer.filter(r => r.playerName === pathPlayer)
  }, [pathsByPlayer, pathPlayer])

  const filteredPathsByCharacter = useMemo(() => {
    if (!pathCharacter) {
      return [...paths].sort((a, b) => b.count - a.count).slice(0, 5)
    }
    return paths.filter(r => r.character === pathCharacter)
  }, [paths, pathCharacter])

  const dungeonColumns = [
    { key: 'character', label: 'Character', align: 'left' },
    { key: 'count', label: 'Dungeons Beaten', align: 'center', accent: true },
  ]
  const dungeonPlayerColumns = [
    { key: 'playerName', label: 'Player', align: 'left' },
    { key: 'count', label: 'Dungeons Beaten', align: 'center', accent: true },
  ]
  const pathTotalsColumns = [
    { key: 'character', label: 'Character', align: 'left' },
    { key: 'count', label: 'Paths Completed', align: 'center', accent: true },
  ]
  const pathTotalsPlayerColumns = [
    { key: 'playerName', label: 'Player', align: 'left' },
    { key: 'count', label: 'Paths Completed', align: 'center', accent: true },
  ]
  const pathNameColumn = {
    key: 'path',
    label: 'Path',
    align: 'left',
    format: (name) => (
      <WoodlandPathTooltip name={name}>
        <span className="cursor-default underline decoration-dotted decoration-gold-dim/40 underline-offset-2">{name}</span>
      </WoodlandPathTooltip>
    ),
  }
  const pathByPathColumns = [
    pathNameColumn,
    { key: 'count', label: 'Times Completed', align: 'center', accent: true },
  ]
  const pathColumns = [
    { key: 'character', label: 'Character', align: 'left' },
    pathNameColumn,
    { key: 'count', label: 'Completed', align: 'center', accent: true },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <TotalCard label="Total Dungeons Beaten" value={totals.dungeons} />
        <TotalCard label="Total Woodland Clears" value={totals.paths} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <section className="max-h-[480px] overflow-y-auto">
          <h3 className="font-heading text-lg text-parchment tracking-wide mb-3 sticky top-0 bg-background z-10 pb-1">Dungeons Beaten per Character</h3>
          <StatsTable
            columns={dungeonColumns}
            rows={dungeons}
            sort={dungeonSort.sort}
            sortKey={dungeonSort.sortKey}
            sortDir={dungeonSort.sortDir}
            onSort={dungeonSort.toggle}
            emptyMessage="No dungeons beaten in this filter."
            compact
          />
        </section>
        <section>
          <h3 className="font-heading text-lg text-parchment tracking-wide mb-3">Dungeons Beaten per Player</h3>
          <StatsTable
            columns={dungeonPlayerColumns}
            rows={dungeonsByPlayer}
            sort={dungeonPlayerSort.sort}
            sortKey={dungeonPlayerSort.sortKey}
            sortDir={dungeonPlayerSort.sortDir}
            onSort={dungeonPlayerSort.toggle}
            emptyMessage="No dungeons beaten in this filter."
            compact
          />
        </section>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <section className="max-h-[480px] overflow-y-auto">
          <h3 className="font-heading text-lg text-parchment tracking-wide mb-3 sticky top-0 bg-background z-10 pb-1">Total Paths per Character</h3>
          <StatsTable
            columns={pathTotalsColumns}
            rows={pathsTotals}
            sort={pathTotalsSort.sort}
            sortKey={pathTotalsSort.sortKey}
            sortDir={pathTotalsSort.sortDir}
            onSort={pathTotalsSort.toggle}
            emptyMessage="No paths completed in this filter."
            compact
          />
        </section>
        <section>
          <h3 className="font-heading text-lg text-parchment tracking-wide mb-3">Total Paths per Player</h3>
          <StatsTable
            columns={pathTotalsPlayerColumns}
            rows={pathsTotalsByPlayer}
            sort={pathTotalsPlayerSort.sort}
            sortKey={pathTotalsPlayerSort.sortKey}
            sortDir={pathTotalsPlayerSort.sortDir}
            onSort={pathTotalsPlayerSort.toggle}
            emptyMessage="No paths completed in this filter."
            compact
          />
        </section>
      </div>
      <section>
        <h3 className="font-heading text-lg text-parchment tracking-wide mb-3">Total Paths by Path</h3>
        <StatsTable
          columns={pathByPathColumns}
          rows={pathsByPath}
          sort={pathByPathSort.sort}
          sortKey={pathByPathSort.sortKey}
          sortDir={pathByPathSort.sortDir}
          onSort={pathByPathSort.toggle}
          emptyMessage="No paths completed in this filter."
          compact
        />
      </section>
      <section>
        <h3 className="font-heading text-lg text-parchment tracking-wide mb-3">
          Woodland Paths per Player
        </h3>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-body text-muted uppercase tracking-wider">Player</span>
          <select
            className="input-field text-sm py-1.5 w-auto"
            value={pathPlayer}
            onChange={e => setPathPlayer(e.target.value)}
          >
            <option value="">Top 5</option>
            {pathPlayerNames.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
        <StatsTable
          columns={[
            ...(!pathPlayer ? [{ key: 'playerName', label: 'Player', align: 'left' }] : []),
            pathNameColumn,
            { key: 'count', label: 'Completed', align: 'center', accent: true },
          ]}
          rows={filteredPathsByPlayer}
          sort={pathPlayerSort.sort}
          sortKey={pathPlayerSort.sortKey}
          sortDir={pathPlayerSort.sortDir}
          onSort={pathPlayerSort.toggle}
          emptyMessage="No paths completed by this player."
          compact
        />
      </section>
      <section>
        <h3 className="font-heading text-lg text-parchment tracking-wide mb-3">
          Woodland Paths Breakdown
        </h3>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs font-body text-muted uppercase tracking-wider">Character</span>
          <select
            className="input-field text-sm py-1.5 w-auto"
            value={pathCharacter}
            onChange={e => setPathCharacter(e.target.value)}
          >
            <option value="">Top 5</option>
            {pathCharacterNames.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
        <StatsTable
          columns={pathColumns}
          rows={filteredPathsByCharacter}
          sort={pathSort.sort}
          sortKey={pathSort.sortKey}
          sortDir={pathSort.sortDir}
          onSort={pathSort.toggle}
          emptyMessage="No paths completed by this character."
        />
      </section>
    </div>
  )
}

function DeathsTab({ games }) {
  const deathTypeSort = useSort('count', 'desc')
  const playerFilterSort = useSort('count', 'desc')
  const charFilterSort = useSort('count', 'desc')
  const pvpSort = useSort('count', 'desc')
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const [selectedCharacter, setSelectedCharacter] = useState('')

  const deathTypeRows = useMemo(() => computeDeathTypeStats(games), [games])
  const playerBreakdownRows = useMemo(() => computePlayerDeathBreakdown(games), [games])
  const charBreakdownRows = useMemo(() => computeCharacterDeathBreakdown(games), [games])
  const pvpRows = useMemo(() => computePvpKillLeaderboard(games), [games])

  const totalDeaths = useMemo(
    () => deathTypeRows.reduce((sum, r) => sum + r.count, 0),
    [deathTypeRows],
  )

  const playerNames = useMemo(() => {
    const set = new Set(playerBreakdownRows.map(r => r.playerName))
    return Array.from(set).sort()
  }, [playerBreakdownRows])

  const playerFilteredRows = useMemo(() => {
    const base = selectedPlayer
      ? playerBreakdownRows.filter(r => r.playerName === selectedPlayer)
      : [...playerBreakdownRows].sort((a, b) => b.count - a.count).slice(0, 5)
    const playerTotal = base.reduce((sum, r) => sum + r.count, 0)
    return base.map(r => ({
      ...r,
      pctOfPlayerDeaths: playerTotal > 0 ? r.count / playerTotal : 0,
    }))
  }, [playerBreakdownRows, selectedPlayer])

  const characterNames = useMemo(() => {
    const set = new Set(charBreakdownRows.map(r => r.character))
    return Array.from(set).sort()
  }, [charBreakdownRows])

  const charFilteredRows = useMemo(() => {
    const base = selectedCharacter
      ? charBreakdownRows.filter(r => r.character === selectedCharacter)
      : [...charBreakdownRows].sort((a, b) => b.count - a.count).slice(0, 5)
    const charTotal = base.reduce((sum, r) => sum + r.count, 0)
    return base.map(r => ({
      ...r,
      pctOfCharDeaths: charTotal > 0 ? r.count / charTotal : 0,
    }))
  }, [charBreakdownRows, selectedCharacter])

  const deathTypeColumns = [
    { key: 'deathType', label: 'Death Type', align: 'left' },
    { key: 'count', label: 'Count', align: 'center', accent: true },
    { key: 'pctOfAllDeaths', label: '% of Deaths', align: 'center', format: pct },
  ]

  const pvpColumns = [
    { key: 'killer', label: 'Killer', align: 'left' },
    { key: 'victim', label: 'Victim', align: 'left' },
    { key: 'count', label: 'Kills', align: 'center', accent: true },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <TotalCard label="Total Deaths" value={totalDeaths} />
      </div>
      <section>
        <h3 className="font-heading text-lg text-parchment tracking-wide mb-3">Death Type Breakdown</h3>
        <StatsTable
          columns={deathTypeColumns}
          rows={deathTypeRows}
          sort={deathTypeSort.sort}
          sortKey={deathTypeSort.sortKey}
          sortDir={deathTypeSort.sortDir}
          onSort={deathTypeSort.toggle}
          emptyMessage="No death data yet."
        />
      </section>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <section>
          <h3 className="font-heading text-lg text-parchment tracking-wide mb-3">Character Death Types</h3>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-body text-muted uppercase tracking-wider">Character</span>
            <select
              className="input-field text-sm py-1.5 w-auto"
              value={selectedCharacter}
              onChange={e => setSelectedCharacter(e.target.value)}
            >
              <option value="">Top 5</option>
              {characterNames.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
          <StatsTable
            columns={[
              ...(!selectedCharacter ? [{ key: 'character', label: 'Character', align: 'left' }] : []),
              { key: 'deathType', label: 'Death Type', align: 'left' },
              { key: 'count', label: 'Count', align: 'center', accent: true },
              { key: 'pctOfCharDeaths', label: '% of Deaths', align: 'center', format: pct },
            ]}
            rows={charFilteredRows}
            sort={charFilterSort.sort}
            sortKey={charFilterSort.sortKey}
            sortDir={charFilterSort.sortDir}
            onSort={charFilterSort.toggle}
            emptyMessage="No deaths recorded for this character."
            compact
          />
        </section>
        <section>
          <h3 className="font-heading text-lg text-parchment tracking-wide mb-3">Player Death Types</h3>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-body text-muted uppercase tracking-wider">Player</span>
            <select
              className="input-field text-sm py-1.5 w-auto"
              value={selectedPlayer}
              onChange={e => setSelectedPlayer(e.target.value)}
            >
              <option value="">Top 5</option>
              {playerNames.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
          <StatsTable
            columns={[
              ...(!selectedPlayer ? [{ key: 'playerName', label: 'Player', align: 'left' }] : []),
              { key: 'deathType', label: 'Death Type', align: 'left' },
              { key: 'count', label: 'Count', align: 'center', accent: true },
              { key: 'pctOfPlayerDeaths', label: '% of Deaths', align: 'center', format: pct },
            ]}
            rows={playerFilteredRows}
            sort={playerFilterSort.sort}
            sortKey={playerFilterSort.sortKey}
            sortDir={playerFilterSort.sortDir}
            onSort={playerFilterSort.toggle}
            emptyMessage="No deaths recorded for this player."
            compact
          />
        </section>
      </div>
      <section>
        <h3 className="font-heading text-lg text-parchment tracking-wide mb-3">PVP Kill Leaderboard</h3>
        <StatsTable
          columns={pvpColumns}
          rows={pvpRows}
          sort={pvpSort.sort}
          sortKey={pvpSort.sortKey}
          sortDir={pvpSort.sortDir}
          onSort={pvpSort.toggle}
          emptyMessage="No PVP kills recorded yet."
        />
      </section>
    </div>
  )
}

export default function Stats() {
  const [tab, setTab] = useState('characters')
  const [optionalFilter, setOptionalFilter] = useState('all')
  const { activeGroupId, activeGroup } = useActiveGroup()
  const [scope, setScope] = useState(() => activeGroupId ? 'group' : 'global')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScope(activeGroupId ? 'group' : 'global')
  }, [activeGroupId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOptionalFilter('all')
  }, [scope])

  const groupId = scope === 'group' ? activeGroupId : null
  const { data: rawGames = [], error, isLoading } = useStatsData(groupId)
  const { data: allCharacters = [] } = useCharacters()

  const games = useMemo(
    () => filterGamesByOptionalExpansions(rawGames, optionalFilter),
    [rawGames, optionalFilter],
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 animate-fade-up text-center">
        <h1 className="font-heading text-3xl text-parchment tracking-wide">Stats</h1>
        <div className="ornament-divider mt-3">
          <span className="text-gold-dim">&#9670;</span>
        </div>
        <div className="mt-3 flex justify-center">
          <ScopeToggle value={scope} onChange={setScope} groupName={activeGroup?.name ?? null} />
        </div>
        <p className="text-muted text-sm font-body mt-3">
          {scope === 'group' ? 'Group breakdown of characters, endings, and expansion events.' : 'Global breakdown of characters, endings, and expansion events.'}
        </p>
      </div>

      {/* Optional-expansion filter */}
      <div className="mb-6 flex flex-wrap items-center gap-2 animate-fade-up delay-1">
        <span className="text-xs font-body text-muted uppercase tracking-wider mr-1">Filter</span>
        {OPTIONAL_EXPANSION_FILTERS.map(f => {
          const active = optionalFilter === f.key
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setOptionalFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-body border transition-colors ${
                active
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-gold-dim/20 text-muted hover:border-gold-dim/40'
              }`}
            >
              {f.label}
            </button>
          )
        })}
        <span className="ml-auto text-xs font-body text-muted">
          {games.length} game{games.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Tab nav */}
      <div className="mb-6 flex gap-1 border-b border-gold-dim/20 animate-fade-up delay-2">
        {TABS.map(t => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 font-heading text-sm tracking-wide transition-colors border-b-2 -mb-px ${
                active
                  ? 'text-gold border-gold'
                  : 'text-muted border-transparent hover:text-parchment/80'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {error && (
        <p className="text-danger text-sm font-body mb-4">{error.message}</p>
      )}
      {isLoading && (
        <p className="text-muted text-sm font-body italic">Loading...</p>
      )}

      {!isLoading && (
        <div className="animate-fade-up delay-3">
          {tab === 'characters' && <CharactersTab games={games} allCharacters={allCharacters} />}
          {tab === 'endings' && <EndingsTab games={games} />}
          {tab === 'expansions' && <ExpansionsTab games={games} />}
          {tab === 'deaths' && <DeathsTab games={games} />}
        </div>
      )}
    </div>
  )
}
