import { Link } from 'react-router-dom'
import { RULEBOOKS } from '../data/houseRules'

const ICON_PATHS = {
  tower: (
    <>
      <path d="M4 21V10l2-2V5h2v1h2V5h4v1h2V5h2v3l2 2v11" />
      <path d="M4 21h16" />
      <path d="M10 21v-5h4v5" />
      <path d="M8 13h2M14 13h2" />
    </>
  ),
  dragon: (
    <>
      <path d="M3 13c0-3 2-5 5-5h3l2-3 2 3c3 0 6 2 6 5 0 2-1 3-2 4l-2 1-1 3-3-2H9l-3 2-1-3-1-1c-1-1-1-2-1-4z" />
      <circle cx="15" cy="12" r="0.7" fill="currentColor" />
    </>
  ),
  tree: (
    <>
      <path d="M12 3l5 7h-3l4 6h-4l3 4H7l3-4H6l4-6H7l5-7z" />
      <path d="M12 20v2" />
    </>
  ),
  city: (
    <>
      <path d="M3 21V11l4-2v4l4-3v5l4-2v6" />
      <path d="M15 21V8l3-3 3 3v13" />
      <path d="M3 21h18" />
      <path d="M6 14v1M6 17v1M10 15v1M10 18v1M14 13v1M14 16v1M14 19v1M18 10v1M18 14v1M18 18v1" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="12" r="4" />
      <path d="M12 12h9" />
      <path d="M17 12v3" />
      <path d="M20 12v2" />
    </>
  ),
  scythe: (
    <>
      <path d="M4 4c8 0 14 4 16 10" />
      <path d="M4 4l16 16" />
      <path d="M8 8c4 0 8 2 10 6" />
    </>
  ),
  snowflake: (
    <>
      <path d="M12 2v20" />
      <path d="M4.5 6.5l15 11" />
      <path d="M4.5 17.5l15-11" />
      <path d="M9 3l3 2 3-2" />
      <path d="M9 21l3-2 3 2" />
      <path d="M3 9l2 3-2 3" />
      <path d="M21 9l-2 3 2 3" />
    </>
  ),
  horn: (
    <>
      <path d="M4 10c4-6 12-6 16 0l-3 2c-3-3-7-3-10 0l-3-2z" />
      <path d="M4 10v4c0 2 2 4 4 4h8c2 0 4-2 4-4v-4" />
      <path d="M8 18v3M16 18v3" />
    </>
  ),
  flame: (
    <>
      <path d="M12 2c0 4-4 5-4 10a4 4 0 0 0 8 0c0-2-1-3-1-5 2 1 3 3 3 5a6 6 0 0 1-12 0c0-5 6-6 6-10z" />
    </>
  ),
  crack: (
    <>
      <path d="M13 2l-3 6 4 2-5 5 3 2-4 5" />
      <path d="M3 21h18" />
      <path d="M4 18l3-1M17 17l3 1M19 13l-2-1" />
    </>
  ),
  droplet: (
    <>
      <path d="M12 2s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12z" />
      <path d="M8 14a4 4 0 0 0 4 4" />
    </>
  ),
  moon: (
    <>
      <path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z" />
      <circle cx="14" cy="9" r="0.5" fill="currentColor" />
      <circle cx="11" cy="14" r="0.5" fill="currentColor" />
      <circle cx="16" cy="13" r="0.5" fill="currentColor" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9l-2 5-5 2 2-5 5-2z" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
    </>
  ),
}

function RulebookIcon({ name, size = 32 }) {
  const paths = ICON_PATHS[name] || ICON_PATHS.tower
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths}
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </svg>
  )
}

const GROUPS = [
  { key: 'core', title: 'Core Rulebook' },
  { key: 'corner', title: 'Corner Expansions' },
  { key: 'small', title: 'Small Box Expansions' },
]

function RulebookCard({ book, featured = false }) {
  const typeLabel = book.type === 'web' ? 'WEB' : 'PDF'

  return (
    <a
      href={book.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`card-ornate group relative bg-surface border border-gold-dim/15 rounded-xl hover:border-gold-dim/40 hover:bg-surface transition-all duration-300 hover:-translate-y-1 flex flex-col ${
        featured ? 'p-6 sm:p-8' : 'p-5'
      }`}
    >
      <div
        className={`text-gold/70 group-hover:text-gold transition-colors ${
          featured ? 'mb-4' : 'mb-3'
        }`}
      >
        <RulebookIcon name={book.icon} size={featured ? 44 : 32} />
      </div>

      <div className="flex-1">
        <h3
          className={`font-heading text-parchment tracking-wide mb-1.5 ${
            featured ? 'text-xl sm:text-2xl' : 'text-base'
          }`}
        >
          {book.name}
        </h3>
        <p
          className={`font-body ${
            featured
              ? 'text-base text-parchment/90'
              : 'text-xs sm:text-sm text-muted'
          }`}
        >
          {book.subtitle}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 mt-4 border-t border-gold-dim/10">
        <span
          className={`text-[10px] font-heading tracking-[0.2em] uppercase px-2 py-0.5 rounded border ${
            book.type === 'web'
              ? 'text-gold-light/80 border-gold-dim/30 bg-gold-dim/5'
              : 'text-gold-dim border-gold-dim/25'
          }`}
        >
          {typeLabel}
        </span>
        <span className="text-muted group-hover:text-gold-light transition-colors">
          <ExternalIcon />
        </span>
      </div>
    </a>
  )
}

export default function Rulebooks() {
  const grouped = GROUPS.map((g) => ({
    ...g,
    books: RULEBOOKS.filter((b) => b.group === g.key),
  }))

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fade-up">
        <Link
          to="/house-rules"
          className="text-muted hover:text-gold-light font-body text-sm inline-flex items-center gap-1.5 mb-6 transition-colors"
        >
          <span aria-hidden>&larr;</span> Back to House Rules
        </Link>
        <div className="text-center">
          <h1 className="font-heading text-3xl text-parchment tracking-wide">
            Rulebooks
          </h1>
          <div className="ornament-divider mt-3">
            <span className="text-gold-dim">&#9670;</span>
          </div>
          <p className="text-muted text-sm font-body mt-3">
            The official rulebooks for the base game and every expansion.
          </p>
        </div>
      </div>

      {grouped.map((group, idx) => (
        <section
          key={group.key}
          className={`animate-fade-up delay-${idx + 1} ${
            idx === grouped.length - 1 ? '' : 'mb-12'
          }`}
        >
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="font-heading text-xl text-gold tracking-wide">
              {group.title}
            </h2>
            <span className="text-muted text-xs font-body">
              {group.books.length} book{group.books.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="h-px bg-gradient-to-r from-gold-dim/40 via-gold-dim/10 to-transparent mb-5" />

          <div
            className={`grid gap-4 ${
              group.key === 'core'
                ? 'grid-cols-1 max-w-xl mx-auto'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            }`}
          >
            {group.books.map((book) => (
              <RulebookCard
                key={book.slug}
                book={book}
                featured={group.key === 'core'}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
