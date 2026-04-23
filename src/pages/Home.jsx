import { Link } from 'react-router-dom'
import { useGames } from '../hooks/useGames'
import { useLeaderboardStats } from '../hooks/useLeaderboardStats'

function CornerFlourish({ position }) {
  const cornerClass = {
    tl: 'top-3 left-3',
    tr: 'top-3 right-3 scale-x-[-1]',
    bl: 'bottom-3 left-3 scale-y-[-1]',
    br: 'bottom-3 right-3 scale-[-1]',
  }[position]
  return (
    <svg
      className={`absolute ${cornerClass} w-20 h-20 text-gold-dim/45 pointer-events-none`}
      viewBox="0 0 80 80"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M2 2 L2 30" />
      <path d="M2 2 L30 2" />
      <path d="M2 10 Q 14 14 20 22 Q 26 28 34 28" />
      <path d="M10 2 Q 14 14 22 20 Q 28 26 28 34" />
      <circle cx="30" cy="30" r="2.5" />
      <circle cx="30" cy="30" r="5" opacity="0.4" />
      <path d="M8 8 L16 16" strokeWidth="0.7" />
    </svg>
  )
}

function BoardBackdrop() {
  const mkDivs = (count, r1, r2, key) =>
    Array.from({ length: count }, (_, i) => {
      const a = ((i * 360) / count - 90) * (Math.PI / 180)
      return (
        <line
          key={`${key}-${i}`}
          x1={400 + Math.cos(a) * r1}
          y1={400 + Math.sin(a) * r1}
          x2={400 + Math.cos(a) * r2}
          y2={400 + Math.sin(a) * r2}
        />
      )
    })

  return (
    <svg
      viewBox="0 0 800 800"
      className="hero-board-svg w-[min(120vw,960px)] h-auto"
      aria-hidden
    >
      <defs>
        <radialGradient id="board-fade" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.12" />
          <stop offset="55%" stopColor="#c9a84c" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#c9a84c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="crown-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#dfc070" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#c9a84c" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#c9a84c" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="400" cy="400" r="395" fill="url(#board-fade)" />

      {/* Outer Region — 24 divisions, slow rotation */}
      <g className="board-spin-slow" stroke="#8a7434" fill="none">
        <circle cx="400" cy="400" r="380" strokeWidth="1.2" />
        <circle cx="400" cy="400" r="340" strokeWidth="0.8" />
        <g strokeWidth="0.5" opacity="0.75">{mkDivs(24, 340, 380, 'o')}</g>
        {/* Four cardinal anchors — Village / City / Chapel / Warlock flavor marks */}
        <g strokeWidth="1.4" opacity="0.9">{mkDivs(4, 332, 388, 'oc')}</g>
      </g>

      {/* Middle Region — 16 divisions, static */}
      <g stroke="#8a7434" fill="none" opacity="0.85">
        <circle cx="400" cy="400" r="290" strokeWidth="1" />
        <circle cx="400" cy="400" r="250" strokeWidth="0.7" />
        <g strokeWidth="0.5" opacity="0.7">{mkDivs(16, 250, 290, 'm')}</g>
      </g>

      {/* Portal of Power — dashed transition between middle and outer */}
      <circle
        cx="400"
        cy="400"
        r="315"
        fill="none"
        stroke="#8a7434"
        strokeWidth="0.35"
        strokeDasharray="1 5"
        opacity="0.6"
      />

      {/* Inner Region — Plain of Peril, 8 divisions, reverse spin */}
      <g className="board-spin-rev" stroke="#8a7434" fill="none">
        <circle cx="400" cy="400" r="190" strokeWidth="0.9" />
        <circle cx="400" cy="400" r="150" strokeWidth="0.6" />
        <g strokeWidth="0.45" opacity="0.75">{mkDivs(8, 150, 190, 'i')}</g>
      </g>

      {/* Valley of Fire — inner dashed boundary */}
      <circle
        cx="400"
        cy="400"
        r="220"
        fill="none"
        stroke="#8a7434"
        strokeWidth="0.35"
        strokeDasharray="1 5"
        opacity="0.6"
      />

      {/* Central dais */}
      <circle cx="400" cy="400" r="110" fill="url(#crown-halo)" />
      <circle
        cx="400"
        cy="400"
        r="95"
        fill="none"
        stroke="#c9a84c"
        strokeWidth="0.9"
        opacity="0.75"
      />
      <circle
        cx="400"
        cy="400"
        r="78"
        fill="none"
        stroke="#8a7434"
        strokeWidth="0.4"
        strokeDasharray="2 3"
      />

      {/* Crown of Command at Centre */}
      <g
        transform="translate(400 412)"
        fill="none"
        stroke="#c9a84c"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <path d="M-46 22 L46 22 L42 38 L-42 38 Z" />
        <path d="M-36 30 L36 30" strokeWidth="0.6" opacity="0.7" />
        <path d="M-46 22 L-54 0 L-33 11 L-20 -19 L-7 9 L0 -33 L7 9 L20 -19 L33 11 L54 0 L46 22" />
        <circle cx="-54" cy="0" r="2.8" fill="#c9a84c" />
        <circle cx="-20" cy="-19" r="2.8" fill="#c9a84c" />
        <circle cx="0" cy="-33" r="4" fill="#dfc070" />
        <circle cx="20" cy="-19" r="2.8" fill="#c9a84c" />
        <circle cx="54" cy="0" r="2.8" fill="#c9a84c" />
        <circle cx="-24" cy="30" r="1.9" fill="#c9a84c" />
        <circle cx="0" cy="30" r="2.3" fill="#dfc070" />
        <circle cx="24" cy="30" r="1.9" fill="#c9a84c" />
        <path d="M0 -46 L0 -33 M-5 -40 L5 -40" strokeWidth="1.1" />
      </g>
    </svg>
  )
}

