import { useParams, Link } from 'react-router-dom'
import { MOCK_GAMES } from '../lib/mockData'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

const CATEGORY_LABELS = {
  most_coins: 'Most Coins',
  most_followers: 'Most Followers',
  most_objects: 'Most Objects',
  most_denizens_on_spot: 'Most Denizens on Spot',
}

const EVENT_LABELS = {
  path_completed: 'Path Completed',
  dungeon_beaten: 'Dungeon Beaten',
}

export default function GameDetail() {
  const { id } = useParams()
  const game = MOCK_GAMES.find(g => g.id === id) || MOCK_GAMES[0]
  const winner = game.players.find(p => p.is_winner)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link to="/history" className="text-muted text-sm font-body hover:text-gold/60 transition-colors mb-2 inline-block">
              &larr; Back to History
            </Link>
            <h1 className="font-heading text-3xl text-parchment tracking-wide">Game Detail</h1>
          </div>
          <Link to={`/games/${game.id}/edit`} className="btn-outline text-sm mt-6">
            Edit Game
          </Link>
        </div>
        <div className="ornament-divider mt-3">
          <span className="text-gold-dim">&#9670;</span>
        </div>
      </div>

      {/* Game info card */}
      <div className="bg-surface border border-gold-dim/15 rounded-xl p-6 mb-6 animate-fade-up delay-1">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span className="text-muted text-xs font-body uppercase tracking-wider">Date</span>
            <p className="text-parchment font-body mt-1">{formatDate(game.date)}</p>
          </div>
          <div>
            <span className="text-muted text-xs font-body uppercase tracking-wider">Ending</span>
            <p className="text-parchment font-heading tracking-wide mt-1">{game.ending.name}</p>
          </div>
          <div>
            <span className="text-muted text-xs font-body uppercase tracking-wider">Winner</span>
            <p className="text-gold font-heading tracking-wide mt-1">
              {winner?.player.name}
              <span className="text-gold/50 font-body text-sm ml-1">as {winner?.winning_character}</span>
            </p>
          </div>
        </div>
        {game.notes && (
          <div className="mt-4 pt-4 border-t border-gold-dim/10">
            <span className="text-muted text-xs font-body uppercase tracking-wider">Notes</span>
            <p className="text-parchment/70 font-body mt-1 italic">{game.notes}</p>
          </div>
        )}
      </div>

      {/* Participants */}
      <div className="mb-6 animate-fade-up delay-2">
        <h2 className="font-heading text-xl text-gold tracking-wide mb-4">Participants</h2>
        <div className="space-y-3">
          {game.players.map(gp => (
            <div
              key={gp.player.id}
              className={`bg-surface border rounded-xl p-5 ${
                gp.is_winner ? 'border-gold/30' : 'border-gold-dim/15'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className={`font-heading tracking-wide ${gp.is_winner ? 'text-gold text-lg' : 'text-parchment'}`}>
                    {gp.player.name}
                  </h3>
                  {gp.is_winner && (
                    <span className="px-2 py-0.5 bg-gold/15 border border-gold/30 rounded-full text-gold text-xs font-heading tracking-wider">
                      WINNER
                    </span>
                  )}
                </div>
                <span className="text-muted text-sm font-body">
                  {gp.total_deaths} death{gp.total_deaths !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {gp.characters_played.map((char, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5">
                    {idx > 0 && <span className="text-gold-dim/40 text-xs">&rarr;</span>}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-body border ${
                        gp.is_winner && char === gp.winning_character
                          ? 'border-gold/30 bg-gold/10 text-gold'
                          : 'border-gold-dim/15 bg-elevated/50 text-parchment/60'
                      }`}
                    >
                      {char}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Highscores */}
      {game.highscores.length > 0 && (
        <div className="mb-6 animate-fade-up delay-3">
          <h2 className="font-heading text-xl text-gold tracking-wide mb-4">Game Highscores</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {game.highscores.map(hs => (
              <div key={hs.category} className="bg-surface border border-gold-dim/15 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-heading text-parchment/80 tracking-wide">
                    {CATEGORY_LABELS[hs.category] || hs.category}
                  </p>
                  <p className="text-gold/70 text-sm font-body mt-0.5">{hs.player.name}</p>
                </div>
                <span className="text-gold font-display text-2xl">{hs.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expansion Events */}
      {game.expansion_events.length > 0 && (
        <div className="animate-fade-up delay-4">
          <h2 className="font-heading text-xl text-gold tracking-wide mb-4">Expansion Events</h2>
          <div className="space-y-3">
            {game.expansion_events.map((event, idx) => (
              <div key={idx} className="bg-surface border border-gold-dim/15 rounded-xl p-4 flex items-center gap-4">
                <span className="px-2.5 py-1 bg-teal/10 border border-teal/20 rounded-lg text-teal-light text-xs font-heading tracking-wider uppercase">
                  {event.expansion}
                </span>
                <div>
                  <p className="text-sm font-body text-parchment/80">
                    {EVENT_LABELS[event.event_type] || event.event_type}
                  </p>
                  {event.detail && (
                    <p className="text-muted text-xs font-body mt-0.5">{event.detail}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
