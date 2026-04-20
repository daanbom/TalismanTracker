import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCurrentPlayer } from '../hooks/useCurrentPlayer'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  const { data: player, isLoading: playerLoading } = useCurrentPlayer()

  if (loading || (user && playerLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center text-parchment bg-deep">
        Loading…
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!player && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />
  }

  if (player && location.pathname === '/setup') {
    return <Navigate to="/" replace />
  }

  return children
}
