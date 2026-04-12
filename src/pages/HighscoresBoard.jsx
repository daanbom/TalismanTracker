import { Link } from 'react-router-dom'
import { useHighscoreRecords } from '../hooks/useHighscoreRecords'

const CATEGORY_ICONS = {
  most_coins: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  most_followers: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  most_objects: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  ),
  most_denizens_on_spot: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
      <line x1="12" y1="22" x2="12" y2="15.5" />
      <polyline points="22 8.5 12 15.5 2 8.5" />
    </svg>
  ),
}

export default function HighscoresBoard() {
  const { data: records = [], error } = useHighscoreRecords()
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fade-up">
        <h1 className="font-heading text-3xl text-parchment tracking-wide">Highscores</h1>
        <div className="ornament-divider mt-3">
          <span className="text-gold-dim">&#9670;</span>
        </div>
        <p className="text-muted text-sm font-body mt-3">All-time per-game records across all sessions.</p>
      </div>

      {error && (
        <p className="text-danger text-sm font-body mb-4">{error.message}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {records.map((record, i) => {
          const empty = record.value == null
          return (
            <div
              key={record.category}
              className={`card-ornate bg-surface border border-gold-dim/15 rounded-xl p-6 animate-fade-up delay-${i + 2}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-gold/50">{CATEGORY_ICONS[record.category]}</div>
                <span className="text-gold font-display text-3xl tracking-wider leading-none">
                  {empty ? '—' : record.value}
                </span>
              </div>
              <h3 className="font-heading text-parchment text-lg tracking-wide mb-2">{record.label}</h3>
              <div className="flex items-center justify-between text-sm font-body">
                <span className="text-gold/80">{record.player ?? 'No record yet'}</span>
                {!empty && (
                  <Link
                    to={`/games/${record.game_id}`}
                    className="text-muted hover:text-teal-light transition-colors"
                  >
                    {new Date(record.game_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty state hint */}
      <div className="mt-12 text-center">
        <div className="ornament-divider mb-6">
          <span className="text-gold-dim text-xs">&#9670;</span>
        </div>
        <p className="text-muted/60 text-sm font-body italic">
          Records update automatically as new games are logged.
        </p>
      </div>
    </div>
  )
}
