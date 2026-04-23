import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useActiveGroup } from '../hooks/useActiveGroup'
import { usePendingInvites } from '../hooks/usePendingInvites'
import { useAcceptInvite, useDeclineInvite } from '../hooks/useAcceptInvite'

function dismissKey(userId) {
  return `pendingInvitesDismissed:${userId ?? 'anon'}`
}

export default function PendingInvitesBanner() {
  const { user } = useAuth()
  const { data: invites = [] } = usePendingInvites()
  const { setActiveGroup } = useActiveGroup()
  const accept = useAcceptInvite()
  const decline = useDeclineInvite()
  const navigate = useNavigate()

  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem(dismissKey(user?.id)) === '1'
  })

  if (dismissed || invites.length === 0) return null

  const onAccept = async (invite) => {
    try {
      const groupId = await accept.mutateAsync(invite.token)
      setActiveGroup(groupId)
      navigate('/', { replace: true })
    } catch (e) {
      // Surface the Postgres exception name back to the user; banner will re-render.
      alert(`Couldn't accept invite: ${e.message}`)
    }
  }

  return (
    <div className="bg-gold/10 border-b border-gold-dim/40 px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-start justify-between gap-4">
        <ul className="flex-1 space-y-2">
          {invites.map((inv) => (
            <li key={inv.id} className="flex items-center justify-between gap-3">
              <span className="text-parchment">
                <span className="font-heading text-gold">{inv.group_name ?? 'A group'}</span> invited you to join.
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onAccept(inv)}
                  disabled={accept.isPending}
                  className="px-3 py-1 bg-gold text-deep font-heading rounded text-sm hover:bg-gold-light transition-colors"
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => decline.mutate(inv.id)}
                  disabled={decline.isPending}
                  className="px-3 py-1 border border-gold-dim/40 text-parchment font-heading rounded text-sm hover:text-gold transition-colors"
                >
                  Decline
                </button>
              </div>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => {
            sessionStorage.setItem(dismissKey(user?.id), '1')
            setDismissed(true)
          }}
          className="text-parchment/60 hover:text-gold text-sm"
          aria-label="Dismiss for this session"
        >
          ×
        </button>
      </div>
    </div>
  )
}
