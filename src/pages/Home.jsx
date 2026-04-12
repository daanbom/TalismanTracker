import { Link } from 'react-router-dom'
import heroImg from '../assets/hero.png'
import { useGames } from '../hooks/useGames'
import { useLeaderboardStats } from '../hooks/useLeaderboardStats'

const QUICK_LINKS = [
  {
    to: '/log',
    title: 'Log a Game',
    desc: 'Record your latest conquest',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
    ),
  },
  {
    to: '/leaderboard',
    title: 'Leaderboard',
    desc: 'Who reigns supreme',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 20h20" />
        <path d="M4 17l2-12 4 5 2-6 2 6 4-5 2 12" />
      </svg>
    ),
  },
  {
    to: '/highscores',
    title: 'Highscores',
    desc: 'All-time records',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    to: '/history',
    title: 'Game History',
    desc: 'The chronicles',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <line x1="8" y1="7" x2="16" y2="7" />
        <line x1="8" y1="11" x2="13" y2="11" />
      </svg>
    ),
  },
]

export default function Home() {
  const { data: games = [] } = useGames()
  const { data: stats = [] } = useLeaderboardStats()
  const gameCount = games.length
  const championCount = stats.filter(s => s.wins > 0).length
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImg})` }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-base via-base/70 to-base/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-deep/60 via-transparent to-transparent" />
        {/* Vignette */}
        <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 150px 50px rgba(15, 15, 26, 0.8)' }} />

        {/* Content */}
        <div className="relative z-10 text-center px-4 py-20">
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl text-gold animate-glow animate-fade-up tracking-wider">
            Talisman Tracker
          </h1>
          <div className="ornament-divider max-w-md mx-auto mt-6 mb-4 animate-fade-up delay-2">
            <span className="text-gold-dim text-sm tracking-[0.3em] font-heading uppercase">
              Chronicle of Conquests
            </span>
          </div>
          <p className="text-parchment/60 font-body text-lg max-w-lg mx-auto animate-fade-up delay-3">
            Track your games, chart your victories, and settle the eternal
            debate of who truly rules the realm.
          </p>
          <Link
            to="/log"
            className="btn-gold mt-8 inline-flex text-base px-8 py-3.5 animate-fade-up delay-4"
          >
            Log a Game
          </Link>
        </div>
      </section>

      {/* Quick Links */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUICK_LINKS.map((link, i) => (
            <Link
              key={link.to}
              to={link.to}
              className={`card-ornate group block bg-surface/80 backdrop-blur-sm border border-gold-dim/15 rounded-xl p-6 hover:border-gold-dim/40 hover:bg-surface transition-all duration-300 hover:-translate-y-1 animate-fade-up delay-${i + 4}`}
            >
              <div className="text-gold/70 group-hover:text-gold transition-colors mb-4">
                {link.icon}
              </div>
              <h3 className="font-heading text-parchment text-base tracking-wide mb-1.5">
                {link.title}
              </h3>
              <p className="text-muted text-sm font-body">{link.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent activity teaser */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="ornament-divider mb-10">
          <span className="text-gold-dim">&#9670;</span>
        </div>
        <div className="text-center">
          <h2 className="font-heading text-2xl text-parchment tracking-wide mb-3">
            The Realm Awaits
          </h2>
          <p className="text-muted font-body max-w-md mx-auto mb-8">
            {gameCount} game{gameCount !== 1 ? 's' : ''} logged. {championCount} champion{championCount !== 1 ? 's' : ''} crowned. Who will be next to
            claim the Crown of Command?
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/leaderboard" className="btn-outline text-sm">
              View Leaderboard
            </Link>
            <Link to="/history" className="btn-outline text-sm">
              Game History
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
