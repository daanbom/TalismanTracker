import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    setStatus('sending')
    setError(null)
    const redirectUrl = `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectUrl },
    })
    if (error) {
      setError(error.message)
      setStatus('idle')
    } else {
      setStatus('sent')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-deep">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <img src="/icons/talisman-logo.png" alt="" className="w-16 h-16 mx-auto" />
          <h1 className="font-display text-3xl text-gold tracking-wider">Talisman Tracker</h1>
        </div>
        {status === 'sent' ? (
          <div className="text-center space-y-2">
            <p className="text-parchment font-heading">Check your email.</p>
            <p className="text-parchment/70 text-sm">
              We sent a magic link to <span className="text-gold">{email}</span>. Click it to sign in.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="block text-sm text-parchment/80 mb-1 font-heading">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 bg-deep-light/60 border border-gold-dim/40 text-parchment rounded focus:outline-none focus:border-gold"
              />
            </label>
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full px-4 py-2 bg-gold text-deep font-heading tracking-wide rounded disabled:opacity-50 hover:bg-gold-light transition-colors"
            >
              {status === 'sending' ? 'Sending…' : 'Send magic link'}
            </button>
            {error && <p className="text-red-400 text-sm">{error}</p>}
          </form>
        )}
      </div>
    </div>
  )
}
