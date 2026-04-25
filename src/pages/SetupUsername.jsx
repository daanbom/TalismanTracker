import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { useAuth } from '../hooks/useAuth'

function normalizeUsername(value) {
  return value.trim().toLowerCase()
}

function isValidUsername(value) {
  return /^[a-z0-9_]{3,20}$/.test(value)
}

export default function SetupUsername() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    const normalized = normalizeUsername(username)
    if (!isValidUsername(normalized)) {
      setError('Use 3-20 chars: lowercase letters, numbers, underscores.')
      return
    }

    setSubmitting(true)
    setError(null)

    const { error: upsertError } = await supabase
      .from('user_profiles')
      .upsert({ user_id: user.id, username: normalized }, { onConflict: 'user_id' })

    if (upsertError) {
      if (upsertError.code === '23505') {
        setError('That username is already taken.')
      } else {
        setError(upsertError.message)
      }
      setSubmitting(false)
      return
    }

    await qc.invalidateQueries({ queryKey: ['currentUserProfile', user.id] })
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-deep">
      <div className="max-w-md w-full space-y-6">
        <div className="space-y-2">
          <h1 className="font-display text-3xl text-gold tracking-wider">Choose a username</h1>
          <p className="text-parchment/80 font-body">
            Your username is used for sign-in and group invites.
          </p>
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
              placeholder="your_name"
              className="w-full px-4 py-2 bg-deep-light/60 border border-gold-dim/40 text-parchment rounded focus:outline-none focus:border-gold"
            />
          </label>
          <p className="text-parchment/60 text-xs font-body">
            Allowed: lowercase letters, numbers, underscores.
          </p>
          <button
            type="submit"
            disabled={submitting || !username.trim()}
            className="w-full px-4 py-2 bg-gold text-deep font-heading tracking-wide rounded disabled:opacity-50 hover:bg-gold-light transition-colors"
          >
            {submitting ? 'Saving...' : 'Continue'}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </form>
      </div>
    </div>
  )
}