function CrownMedallion() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="hero-medallion-svg w-[min(80vw,560px)] h-auto"
      aria-hidden
    >
      <defs>
        <radialGradient id="medallion-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.18" />
          <stop offset="55%" stopColor="#c9a84c" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#c9a84c" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="195" fill="url(#medallion-glow)" />

      {/* Outer dashed ring (slow spin) */}
      <g className="hero-ring-spin">
        <circle
          cx="200"
          cy="200"
          r="188"
          fill="none"
          stroke="#8a7434"
          strokeWidth="0.8"
          strokeDasharray="2 9"
        />
      </g>

      {/* Inner dashed ring (reverse spin) */}
      <g className="hero-ring-spin-reverse">
        <circle
          cx="200"
          cy="200"
          r="148"
          fill="none"
          stroke="#8a7434"
          strokeWidth="0.5"
          strokeDasharray="1 5"
          opacity="0.7"
        />
      </g>

      {/* Static rings */}
      <g fill="none" stroke="#8a7434" opacity="0.6">
        <circle cx="200" cy="200" r="168" strokeWidth="0.6" />
        <circle cx="200" cy="200" r="115" strokeWidth="0.9" />
        <circle cx="200" cy="200" r="108" strokeWidth="0.3" />
      </g>

      {/* Cardinal marks */}
      <g stroke="#8a7434" fill="none" strokeWidth="0.9" opacity="0.6" strokeLinecap="round">
        <path d="M200 12 L200 48 M192 30 L208 30" />
        <path d="M200 352 L200 388 M192 370 L208 370" />
        <path d="M12 200 L48 200 M30 192 L30 208" />
        <path d="M352 200 L388 200 M370 192 L370 208" />
      </g>

      {/* Diagonal filigree sprigs */}
      <g stroke="#8a7434" fill="none" strokeWidth="0.5" opacity="0.5" strokeLinecap="round">
        <path d="M60 60 Q 80 80 110 95" />
        <path d="M340 60 Q 320 80 290 95" />
        <path d="M60 340 Q 80 320 110 305" />
        <path d="M340 340 Q 320 320 290 305" />
      </g>

      {/* Crown of Command */}
      <g
        transform="translate(200 208)"
        fill="none"
        stroke="#c9a84c"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {/* Band */}
        <path d="M-58 28 L58 28 L52 46 L-52 46 Z" />
        <path d="M-50 36 L50 36" strokeWidth="0.6" opacity="0.7" />
        {/* Spike silhouette */}
        <path d="M-58 28 L-70 0 L-42 14 L-26 -24 L-9 12 L0 -42 L9 12 L26 -24 L42 14 L70 0 L58 28" />
        {/* Jewels on spikes */}
        <circle cx="-70" cy="0" r="3.5" fill="#c9a84c" />
        <circle cx="-26" cy="-24" r="3.5" fill="#c9a84c" />
        <circle cx="0" cy="-42" r="5" fill="#dfc070" />
        <circle cx="26" cy="-24" r="3.5" fill="#c9a84c" />
        <circle cx="70" cy="0" r="3.5" fill="#c9a84c" />
        {/* Band gems */}
        <circle cx="-30" cy="37" r="2.4" fill="#c9a84c" />
        <circle cx="0" cy="37" r="3" fill="#dfc070" />
        <circle cx="30" cy="37" r="2.4" fill="#c9a84c" />
        {/* Cross above central jewel */}
        <path d="M0 -58 L0 -42 M-6 -52 L6 -52" strokeWidth="1.2" />
      </g>
    </svg>
  )
}

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
  const { data: games = [] } = useGames(null)
  const { data: stats = [] } = useLeaderboardStats()
  const gameCount = games.length
  const championCount = stats.filter(s => s.wins > 0).length
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-deep">
        {/* Talisman board — concentric regions with Crown at centre */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <BoardBackdrop />
        </div>
        {/* Radial edge vignette */}
        <div className="hero-vignette absolute inset-0 pointer-events-none" />
        {/* Soft dark halo behind the title for legibility */}
        <div className="hero-title-halo absolute inset-0 pointer-events-none" />
        {/* Corner flourishes */}
        <CornerFlourish position="tl" />
        <CornerFlourish position="tr" />
        <CornerFlourish position="bl" />
        <CornerFlourish position="br" />

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
