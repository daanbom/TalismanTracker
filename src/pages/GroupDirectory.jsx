import { useState } from 'react'
import { useGroups } from '../hooks/useGroups'
import { useAllGroups, useMyJoinRequests, useRequestToJoin } from '../hooks/useJoinRequests'

export default function GroupDirectory() {
  const { data: allGroups = [], isLoading } = useAllGroups()
  const { data: myRequests = [] } = useMyJoinRequests()
  const { data: myMemberships = [] } = useGroups()
  const requestToJoin = useRequestToJoin()
  const [requestError, setRequestError] = useState(null)

  const memberGroupIds = new Set(myMemberships.map((g) => g.id))
  const requestsByGroupId = Object.fromEntries(myRequests.map((r) => [r.group_id, r]))

  if (isLoading) return <div className="p-8 text-parchment/60">Loading…</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-3xl text-gold tracking-wider">Browse Groups</h1>
        <p className="text-parchment/60 font-body text-sm">
          Find a group and request to join.
        </p>
      </header>

      {allGroups.length === 0 ? (
        <p className="text-parchment/50 italic font-body">No groups yet.</p>
      ) : (
        <ul className="divide-y divide-gold-dim/20 border border-gold-dim/20 rounded">
          {allGroups.map((group) => {
            const isMember = memberGroupIds.has(group.id)
            const request = requestsByGroupId[group.id]
            const isPending = request?.status === 'pending'

            return (
              <li key={group.id} className="flex items-center justify-between px-4 py-3">
                <span className="text-parchment font-heading">{group.name}</span>
                {isMember ? (
                  <span className="text-xs text-parchment/50 font-body">Member</span>
                ) : isPending ? (
                  <span className="text-xs text-parchment/50 font-body italic">
                    Request pending
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={requestToJoin.isPending}
                    onClick={async () => {
                      setRequestError(null)
                      try {
                        await requestToJoin.mutateAsync({ groupId: group.id })
                      } catch (e) {
                        setRequestError(e.message ?? 'Failed to send request.')
                      }
                    }}
                    className="px-3 py-1.5 text-sm bg-gold text-deep font-heading rounded hover:bg-gold-light transition-colors disabled:opacity-50"
                  >
                    Request to join
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
      {requestError && (
        <p className="text-red-400 text-sm">{requestError}</p>
      )}
    </div>
  )
}
