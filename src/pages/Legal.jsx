import { Link } from 'react-router-dom'
import LegalFooter, { LEGAL_DISCLAIMER } from '../components/LegalFooter'

export default function Legal() {
  return (
    <div className="min-h-screen flex flex-col bg-deep">
      <header className="border-b border-gold-dim/15 bg-deep/90">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <Link to="/" className="inline-flex items-center gap-2.5 text-gold hover:text-gold-light transition-colors">
            <img src="/icons/talisman-logo.png" alt="" className="w-8 h-8" />
            <span className="font-display text-lg tracking-wider">Talisman Tracker</span>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-3xl space-y-8">
            <div className="space-y-3">
              <p className="font-heading text-sm tracking-[0.18em] uppercase text-gold-dim">
                Legal notice
              </p>
              <h1 className="font-display text-3xl sm:text-4xl text-gold tracking-wide">
                Unofficial fan project
              </h1>
              <p className="text-parchment/80 leading-relaxed">
                {LEGAL_DISCLAIMER}
              </p>
            </div>

            <section className="space-y-3">
              <h2 className="font-heading text-xl text-gold-light">Purpose</h2>
              <p className="text-parchment/75 leading-relaxed">
                This site is a non-commercial game logging and statistics tracker for players who already own and play the game. It is intended for recording private group sessions, player results, house rules, and table history.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl text-gold-light">Ownership</h2>
              <p className="text-parchment/75 leading-relaxed">
                Talisman, related names, logos, characters, settings, artwork, rulebooks, and other game materials belong to their respective rights holders. This site does not claim ownership of those materials and does not claim official status.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl text-gold-light">External Materials</h2>
              <p className="text-parchment/75 leading-relaxed">
                References to game names, character names, expansions, and rule materials are used to identify table activity and help players record their own games. Any external links are provided as references only; rights remain with the original owners and publishers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-heading text-xl text-gold-light">Takedown Requests</h2>
              <p className="text-parchment/75 leading-relaxed">
                If you are a rights holder and believe content on this site should be removed or changed, contact{' '}
                <a href="mailto:dadaanbom@gmail.com" className="text-gold hover:text-gold-light transition-colors">
                  dadaanbom@gmail.com
                </a>{' '}
                with the affected URL and a short description of the issue. Requests will be reviewed and handled in good faith.
              </p>
            </section>
          </div>
        </section>
      </main>

      <LegalFooter compact />
    </div>
  )
}
