import { useMemo, useState } from 'react'
import { useStatsData } from '../hooks/useStatsData'
import { useCharacters } from '../hooks/useCharacters'
import {
  OPTIONAL_EXPANSION_FILTERS,
  filterGamesByOptionalExpansions,
  computeCharacterStats,
  computeEndingStats,
  computeExpansionEventStats,
  computeDeathTypeStats,
  computePlayerDeathBreakdown,
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

function StatsTable({ columns, rows, sort, sortKey, sortDir, onSort, emptyMessage }) {
  const sorted = sort(rows)
  if (sorted.length === 0) {
    return <p className="text-muted text-sm font-body italic">{emptyMessage}</p>
  }
  return (
    <div className="bg-surface border border-gold-dim/15 rounded-xl overflow-hidden overflow-x-auto">
      <table className="w-full min-w-[640px]">
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
  const { sortKey, sortDir, toggle, sort } = useSort('games', 'desc')

  const rows = useMemo(
    () => computeCharacterStats(games, allCharacters),
    [games, allCharacters],
  )
  const expansions = useMemo(() => {
    const set = new Set(rows.map(r => r.expansion).filter(Boolean))
    return Array.from(set).sort()
  }, [rows])
  const filtered = expansionFilter === 'all'
    ? rows
    : rows.filter(r => r.expansion === expansionFilter)

  const columns = [
    { key: 'character', label: 'Character', align: 'left' },
    { key: 'expansion', label: 'Expansion', align: 'left' },
    { key: 'games', label: 'Games', align: 'center' },
    { key: 'wins', label: 'Wins', align: 'center' },
    { key: 'winRate', label: 'Win %', align: 'center', format: pct, accent: true },
    { key: 'deaths', label: 'Deaths', align: 'center' },
    { key: 'deathRate', label: 'Death %', align: 'center', format: pct },
  ]

  return (
    <div className="space-y-4">
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
        columns={columns}
        rows={filtered}
        sort={sort}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={toggle}
        emptyMessage="No character data yet."
      />
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
    { key: 'topWinningCharacter', label: 'Top Winner', align: 'left', sortable: false },
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
  const pathTotalsSort = useSort('count', 'desc')
  const pathByPathSort = useSort('count', 'desc')
  const pathSort = useSort('count', 'desc')
  const { dungeons, paths, pathsTotals, pathsByPath, totals } = useMemo(
    () => computeExpansionEventStats(games),
    [games],
  )

  const dungeonColumns = [
    { key: 'character', label: 'Character', align: 'left' },
    { key: 'count', label: 'Dungeons Beaten', align: 'center', accent: true },
  ]
  const pathTotalsColumns = [
    { key: 'character', label: 'Character', align: 'left' },
    { key: 'count', label: 'Paths Completed', align: 'center', accent: true },
  ]
  const pathByPathColumns = [
    { key: 'path', label: 'Path', align: 'left' },
    { key: 'count', label: 'Times Completed', align: 'center', accent: true },
  ]
  const pathColumns = [
    { key: 'character', label: 'Character', align: 'left' },
    { key: 'path', label: 'Path', align: 'left' },
    { key: 'count', label: 'Completed', align: 'center', accent: true },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-3">
        <TotalCard label="Total Dungeons Beaten" value={totals.dungeons} />
        <TotalCard label="Total Woodland Clears" value={totals.paths} />
      </div>
      <section>
        <h3 className="font-heading text-lg text-parchment tracking-wide mb-3">Dungeons Beaten</h3>
        <StatsTable
          columns={dungeonColumns}
          rows={dungeons}
          sort={dungeonSort.sort}
          sortKey={dungeonSort.sortKey}
          sortDir={dungeonSort.sortDir}
          onSort={dungeonSort.toggle}
          emptyMessage="No dungeons beaten in this filter."
        />
      </section>
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
        />
      </section>
      <section>
        <h3 className="font-heading text-lg text-parchment tracking-wide mb-3">Total Paths per Character</h3>
        <StatsTable
          columns={pathTotalsColumns}
          rows={pathsTotals}
          sort={pathTotalsSort.sort}
          sortKey={pathTotalsSort.sortKey}
          sortDir={pathTotalsSort.sortDir}
          onSort={pathTotalsSort.toggle}
          emptyMessage="No paths completed in this filter."
        />
      </section>
      <section>
        <h3 className="font-heading text-lg text-parchment tracking-wide mb-3">Woodland Paths Breakdown</h3>
        <StatsTable
          columns={pathColumns}
          rows={paths}
          sort={pathSort.sort}
          sortKey={pathSort.sortKey}
          sortDir={pathSort.sortDir}
          onSort={pathSort.toggle}
          emptyMessage="No paths completed in this filter."
        />
      </section>
    </div>
  )
}

function DeathsTab({ games }) {
  const deathTypeSort = useSort('count', 'desc')
  const playerBreakdownSort = useSort('count', 'desc')
  const pvpSort = useSort('count', 'desc')

  const deathTypeRows = useMemo(() => computeDeathTypeStats(games), [games])
  const playerBreakdownRows = useMemo(() => computePlayerDeathBreakdown(games), [games])
  const pvpRows = useMemo(() => computePvpKillLeaderboard(games), [games])

  const totalDeaths = useMemo(
    () => deathTypeRows.reduce((sum, r) => sum + r.count, 0),
    [deathTypeRows],
  )

  const deathTypeColumns = [
    { key: 'deathType', label: 'Death Type', align: 'left' },
    { key: 'count', label: 'Count', align: 'center', accent: true },
    { key: 'pctOfAllDeaths', label: '% of Deaths', align: 'center', format: pct },
  ]

  const playerBreakdownColumns = [
    { key: 'playerName', label: 'Player', align: 'left' },
    { key: 'deathType', label: 'Death Type', align: 'left' },
    { key: 'count', label: 'Count', align: 'center', accent: true },
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
      <section>
        <h3 className="font-heading text-lg text-parchment tracking-wide mb-3">Deaths per Player</h3>
        <StatsTable
          columns={playerBreakdownColumns}
          rows={playerBreakdownRows}
          sort={playerBreakdownSort.sort}
          sortKey={playerBreakdownSort.sortKey}
          sortDir={playerBreakdownSort.sortDir}
          onSort={playerBreakdownSort.toggle}
          emptyMessage="No death data yet."
        />
      </section>
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
  const { data: rawGames = [], error, isLoading } = useStatsData()
  const { data: allCharacters = [] } = useCharacters()

  const games = useMemo(
    () => filterGamesByOptionalExpansions(rawGames, optionalFilter),
    [rawGames, optionalFilter],
  )

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 animate-fade-up">
        <h1 className="font-heading text-3xl text-parchment tracking-wide">Stats</h1>
        <div className="ornament-divider mt-3">
          <span className="text-gold-dim">&#9670;</span>
        </div>
        <p className="text-muted text-sm font-body mt-3">
          Global breakdown of characters, endings, and expansion events.
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
