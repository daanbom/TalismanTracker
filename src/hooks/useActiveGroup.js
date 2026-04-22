import { useSyncExternalStore } from 'react'
import { useGroups } from './useGroups'

const STORAGE_KEY = 'activeGroupId'
const CHANGE_EVENT = 'active-group-changed'

function readStored() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEY)
}

function subscribe(onStoreChange) {
  if (typeof window === 'undefined') return () => {}

  const handleStorage = (event) => {
    if (event.key === STORAGE_KEY) onStoreChange()
  }

  const handleChange = () => onStoreChange()

  window.addEventListener('storage', handleStorage)
  window.addEventListener(CHANGE_EVENT, handleChange)

  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(CHANGE_EVENT, handleChange)
  }
}

function writeStored(id) {
  if (typeof window === 'undefined') return

  if (id) localStorage.setItem(STORAGE_KEY, id)
  else localStorage.removeItem(STORAGE_KEY)

  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function useActiveGroup() {
  const { data: groups = [], isLoading } = useGroups()
  const storedId = useSyncExternalStore(subscribe, readStored, () => null)

  // If groups have loaded and the stored id is not one of them, treat as null.
  // The stale value can stay in localStorage - it gets overwritten on next pick,
  // and this derivation filters it out on read.
  const isStale = !isLoading && storedId && !groups.find((g) => g.id === storedId)
  const activeGroupId = isStale ? null : storedId
  const activeGroup = groups.find((g) => g.id === activeGroupId) ?? null

  const setActiveGroup = (id) => {
    writeStored(id)
  }

  return { activeGroupId, activeGroup, groups, setActiveGroup, isLoading }
}
