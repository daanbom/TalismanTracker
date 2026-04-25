import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { sanitizeNext } from '../utils/redirect'

function normalizeUsername(value) {
  return value.trim().toLowerCase()
}

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const next = sanitizeNext(searchParams.get('next'))

  const onSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    setError(null)

    const normalizedUsername = normalizeUsername(username)

    const { data: email, error: resolveError } = await supabase
      .rpc('get_email_for_username', { p_username: normalizedUsername })

    if (resolveError || !email) {
      setError('Invalid username or password.')
      setStatus('idle')
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError('Invalid username or password.')
      setStatus('idle')
      return
    }

    navigate(next, { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-deep">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <img src="/icons/talisman-logo.png" alt="" className="w-16 h-16 mx-auto" />
          <h1 className="font-display text-3xl text-gold tracking-wider">Talisman Tracker</h1>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-sm text-parchment/80 mb-1 font-heading">Username</span>
            <input
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your_name"
              className="w-full px-4 py-2 bg-deep-light/60 border border-gold-dim/40 text-parchment rounded focus:outline-none focus:border-gold"
            />
          </label>
          <label className="block">
            <span className="block text-sm text-parchment/80 mb-1 font-heading">Password</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="........"
              className="w-full px-4 py-2 bg-deep-light/60 border border-gold-dim/40 text-parchment rounded focus:outline-none focus:border-gold"
            />
          </label>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full px-4 py-2 bg-gold text-deep font-heading tracking-wide rounded disabled:opacity-50 hover:bg-gold-light transition-colors"
          >
            {status === 'loading' ? 'Signing in...' : 'Sign in'}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </form>
        <p className="text-center text-sm text-parchment/60">
          No account?{' '}
          <Link to="/register" className="text-gold hover:text-gold-light transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
