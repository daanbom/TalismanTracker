import { useActiveGroup } from './useActiveGroup'

export function useIsActiveGroupAdmin() {
  const { activeGroup } = useActiveGroup()
  return Boolean(activeGroup?.isAdmin)
}
