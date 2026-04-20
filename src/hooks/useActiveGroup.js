import { useState } from 'react'
import { useGroups } from './useGroups'

const STORAGE_KEY = 'activeGroupId'

function readStored() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEY)
}

export function useActiveGroup() {
  const { data: groups = [], isLoading } = useGroups()
  const [storedId, setStoredId] = useState(readStored)

  // If groups have loaded and the stored id isn't one of them, treat as null.
  // The stale value can stay in localStorage — it gets overwritten on next pick,
  // and this derivation filters it out on read.
  const isStale = !isLoading && storedId && !groups.find((g) => g.id === storedId)
  const activeGroupId = isStale ? null : storedId
  const activeGroup = groups.find((g) => g.id === activeGroupId) ?? null

  const setActiveGroup = (id) => {
    setStoredId(id)
    if (id) localStorage.setItem(STORAGE_KEY, id)
    else localStorage.removeItem(STORAGE_KEY)
  }

  return { activeGroupId, activeGroup, groups, setActiveGroup, isLoading }
}
