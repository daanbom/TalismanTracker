import { useState, useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../hooks/useAuth'
import { useGroups } from '../hooks/useGroups'
import { useCurrentUserProfile } from '../hooks/useCurrentUserProfile'
import {
  useGroupInvites,
  useCreateUsernameInvite,
  useRevokeInvite,
  useRegenerateInviteCode,
} from '../hooks/useGroupInvites'
import {
  useGroupJoinRequests,
  useApproveJoinRequest,
  useDeclineJoinRequest,
} from '../hooks/useJoinRequests'
import {
  useGroupMembers,
  useRemoveMember,
  useSetMemberAdmin,
  useRenameGroup,
} from '../hooks/useGroupMembers'

function relativeExpiry(iso) {
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'expired'
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  if (days >= 1) return `${days}d left`
  const hours = Math.max(1, Math.floor(diff / (60 * 60 * 1000)))
  return `${hours}h left`
}

function isDuplicateGroupNameError(error) {
  if (!error || error.code !== '23505') return false
  const details = `${error.message ?? ''} ${error.details ?? ''} ${error.hint ?? ''}`.toLowerCase()
  return details.includes('groups_name_unique_ci') || details.includes('lower(btrim(name))')
}

function mapInviteError(error) {
  const code = `${error?.message ?? ''}`.toLowerCase()
  if (code.includes('username_not_found')) return 'Username does not exist.'
  if (code.includes('cannot_invite_self')) return "That's you - you're already in this group."
  if (code.includes('not_admin')) return 'Only group admins can send invites.'
  return error?.message ?? 'Failed to create invite.'
}

export default function GroupSettings() {
  const { id: groupId } = useParams()
  const { user } = useAuth()
  const { data: profile } = useCurrentUserProfile()
  const { data: groups = [], isLoading: groupsLoading } = useGroups()
  const group = groups.find((g) => g.id === groupId)

  const [showHistory, setShowHistory] = useState(false)
  const { data: invites = [], isLoading: invitesLoading } = useGroupInvites(groupId, { includeHistory: showHistory })
  const createInvite = useCreateUsernameInvite(groupId)
  const revokeInvite = useRevokeInvite(groupId)
  const regenerate = useRegenerateInviteCode(groupId)

  const { data: joinRequests = [], isLoading: joinRequestsLoading } = useGroupJoinRequests(groupId)
  const approveRequest = useApproveJoinRequest(groupId)
  const declineRequest = useDeclineJoinRequest(groupId)

  const { data: members = [], isLoading: membersLoading } = useGroupMembers(groupId)
  const removeMember = useRemoveMember(groupId)
  const setMemberAdmin = useSetMemberAdmin(groupId)
  const renameGroup = useRenameGroup(groupId)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const [formError, setFormError] = useState(null)
  const [toast, setToast] = useState(null)
  const [renameError, setRenameError] = useState(null)

  const {
    register: registerRename,
    handleSubmit: handleRenameSubmit,
    reset: resetRename,
    formState: { errors: renameErrors },
  } = useForm({ defaultValues: { name: group?.name ?? '' } })

  useEffect(() => {
    if (group?.name) resetRename({ name: group.name })
  }, [group?.name]) // eslint-disable-line react-hooks/exhaustive-deps

  if (groupsLoading) return <div className="p-8 text-parchment/60">Loading...</div>
  if (!group) return <Navigate to="/" replace />
  if (!group.isAdmin) return <Navigate to="/" replace />

  const joinUrl = `${window.location.origin}/join/${group.invite_code}`

  const onRename = handleRenameSubmit(async ({ name }) => {
    setRenameError(null)
    const trimmed = name.trim()
    if (trimmed === group.name) return
    try {
      await renameGroup.mutateAsync(trimmed)
      setToast('Group renamed.')
      setTimeout(() => setToast(null), 2000)
    } catch (e) {
      setRenameError(
        isDuplicateGroupNameError(e)
          ? 'A group with that name already exists.'
          : (e.message ?? 'Failed to rename group.')
      )
    }
  })

  const onRemoveMember = async (member) => {
    if (!window.confirm(`Remove ${member.name} from the group?`)) return
    try {
      await removeMember.mutateAsync(member.userId)
      setToast(`${member.name} removed.`)
      setTimeout(() => setToast(null), 2000)
    } catch (e) {
      setToast(`Failed to remove member: ${e.message}`)
      setTimeout(() => setToast(null), 3000)
    }
  }

  const onSetMemberAdmin = async (member, makeAdmin) => {
    if (!window.confirm(`${makeAdmin ? 'Grant' : 'Remove'} admin access for ${member.name}?`)) return
    try {
      await setMemberAdmin.mutateAsync({ userId: member.userId, isAdmin: makeAdmin })
      setToast(`${member.name} ${makeAdmin ? 'is now an admin' : 'is no longer an admin'}.`)
      setTimeout(() => setToast(null), 2000)
    } catch (e) {
      setToast(`Failed to update admin access: ${e.message}`)
      setTimeout(() => setToast(null), 3000)
    }
  }

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

  const onInvite = handleSubmit(async ({ username }) => {
    setFormError(null)
    const normalized = username.trim().toLowerCase()

    if (profile?.username === normalized) {
      setFormError("That's you - you're already in this group.")
      return
    }

    try {
      const invitedUsername = await createInvite.mutateAsync(normalized)
      reset({ username: '' })
      setToast(`Invite created for @${invitedUsername}.`)
      setTimeout(() => setToast(null), 3000)
    } catch (e) {
      setFormError(mapInviteError(e))
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
        <h2 className="font-heading text-xl text-parchment">Rename group</h2>
        <form onSubmit={onRename} className="flex gap-2">
          <input
            type="text"
            {...registerRename('name', { required: 'Name required' })}
            className="flex-1 px-3 py-2 bg-deep-light/60 border border-gold-dim/40 text-parchment rounded"
          />
          <button
            type="submit"
            disabled={renameGroup.isPending}
            className="px-4 py-2 bg-gold text-deep font-heading rounded hover:bg-gold-light transition-colors"
          >
            {renameGroup.isPending ? 'Saving...' : 'Save'}
          </button>
        </form>
        {renameErrors.name && <p className="text-red-400 text-sm">{renameErrors.name.message}</p>}
        {renameError && <p className="text-red-400 text-sm">{renameError}</p>}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl text-parchment">
          Members{members.length > 0 ? ` (${members.length})` : ''}
        </h2>
        {membersLoading ? (
          <p className="text-parchment/50 text-sm">Loading...</p>
        ) : members.length === 0 ? (
          <p className="text-parchment/50 text-sm italic">No members.</p>
        ) : (
          <ul className="divide-y divide-gold-dim/20 border border-gold-dim/20 rounded">
            {members.map((member) => {
              const isOwner = member.userId === group.admin_user_id
              const isAdmin = isOwner || member.isAdmin
              const isSelf = member.userId === user?.id
              return (
                <li key={member.userId} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <span className="text-parchment">{member.name}</span>
                    {isAdmin && (
                      <span className="ml-2 text-xs text-gold font-body">admin</span>
                    )}
                  </div>
                  {!isSelf && (
                    <div className="flex gap-2">
                      {!isOwner && (
                        <button
                          type="button"
                          onClick={() => onSetMemberAdmin(member, !isAdmin)}
                          disabled={setMemberAdmin.isPending}
                          className="text-sm text-parchment/70 hover:text-gold underline disabled:opacity-50"
                        >
                          {isAdmin ? 'Remove admin' : 'Make admin'}
                        </button>
                      )}
                      {!isOwner && (
                        <button
                          type="button"
                          onClick={() => onRemoveMember(member)}
                          disabled={removeMember.isPending}
                          className="text-sm text-red-300 hover:text-red-200 underline disabled:opacity-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

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
          {regenerate.isPending ? 'Regenerating...' : 'Regenerate link'}
        </button>
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-xl text-parchment">Invite by username</h2>
        <form onSubmit={onInvite} className="flex gap-2">
          <input
            type="text"
            placeholder="friend_username"
            {...register('username', { required: 'Username required' })}
            className="flex-1 px-3 py-2 bg-deep-light/60 border border-gold-dim/40 text-parchment rounded"
          />
          <button
            type="submit"
            disabled={createInvite.isPending}
            className="px-4 py-2 bg-gold text-deep font-heading rounded hover:bg-gold-light transition-colors"
          >
            {createInvite.isPending ? 'Sending...' : 'Send invite'}
          </button>
        </form>
        {errors.username && <p className="text-red-400 text-sm">{errors.username.message}</p>}
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
          <p className="text-parchment/50 text-sm">Loading...</p>
        ) : invites.length === 0 ? (
          <p className="text-parchment/50 text-sm italic">No {showHistory ? 'invites' : 'pending invites'}.</p>
        ) : (
          <ul className="divide-y divide-gold-dim/20 border border-gold-dim/20 rounded">
            {invites.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-parchment">{inv.invited_username ? `@${inv.invited_username}` : 'Unknown user'}</div>
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

      <section className="space-y-3">
        <h2 className="font-heading text-xl text-parchment">
          Join requests{joinRequests.length > 0 ? ` (${joinRequests.length})` : ''}
        </h2>
        {joinRequestsLoading ? (
          <p className="text-parchment/50 text-sm">Loading...</p>
        ) : joinRequests.length === 0 ? (
          <p className="text-parchment/50 text-sm italic">No pending requests.</p>
        ) : (
          <ul className="divide-y divide-gold-dim/20 border border-gold-dim/20 rounded">
            {joinRequests.map((req) => (
              <li key={req.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="text-parchment">{req.player_name ?? 'Unknown player'}</div>
                  <div className="text-xs text-parchment/50 font-body">
                    {new Date(req.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => approveRequest.mutate(req.id)}
                    disabled={approveRequest.isPending}
                    className="px-3 py-1.5 text-sm bg-gold text-deep font-heading rounded hover:bg-gold-light transition-colors disabled:opacity-50"
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={() => declineRequest.mutate(req.id)}
                    disabled={declineRequest.isPending}
                    className="px-3 py-1.5 text-sm border border-gold-dim/40 text-parchment font-heading rounded hover:text-gold hover:border-gold-dim transition-colors disabled:opacity-50"
                  >
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
