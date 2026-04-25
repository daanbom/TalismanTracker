import { useState } from 'react'
import { useGroups } from '../hooks/useGroups'
import { useAllGroups, useMyJoinRequests, useRequestToJoin } from '../hooks/useJoinRequests'

export default function GroupDirectory() {
  const { data: allGroups = [], isLoading } = useAllGroups()
  const { data: myRequests = [] } = useMyJoinRequests()
  const { data: myMemberships = [] } = useGroups()
  const requestToJoin = useRequestToJoin()
  const [requestError, setRequestError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const memberGroupIds = new Set(myMemberships.map((g) => g.id))
  const requestsByGroupId = Object.fromEntries(myRequests.map((r) => [r.group_id, r]))
  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredGroups = normalizedSearch
    ? allGroups.filter((group) => group.name.toLowerCase().includes(normalizedSearch))
    : allGroups

  if (isLoading) return <div className="p-8 text-parchment/60">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <header className="space-y-1">
        <h1 className="font-display text-3xl text-gold tracking-wider">Browse Groups</h1>
        <p className="text-parchment/60 font-body text-sm">
          Find a group and request to join.
        </p>
      </header>
      {allGroups.length > 0 && (
        <label className="block space-y-1">
          <span className="text-xs uppercase tracking-wide text-parchment/60 font-heading">
            Search groups
          </span>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by group name"
            className="w-full rounded border border-gold-dim/30 bg-night/40 px-3 py-2 text-parchment placeholder:text-parchment/40 focus:outline-none focus:ring-2 focus:ring-gold/50"
            aria-label="Search groups by name"
          />
        </label>
      )}

      {allGroups.length === 0 ? (
        <p className="text-parchment/50 italic font-body">No groups yet.</p>
      ) : filteredGroups.length === 0 ? (
        <p className="text-parchment/50 italic font-body">
          No groups match "{searchTerm.trim()}".
        </p>
      ) : (
        <ul className="divide-y divide-gold-dim/20 border border-gold-dim/20 rounded">
          {filteredGroups.map((group) => {
            const isMember = memberGroupIds.has(group.id)
            const request = requestsByGroupId[group.id]
            const isPending = request?.status === 'pending'
            const playerCount = group.memberCount ?? 0

            return (
              <li key={group.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-parchment font-heading">{group.name}</p>
                  <p className="text-xs text-parchment/50 font-body">
                    {playerCount} player{playerCount === 1 ? '' : 's'}
                  </p>
                </div>
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
