import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { useCurrentPlayer } from '../hooks/useCurrentPlayer'
import { useActiveGroup } from '../hooks/useActiveGroup'
import { lookupGroupByCode, useJoinByCode } from '../hooks/useJoinByCode'

export default function JoinGroup() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: player } = useCurrentPlayer()
  const { setActiveGroup } = useActiveGroup()
  const joinByCode = useJoinByCode()

  const [status, setStatus] = useState('loading')  // loading | confirm | invalid | joining | done
  const [group, setGroup] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const g = await lookupGroupByCode(code)
        if (cancelled) return
        if (!g) { setStatus('invalid'); return }
        setGroup(g)

        const { data: existing, error: memErr } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('group_id', g.id)
          .eq('user_id', user.id)
          .maybeSingle()
        if (memErr) throw memErr

        if (existing) {
          setActiveGroup(g.id)
          navigate('/', { replace: true })
          return
        }
        setStatus('confirm')
      } catch (e) {
        if (!cancelled) { setError(e.message); setStatus('invalid') }
      }
    })()
    return () => { cancelled = true }
  }, [code, user?.id, navigate, setActiveGroup])

  const onJoin = async () => {
    if (!player) {
      navigate(`/setup?next=/join/${code}`, { replace: true })
      return
    }
    setStatus('joining')
    try {
      await joinByCode.mutateAsync({ groupId: group.id, playerId: player.id })
      setActiveGroup(group.id)
      setStatus('done')
      navigate('/', { replace: true })
    } catch (e) {
      setError(e.message)
      setStatus('confirm')
    }
  }

  if (status === 'loading') {
    return <div className="p-8 text-parchment/60">Loading…</div>
  }
  if (status === 'invalid') {
    return (
      <div className="max-w-md mx-auto mt-16 px-4 space-y-4">
        <h1 className="font-display text-2xl text-gold">Invalid invite link</h1>
        <p className="text-parchment/70 font-body">This link is no longer valid. Ask your group admin for a new one.</p>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    )
  }
  return (
    <div className="max-w-md mx-auto mt-16 px-4 space-y-4">
      <h1 className="font-display text-2xl text-gold">Join {group.name}?</h1>
      <p className="text-parchment/70 font-body">You'll join as a member of this group.</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onJoin}
          disabled={status === 'joining'}
          className="px-4 py-2 bg-gold text-deep font-heading rounded hover:bg-gold-light transition-colors"
        >
          {status === 'joining' ? 'Joining…' : 'Join'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/', { replace: true })}
          className="px-4 py-2 border border-gold-dim/40 text-parchment font-heading rounded hover:text-gold hover:border-gold-dim transition-colors"
        >
          Cancel
        </button>
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  )
}
