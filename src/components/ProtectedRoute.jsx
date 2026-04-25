import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCurrentPlayer } from '../hooks/useCurrentPlayer'
import { useCurrentUserProfile } from '../hooks/useCurrentUserProfile'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const { data: player, isLoading: playerLoading } = useCurrentPlayer()
  const { data: profile, isLoading: profileLoading } = useCurrentUserProfile()

  if (loading || (user && (playerLoading || profileLoading))) {
    return (
      <div className="min-h-screen flex items-center justify-center text-parchment bg-deep">
        Loading...
      </div>
    )
  }

  if (!user) {
    const next = location.pathname + location.search
    const qs = next && next !== '/' ? `?next=${encodeURIComponent(next)}` : ''
    return <Navigate to={`/login${qs}`} replace />
  }

  if (!player && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />
  }

  if (player && location.pathname === '/setup') {
    if (!profile) return <Navigate to="/setup-username" replace />
    return <Navigate to="/" replace />
  }

  if (player && !profile && location.pathname !== '/setup-username') {
    return <Navigate to="/setup-username" replace />
  }

  if (player && profile && location.pathname === '/setup-username') {
    return <Navigate to="/" replace />
  }

  return children
}
