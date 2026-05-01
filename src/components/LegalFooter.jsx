import { Link } from 'react-router-dom'
import { BUY_ME_A_COFFEE_COPY, BUY_ME_A_COFFEE_URL } from '../lib/supportLinks'

export const LEGAL_DISCLAIMER =
  'Unofficial fan-made tracker. Not affiliated with, endorsed by, or sponsored by Games Workshop, Avalon Hill, Hasbro, Fantasy Flight Games, or Pegasus Spiele.'

export default function LegalFooter({ compact = false, showSupport = false }) {
  return (
    <footer className="border-t border-gold-dim/15 bg-deep/50">
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${compact ? 'py-4' : 'py-6'}`}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-muted text-sm font-body">
              Talisman Tracker - 4th Edition, All Expansions
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link
                to="/legal"
                className="text-xs font-heading tracking-wide text-gold/80 transition-colors hover:text-gold"
              >
                Legal
              </Link>
              <p className="text-muted/50 text-xs font-body">
                For the fellowship, by the fellowship
              </p>
              {showSupport && BUY_ME_A_COFFEE_URL && (
                <a
                  href={BUY_ME_A_COFFEE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-gold-dim/20 px-3 py-1.5 text-xs font-heading tracking-wide text-gold/80 transition-colors hover:border-gold-dim/45 hover:text-gold"
                >
                  {BUY_ME_A_COFFEE_COPY.footerLabel}
                </a>
              )}
            </div>
          </div>
          <p className="max-w-4xl text-xs leading-relaxed text-muted/70 font-body">
            {LEGAL_DISCLAIMER}
          </p>
        </div>
      </div>
    </footer>
  )
}
