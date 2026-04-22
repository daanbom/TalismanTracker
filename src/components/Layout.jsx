import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import GroupSwitcher from './GroupSwitcher'
import PendingInvitesBanner from './PendingInvitesBanner'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/log', label: 'Log Game' },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/highscores', label: 'Highscores' },
  { to: '/stats', label: 'Stats' },
  { to: '/counters', label: 'Counters' },
  { to: '/history', label: 'History' },
  { to: '/house-rules', label: 'House Rules' },
  { to: '/players', label: 'Players' },
]

function HamburgerIcon({ open }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      {open ? (
        <>
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="6" y1="18" x2="18" y2="6" />
        </>
      ) : (
        <>
          <line x1="3" y1="7" x2="21" y2="7" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="17" x2="21" y2="17" />
        </>
      )}
    </svg>
  )
}

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    setMobileOpen(false)
    await signOut()
  }

  const linkClasses = ({ isActive }) =>
    `font-heading text-sm tracking-wide transition-colors duration-200 ${
      isActive
        ? 'text-gold'
        : 'text-parchment/70 hover:text-gold-light'
    }`

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-deep/90 backdrop-blur-md border-b border-gold-dim/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: group switcher + logo */}
            <div className="flex items-center gap-3">
              {user && <div className="hidden md:block"><GroupSwitcher /></div>}
              <Link to="/" className="flex items-center gap-2.5 text-gold hover:text-gold-light transition-colors">
                <img src="/icons/talisman-logo.png" alt="" className="w-8 h-8" />
                <span className="font-display text-lg tracking-wider hidden sm:block">
                  Talisman Tracker
                </span>
                <span className="font-display text-lg tracking-wider sm:hidden">
                  TT
                </span>
              </Link>
            </div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map(link => (
                <NavLink key={link.to} to={link.to} className={linkClasses} end={link.to === '/'}>
                  {link.label}
                </NavLink>
              ))}
              {user && (
                <button
                  onClick={handleSignOut}
                  className="font-heading text-sm tracking-wide text-parchment/70 hover:text-gold-light transition-colors"
                >
                  Logout
                </button>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-parchment/70 hover:text-gold transition-colors p-1"
              aria-label="Toggle menu"
            >
              <HamburgerIcon open={mobileOpen} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileOpen ? 'max-h-[32rem] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-4 pb-4 pt-1 space-y-1 bg-deep/95 border-t border-gold-dim/10">
            {user && (
              <div className="py-2 px-1 border-b border-gold-dim/10 mb-1">
                <GroupSwitcher onNavigate={() => setMobileOpen(false)} />
              </div>
            )}
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `block py-2.5 px-3 rounded-lg font-heading text-sm tracking-wide transition-colors ${
                    isActive
                      ? 'text-gold bg-gold/5'
                      : 'text-parchment/70 hover:text-gold-light hover:bg-gold/5'
                  }`
                }
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            {user && (
              <button
                onClick={handleSignOut}
                className="block w-full text-left py-2.5 px-3 rounded-lg font-heading text-sm tracking-wide text-parchment/70 hover:text-gold-light hover:bg-gold/5 transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-1 pt-16">
        <PendingInvitesBanner />
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gold-dim/15 bg-deep/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-muted text-sm font-body">
              Talisman Tracker — 4th Edition, All Expansions
            </p>
            <p className="text-muted/50 text-xs font-body">
              For the fellowship, by the fellowship
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
