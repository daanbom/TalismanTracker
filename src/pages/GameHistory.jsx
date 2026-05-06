import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useActiveGroup } from '../hooks/useActiveGroup'
import { useCurrentPlayer } from '../hooks/useCurrentPlayer'
import { useGameHistory } from '../hooks/useGameHistory'
import { usePlayers } from '../hooks/usePlayers'
import { useEndings } from '../hooks/useEndings'
import GroupRequiredState from '../components/GroupRequiredState'
import ScopeToggle from '../components/ScopeToggle'

const PAGE_SIZE = 20

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value ?? '', 10)
  if (!Number.isFinite(parsed) || parsed < 1) return fallback
  return parsed
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function GameHistory() {
  const { activeGroupId, activeGroup, isLoading: groupsLoading } = useActiveGroup()
  const { data: currentPlayer, isLoading: currentPlayerLoading } = useCurrentPlayer()
  const { data: players = [], error: playersError } = usePlayers()
  const { data: endings = [], error: endingsError } = useEndings()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filtersOpen, setFiltersOpen] = useState(false)

  const scope = searchParams.get('scope') === 'me' ? 'me' : 'group'
  const participantPlayerId = scope === 'me' ? currentPlayer?.id ?? null : null
  const selectedPlayerId = searchParams.get('player') || null
  const selectedEndingId = searchParams.get('ending') || null
  const winnerTypeParam = searchParams.get('winner')
  const winnerType = ['all', 'player', 'talisman'].includes(winnerTypeParam) ? winnerTypeParam : 'all'
  const searchText = searchParams.get('q') ?? ''
  const dateFrom = searchParams.get('from') || null
  const dateTo = searchParams.get('to') || null
  const page = parsePositiveInt(searchParams.get('page'), 1)

  const canQueryHistory = Boolean(activeGroupId) && (scope !== 'me' || Boolean(currentPlayer?.id))

  const {
    data: historyData,
    error: historyError,
    isLoading: historyLoading,
  } = useGameHistory({
    groupId: canQueryHistory ? activeGroupId : null,
    participantPlayerId,
    search: searchText,
    playerId: selectedPlayerId,
    endingId: selectedEndingId,
    winnerType,
    dateFrom,
    dateTo,
    page,
    pageSize: PAGE_SIZE,
  })

  const visibleGames = historyData?.games ?? []
  const totalMatches = historyData?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalMatches / PAGE_SIZE))
  const activeFilterCount = [
    Boolean(searchText.trim()),
    Boolean(selectedPlayerId),
    Boolean(selectedEndingId),
    winnerType !== 'all',
    Boolean(dateFrom),
    Boolean(dateTo),
  ].filter(Boolean).length

  useEffect(() => {
    if (historyLoading) return
    if (page <= totalPages) return
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (totalPages <= 1) next.delete('page')
      else next.set('page', String(totalPages))
      return next
    }, { replace: true })
  }, [historyLoading, page, setSearchParams, totalPages])

  const setParam = (key, value, { resetPage = true } = {}) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value === null || value === undefined || value === '') next.delete(key)
      else next.set(key, value)
      if (resetPage) next.delete('page')
      return next
    }, { replace: true })
  }

  const clearFilters = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('q')
      next.delete('player')
      next.delete('ending')
      next.delete('winner')
      next.delete('from')
      next.delete('to')
      next.delete('page')
      return next
    }, { replace: true })
  }

  const handlePageChange = (nextPage) => {
    if (nextPage <= 1) setParam('page', '', { resetPage: false })
    else setParam('page', String(nextPage), { resetPage: false })
  }

  if (groupsLoading || currentPlayerLoading) return null

  if (!activeGroupId) {
    return (
      <GroupRequiredState
        title="Select a group to view game history"
        body="Game history is scoped to the active group. Pick a group to browse its sessions."
      />
    )
  }

  const summary = scope === 'me'
    ? `You in ${activeGroup?.name ?? 'this group'}: ${totalMatches} matching game${totalMatches !== 1 ? 's' : ''}`
    : `${activeGroup?.name ?? 'This group'}: ${totalMatches} matching game${totalMatches !== 1 ? 's' : ''}`
  const emptyMessage = scope === 'me'
    ? "You haven't played any matching games in this group yet."
    : 'No games match this filter yet.'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl text-parchment tracking-wide">Game History</h1>
          <Link to="/log" className="btn-gold text-sm">
            Log a Game
          </Link>
        </div>
        <div className="ornament-divider mt-3">
          <span className="text-gold-dim">&#9670;</span>
        </div>
        <div className="mt-3">
          <ScopeToggle
            value={scope}
            onChange={(nextScope) => setParam('scope', nextScope === 'group' ? '' : nextScope)}
            groupName={activeGroup?.name ?? null}
            leftLabel="Me"
            leftValue="me"
          />
        </div>
        <p className="text-muted text-sm font-body mt-3">{summary}</p>
      </div>

      <div className="card-ornate bg-surface border border-gold-dim/15 rounded-xl p-4 mb-6 animate-fade-up delay-1">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            className="btn-outline text-xs"
            aria-expanded={filtersOpen}
            aria-controls="history-filters-panel"
            onClick={() => setFiltersOpen((open) => !open)}
          >
            {filtersOpen ? 'Hide Filters' : 'Show Filters'}
          </button>
          <p className="text-muted text-xs font-body">
            {activeFilterCount} active filter{activeFilterCount !== 1 ? 's' : ''} · Page {Math.min(page, totalPages)} of {totalPages}
          </p>
        </div>

        {filtersOpen && (
          <div id="history-filters-panel" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-body text-muted uppercase tracking-wider mb-1">Search title or notes</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Search game title or notes"
                  value={searchText}
                  onChange={(e) => setParam('q', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-body text-muted uppercase tracking-wider mb-1">Player</label>
                <select
                  className="input-field"
                  value={selectedPlayerId ?? ''}
                  onChange={(e) => setParam('player', e.target.value)}
                >
                  <option value="">All players</option>
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>{player.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-body text-muted uppercase tracking-wider mb-1">Ending</label>
                <select
                  className="input-field"
                  value={selectedEndingId ?? ''}
                  onChange={(e) => setParam('ending', e.target.value)}
                >
                  <option value="">All endings</option>
                  {endings.map((ending) => (
                    <option key={ending.id} value={ending.id}>{ending.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-body text-muted uppercase tracking-wider mb-1">Winner Type</label>
                <select
                  className="input-field"
                  value={winnerType}
                  onChange={(e) => setParam('winner', e.target.value === 'all' ? '' : e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="player">Player Winner</option>
                  <option value="talisman">Talisman Wins</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-body text-muted uppercase tracking-wider mb-1">Date From</label>
                <input
                  type="date"
                  className="input-field"
                  value={dateFrom ?? ''}
                  onChange={(e) => setParam('from', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-body text-muted uppercase tracking-wider mb-1">Date To</label>
                <input
                  type="date"
                  className="input-field"
                  value={dateTo ?? ''}
                  onChange={(e) => setParam('to', e.target.value)}
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-end">
              <button type="button" className="btn-outline text-xs" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {(historyError || playersError || endingsError) && (
        <p className="text-danger text-sm font-body mb-4">
          {(historyError || playersError || endingsError)?.message}
        </p>
      )}

      {historyLoading ? (
        <p className="text-muted text-sm font-body italic">Loading...</p>
      ) : visibleGames.length === 0 ? (
        <p className="text-muted text-sm font-body italic">{emptyMessage}</p>
      ) : (
      <div className="space-y-4">
        {visibleGames.map((game, i) => {
          const winners = game.players.filter(p => p.is_winner)
          return (
            <Link
              key={game.id}
              to={`/games/${game.id}`}
              className={`card-ornate block bg-surface border border-gold-dim/15 rounded-xl p-5 hover:border-gold-dim/30 hover:bg-surface/90 transition-all duration-200 group animate-fade-up delay-${i + 1}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h2 className="font-heading text-lg text-parchment tracking-wide truncate">{game.title}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <time className="text-xs font-body text-muted">{formatDate(game.date)}</time>
                    <span className="text-gold-dim/40">|</span>
                    <span className="text-xs font-heading text-parchment/70 tracking-wide">{game.ending.name}</span>
                  </div>
                </div>
                <span className="text-xs font-body text-muted group-hover:text-gold/60 transition-colors shrink-0">
                  View details &rarr;
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {game.players.map(gp => (
                  <span
                    key={gp.player.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-body border ${
                      gp.is_winner
                        ? 'border-gold/40 bg-gold/10 text-gold'
                        : 'border-gold-dim/15 bg-elevated/50 text-parchment/60'
                    }`}
                  >
                    {gp.is_winner && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                        <path d="M2 20h20M4 17l2-12 4 5 2-6 2 6 4-5 2 12" />
                      </svg>
                    )}
                    {gp.player.name}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 text-xs font-body text-muted">
                <span>{game.players.length} players</span>
                <span className="text-gold-dim/30">&#183;</span>
                {winners.length === 0 ? (
                  <span>
                    Winner: <span className="text-gold/70">Talisman</span>
                  </span>
                ) : (
                  <span>
                    Winner{winners.length > 1 ? 's' : ''}:{' '}
                    <span className="text-gold/70">
                      {winners.map(w => w.player.name).join(', ')}
                    </span>
                  </span>
                )}
                {game.expansion_events.length > 0 && (
                  <>
                    <span className="text-gold-dim/30">&#183;</span>
                    <span>{game.expansion_events.length} expansion event{game.expansion_events.length > 1 ? 's' : ''}</span>
                  </>
                )}
              </div>

              {game.notes && (
                <p className="mt-2 text-sm font-body text-parchment/40 italic line-clamp-1">{game.notes}</p>
              )}
            </Link>
          )
        })}
      </div>
      )}

      {!historyLoading && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between gap-3 animate-fade-up delay-2">
          <button
            type="button"
            className="btn-outline text-sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
          >
            Previous
          </button>
          <p className="text-muted text-sm font-body">
            Page {Math.min(page, totalPages)} of {totalPages}
          </p>
          <button
            type="button"
            className="btn-outline text-sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
