import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useActiveGroup } from '../hooks/useActiveGroup'
import { useAuth } from '../hooks/useAuth'
import { useLeaveGroup } from '../hooks/useGroupMembers'
import { useGroupJoinRequests } from '../hooks/useJoinRequests'
import { getGroupSwitchDestination } from '../lib/groupNavigation'

export default function GroupSwitcher({ onNavigate }) {
  const { activeGroup, groups, setActiveGroup } = useActiveGroup()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const label = activeGroup?.name ?? 'No group'

  const isAdmin = Boolean(activeGroup?.isAdmin)
  const pendingGroupId = isAdmin ? activeGroup?.id : null
  const { data: pendingRequests = [] } = useGroupJoinRequests(pendingGroupId)
  const pendingCount = pendingRequests.length
  const leaveGroup = useLeaveGroup(activeGroup?.id ?? null)

  const choose = (id) => {
    const nextGroup = groups.find((g) => g.id === id)
    const destination = getGroupSwitchDestination({
      currentPathname: location.pathname,
      nextGroupId: nextGroup?.id ?? null,
      nextGroupIsAdmin: Boolean(nextGroup?.isAdmin),
    })

    setActiveGroup(id)
    setOpen(false)
    onNavigate?.()

    if (destination) {
      navigate(destination)
    }
  }

  const goCreate = () => {
    setOpen(false)
    onNavigate?.()
    navigate('/groups/new')
  }

  const onLeaveGroup = async () => {
    if (!activeGroup) return

    if (activeGroup.admin_user_id === user?.id) {
      window.alert('Group owners cannot leave yet. Promote another admin and have them remove you.')
      return
    }

    if (!window.confirm(`Leave "${activeGroup.name}"?`)) return

    try {
      await leaveGroup.mutateAsync()

      const remainingGroups = groups.filter((g) => g.id !== activeGroup.id)
      const nextGroup = remainingGroups[0] ?? null
      const destination = getGroupSwitchDestination({
        currentPathname: location.pathname,
        nextGroupId: nextGroup?.id ?? null,
        nextGroupIsAdmin: Boolean(nextGroup?.isAdmin),
      })

      setActiveGroup(nextGroup?.id ?? null)
      setOpen(false)
      onNavigate?.()

      if (destination) {
        navigate(destination)
      } else if (!nextGroup) {
        navigate('/groups')
      }
    } catch (e) {
      window.alert(e?.message ?? 'Failed to leave group.')
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="px-3 py-1.5 text-sm font-heading text-parchment/80 border border-gold-dim/40 rounded hover:text-gold hover:border-gold-dim transition-colors"
      >
        {label} <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="absolute left-0 mt-2 w-56 bg-deep border border-gold-dim/40 rounded shadow-lg z-50 overflow-hidden">
          {groups.length === 0 && (
            <div className="px-3 py-2 text-xs text-parchment/50 font-body italic">
              You're not in any groups yet.
            </div>
          )}
          {groups.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => choose(g.id)}
              className={`w-full text-left px-3 py-2 text-sm font-heading transition-colors ${
                g.id === activeGroup?.id
                  ? 'text-gold bg-gold/10'
                  : 'text-parchment hover:bg-gold/5'
              }`}
            >
              {g.name}
            </button>
          ))}
          {activeGroup && isAdmin && (
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onNavigate?.()
                navigate(`/groups/${activeGroup.id}/settings`)
              }}
              className="w-full text-left px-3 py-2 text-sm font-heading text-parchment hover:bg-gold/5 transition-colors border-t border-gold-dim/20"
            >
              Group settings{pendingCount > 0 ? ` (${pendingCount})` : ''}
            </button>
          )}
          {activeGroup && (
            <button
              type="button"
              onClick={onLeaveGroup}
              disabled={leaveGroup.isPending}
              className="w-full text-left px-3 py-2 text-sm font-heading text-red-300 border-t border-gold-dim/20 hover:bg-red-950/30 transition-colors disabled:opacity-50"
            >
              {leaveGroup.isPending ? 'Leaving...' : 'Leave group'}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              onNavigate?.()
              navigate('/groups')
            }}
            className="w-full text-left px-3 py-2 text-sm font-heading text-parchment/80 border-t border-gold-dim/20 hover:bg-gold/5 transition-colors"
          >
            Browse groups
          </button>
          <button
            type="button"
            onClick={goCreate}
            className="w-full text-left px-3 py-2 text-sm font-heading text-gold hover:bg-gold/10 transition-colors"
          >
            + Create group
          </button>
        </div>
      )}
    </div>
  )
}
