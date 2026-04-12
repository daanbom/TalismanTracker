import { Link } from 'react-router-dom'
import { useGames } from '../hooks/useGames'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function GameHistory() {
  const { data: games = [], error } = useGames()

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
        <p className="text-muted text-sm font-body mt-3">{games.length} games chronicled</p>
      </div>

      {error && (
        <p className="text-danger text-sm font-body mb-4">{error.message}</p>
      )}

      {games.length === 0 ? (
        <p className="text-muted text-sm font-body italic">No games logged yet.</p>
      ) : (
      <div className="space-y-4">
        {games.map((game, i) => {
          const winners = game.players.filter(p => p.is_winner)
          return (
            <Link
              key={game.id}
              to={`/games/${game.id}`}
              className={`card-ornate block bg-surface border border-gold-dim/15 rounded-xl p-5 hover:border-gold-dim/30 hover:bg-surface/90 transition-all duration-200 group animate-fade-up delay-${i + 1}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <time className="text-sm font-body text-muted">{formatDate(game.date)}</time>
                  <span className="text-gold-dim/40">|</span>
                  <span className="text-sm font-heading text-parchment/80 tracking-wide">{game.ending.name}</span>
                </div>
                <span className="text-xs font-body text-muted group-hover:text-gold/60 transition-colors">
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
