import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { useAuth } from '../hooks/useAuth'

export default function Setup() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await supabase
      .from('players')
      .insert({ name: name.trim(), user_id: user.id })
    if (error) {
      setError(error.message)
      setSubmitting(false)
      return
    }
    await qc.invalidateQueries({ queryKey: ['currentPlayer', user.id] })
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-deep">
      <div className="max-w-md w-full space-y-6">
        <div className="space-y-2">
          <h1 className="font-display text-3xl text-gold tracking-wider">Set up your profile</h1>
          <p className="text-parchment/80 font-body">
            Pick a display name to appear on leaderboards and game logs. You can change it later.
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-sm text-parchment/80 mb-1 font-heading">Display name</span>
            <input
              required
              minLength={1}
              maxLength={40}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-deep-light/60 border border-gold-dim/40 text-parchment rounded focus:outline-none focus:border-gold"
            />
          </label>
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="w-full px-4 py-2 bg-gold text-deep font-heading tracking-wide rounded disabled:opacity-50 hover:bg-gold-light transition-colors"
          >
            {submitting ? 'Saving…' : 'Continue'}
          </button>
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </form>
      </div>
    </div>
  )
}
