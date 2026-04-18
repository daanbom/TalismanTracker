import { Link } from 'react-router-dom'

function ScrollIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 3h11a3 3 0 0 1 3 3v12a3 3 0 0 0 3 3H9a3 3 0 0 1-3-3V3z" />
      <path d="M6 3a3 3 0 0 0-3 3v0a3 3 0 0 0 3 3" />
      <path d="M9 8h8M9 12h8M9 16h5" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H4V4z" />
      <path d="M20 4h-7a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h8V4z" />
      <path d="M7 9h3M7 12h3M14 9h3M14 12h3" />
    </svg>
  )
}

const TILES = [
  {
    to: '/house-rules/rules',
    title: 'The House Rules',
    desc: 'Tweaks and clarifications the fellowship plays by',
    Icon: ScrollIcon,
  },
  {
    to: '/house-rules/rulebooks',
    title: 'Rulebooks',
    desc: 'Official rulebooks for the base game and expansions',
    Icon: BookIcon,
  },
]

export default function HouseRules() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12 animate-fade-up text-center">
        <h1 className="font-display text-4xl sm:text-5xl text-gold tracking-wider">
          House Rules
        </h1>
        <div className="ornament-divider mt-4">
          <span className="text-gold-dim">&#9670;</span>
        </div>
        <p className="text-muted font-body mt-4 max-w-md mx-auto">
          The fellowship's canon and the books that came before it.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 max-w-3xl mx-auto">
        {TILES.map((tile, i) => (
          <Link
            key={tile.to}
            to={tile.to}
            className={`card-ornate group bg-surface border border-gold-dim/15 rounded-xl p-8 sm:p-10 hover:border-gold-dim/40 hover:bg-surface transition-all duration-300 hover:-translate-y-1 animate-fade-up delay-${i + 2} flex flex-col items-center text-center`}
          >
            <div className="text-gold/70 group-hover:text-gold transition-colors mb-5">
              <tile.Icon />
            </div>
            <h2 className="font-heading text-xl sm:text-2xl text-parchment tracking-wide mb-2">
              {tile.title}
            </h2>
            <p className="text-muted text-sm font-body">{tile.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
