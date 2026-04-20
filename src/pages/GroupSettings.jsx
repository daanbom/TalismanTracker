import { useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../hooks/useAuth'
import { useGroups } from '../hooks/useGroups'
import {
  useGroupInvites,
  useCreateEmailInvite,
  useRevokeInvite,
  useRegenerateInviteCode,
} from '../hooks/useGroupInvites'

function relativeExpiry(iso) {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'expired'
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  if (days >= 1) return `${days}d left`
  const hours = Math.max(1, Math.floor(diff / (60 * 60 * 1000)))
  return `${hours}h left`
}

export default function GroupSettings() {
  const { id: groupId } = useParams()
  const { user } = useAuth()
  const { data: groups = [], isLoading: groupsLoading } = useGroups()
  const group = groups.find((g) => g.id === groupId)

  const [showHistory, setShowHistory] = useState(false)
  const { data: invites = [], isLoading: invitesLoading } = useGroupInvites(groupId, { includeHistory: showHistory })
  const createInvite = useCreateEmailInvite(groupId)
  const revokeInvite = useRevokeInvite(groupId)
  const regenerate = useRegenerateInviteCode(groupId)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [formError, setFormError] = useState(null)
  const [toast, setToast] = useState(null)

  if (groupsLoading) return <div className="p-8 text-parchment/60">Loading…</div>
  if (!group) return <Navigate to="/" replace />
  if (group.admin_user_id !== user?.id) return <Navigate to="/" replace />

  const joinUrl = `${window.location.origin}/join/${group.invite_code}`

  const onCopy = async () => {
    await navigator.clipboard.writeText(joinUrl)
    setToast('Link copied.')
    setTimeout(() => setToast(null), 2000)
  }

  const onRegenerate = async () => {
    if (!window.confirm('Regenerate the invite link? The old link will stop working.')) return
    await regenerate.mutateAsync()
    setToast('New link generated.')
    setTimeout(() => setToast(null), 2000)
  }

  const onInvite = handleSubmit(async ({ email }) => {
    setFormError(null)
    const normalized = email.trim().toLowerCase()

    // Q8-c: block self-invite by admin.
    if (user?.email?.toLowerCase() === normalized) {
      setFormError("That's you — you're the admin.")
      return
    }

    try {
      await createInvite.mutateAsync(normalized)
      reset({ email: '' })
      setToast('Invite created — user will see it next time they log in.')
      setTimeout(() => setToast(null), 3000)
    } catch (e) {
      setFormError(e.message ?? 'Failed to create invite.')
    }
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">
      <header className="space-y-1">
        <h1 className="font-display text-3xl text-gold tracking-wider">{group.name}</h1>
        <p className="text-parchment/60 font-body text-sm">Group settings</p>
      </header>

      {toast && <div className="px-4 py-2 bg-gold/10 border border-gold-dim/40 rounded text-parchment">{toast}</div>}

      <section className="space-y-3">
        <h2 className="font-heading text-xl text-parchment">Invite link</h2>
        <p className="text-parchment/70 text-sm font-body">Anyone with this link can join the group.</p>
        <div className="flex gap-2">
          <input
            readOnly
            value={joinUrl}
            className="flex-1 px-3 py-2 bg-deep-light/60 border border-gold-dim/40 text-parchment rounded text-sm"
          />
          <button
            type="button"
            onClick={onCopy}
            className="px-4 py-2 bg-gold text-deep font-heading rounded hover:bg-gold-light transition-colors"
          >
            Copy
          </button>
        </div>
        <button
          type="button"
          onClick={onRegenerate}
          disabled={regenerate.isPending}
          className="text-sm text-parchment/70 hover:text-gold underline"
        >
          {regenerate.isPending ? 'Regenerating…' : 'Regenerate link'}
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl text-parchment">Invite by email</h2>
        <form onSubmit={onInvite} className="flex gap-2">
          <input
            type="email"
            placeholder="friend@example.com"
            {...register('email', { required: 'Email required' })}
            className="flex-1 px-3 py-2 bg-deep-light/60 border border-gold-dim/40 text-parchment rounded"
          />
          <button
            type="submit"
            disabled={createInvite.isPending}
            className="px-4 py-2 bg-gold text-deep font-heading rounded hover:bg-gold-light transition-colors"
          >
            {createInvite.isPending ? 'Sending…' : 'Send invite'}
          </button>
        </form>
        {errors.email && <p className="text-red-400 text-sm">{errors.email.message}</p>}
        {formError && <p className="text-red-400 text-sm">{formError}</p>}
      </section>

      <section className="space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-heading text-xl text-parchment">{showHistory ? 'All invites (30d)' : 'Pending invites'}</h2>
          <button
            type="button"
            onClick={() => setShowHistory((s) => !s)}
            className="text-sm text-parchment/70 hover:text-gold underline"
          >
            {showHistory ? 'Show pending only' : 'Show revoked/accepted'}
          </button>
        </div>
        {invitesLoading ? (
          <p className="text-parchment/50 text-sm">Loading…</p>
        ) : invites.length === 0 ? (
          <p className="text-parchment/50 text-sm italic">No {showHistory ? 'invites' : 'pending invites'}.</p>
        ) : (
          <ul className="divide-y divide-gold-dim/20 border border-gold-dim/20 rounded">
            {invites.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-parchment">{inv.invited_email}</div>
                  <div className="text-xs text-parchment/50 font-body">
                    {inv.status === 'pending' ? relativeExpiry(inv.expires_at) : inv.status}
                  </div>
                </div>
                {inv.status === 'pending' && (
                  <button
                    type="button"
                    onClick={() => revokeInvite.mutate(inv.id)}
                    className="text-sm text-red-300 hover:text-red-200 underline"
                  >
                    Revoke
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
