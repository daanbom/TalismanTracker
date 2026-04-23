import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGames } from '../hooks/useGames'
import { useActiveGroup } from '../hooks/useActiveGroup'
import { useCurrentPlayer } from '../hooks/useCurrentPlayer'
import GroupRequiredState from '../components/GroupRequiredState'
import ScopeToggle from '../components/ScopeToggle'

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
  const [historyScope, setHistoryScope] = useState({ groupId: activeGroupId ?? null, scope: 'group' })
  const scope = historyScope.groupId === activeGroupId ? historyScope.scope : 'group'
  const participantPlayerId = scope === 'me' ? currentPlayer?.id ?? null : null
  const { data: games = [], error, isLoading } = useGames(activeGroupId ?? undefined, participantPlayerId)

  if (groupsLoading || isLoading || currentPlayerLoading) return null

  if (!activeGroupId) {
    return (
      <GroupRequiredState
        title="Select a group to view game history"
        body="Game history is now scoped to the active group. Pick a group to browse its sessions."
      />
    )
  }

  const visibleGames = scope === 'me' && !currentPlayer ? [] : games
  const summary = scope === 'me'
    ? `You in ${activeGroup?.name ?? 'this group'}: ${visibleGames.length} games chronicled`
    : `${activeGroup?.name ?? 'This group'}: ${visibleGames.length} games chronicled`
  const emptyMessage = scope === 'me'
    ? "You haven't played any games in this group yet."
    : 'No games logged yet.'

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
            onChange={(nextScope) => setHistoryScope({ groupId: activeGroupId ?? null, scope: nextScope })}
            groupName={activeGroup?.name ?? null}
            leftLabel="Me"
            leftValue="me"
          />
        </div>
        <p className="text-muted text-sm font-body mt-3">{summary}</p>
      </div>

      {error && (
        <p className="text-danger text-sm font-body mb-4">{error.message}</p>
      )}

      {visibleGames.length === 0 ? (
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

              {/* Players */}
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

              {/* Bottom row */}
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
    </div>
  )
}
