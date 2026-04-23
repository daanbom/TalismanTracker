import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { useCurrentPlayer } from '../hooks/useCurrentPlayer'
import { useActiveGroup } from '../hooks/useActiveGroup'

function generateInviteCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  return Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 12)
}

export default function CreateGroup() {
  const { user } = useAuth()
  const { data: player } = useCurrentPlayer()
  const { setActiveGroup } = useActiveGroup()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!player) {
      setError('Finish your profile setup first.')
      return
    }
    setSubmitting(true)
    setError(null)

    const inviteCode = generateInviteCode()
    const { data: group, error: groupErr } = await supabase
      .from('groups')
      .insert({ name: name.trim(), admin_user_id: user.id, invite_code: inviteCode })
      .select()
      .single()
    if (groupErr) {
      setError(groupErr.message)
      setSubmitting(false)
      return
    }

    const { error: memberErr } = await supabase
      .from('group_members')
      .insert({ group_id: group.id, user_id: user.id, player_id: player.id })
    if (memberErr) {
      setError(memberErr.message)
      setSubmitting(false)
      return
    }

    await qc.invalidateQueries({ queryKey: ['groups', user.id] })
    setActiveGroup(group.id)
    navigate('/', { replace: true })
  }

  return (
    <div className="max-w-md mx-auto mt-16 px-4 space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-3xl text-gold tracking-wider">Create a group</h1>
        <p className="text-parchment/80 font-body">
          Groups scope games, counters, and leaderboards to your fellowship. You'll be the admin.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="block text-sm text-parchment/80 mb-1 font-heading">Group name</span>
          <input
            required
            minLength={1}
            maxLength={60}
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
          {submitting ? 'Creating…' : 'Create group'}
        </button>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </form>
    </div>
  )
}
