import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function normalizeUsername(value) {
  return value.trim().toLowerCase()
}

function isValidUsername(value) {
  return /^[a-z0-9_]{3,20}$/.test(value)
}

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    const normalizedUsername = normalizeUsername(username)
    if (!isValidUsername(normalizedUsername)) {
      setError('Username must be 3-20 chars: lowercase letters or numbers, with optional underscores (no spaces).')
      return
    }

    setStatus('loading')
    setError(null)

    const { data: usernameOwner, error: usernameLookupError } = await supabase.rpc('get_email_for_username', {
      p_username: normalizedUsername,
    })
    if (usernameLookupError) {
      setError(usernameLookupError.message)
      setStatus('idle')
      return
    }
    if (usernameOwner) {
      setError('That username is already taken.')
      setStatus('idle')
      return
    }

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: normalizedUsername },
      },
    })
    if (signUpError) {
      setError(signUpError.message)
      setStatus('idle')
      return
    }

    const newUserId = signUpData?.user?.id
    const hasSession = Boolean(signUpData?.session?.access_token)
    if (!newUserId) {
      navigate('/login', { replace: true })
      return
    }

    if (!hasSession) {
      navigate('/login', { replace: true })
      return
    }

    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({ user_id: newUserId, username: normalizedUsername })

    if (profileError) {
      if (profileError.code === '23505') {
        setError('That username is already taken.')
      } else {
        setError(profileError.message)
      }
      setStatus('idle')
      return
    }

    navigate('/', { replace: true })
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
              minLength={3}
              maxLength={20}
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="yourname"
              className="w-full px-4 py-2 bg-deep-light/60 border border-gold-dim/40 text-parchment rounded focus:outline-none focus:border-gold"
            />
          </label>
          <label className="block">
            <span className="block text-sm text-parchment/80 mb-1 font-heading">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 bg-deep-light/60 border border-gold-dim/40 text-parchment rounded focus:outline-none focus:border-gold"
            />
          </label>
          <label className="block">
            <span className="block text-sm text-parchment/80 mb-1 font-heading">Password</span>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="........"
              className="w-full px-4 py-2 bg-deep-light/60 border border-gold-dim/40 text-parchment rounded focus:outline-none focus:border-gold"
            />
          </label>
          <label className="block">
            <span className="block text-sm text-parchment/80 mb-1 font-heading">Confirm password</span>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="........"
              className="w-full px-4 py-2 bg-deep-light/60 border border-gold-dim/40 text-parchment rounded focus:outline-none focus:border-gold"
            />
          </label>
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full px-4 py-2 bg-gold text-deep font-heading tracking-wide rounded disabled:opacity-50 hover:bg-gold-light transition-colors"
          >
            {status === 'loading' ? 'Creating account...' : 'Create account'}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </form>
        <p className="text-center text-sm text-parchment/60">
          Already have an account?{' '}
          <Link to="/login" className="text-gold hover:text-gold-light transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
