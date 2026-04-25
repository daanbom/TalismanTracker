const GROUP_SETTINGS_PATH_RE = /^\/groups\/[^/]+\/settings\/?$/

export function getGroupSwitchDestination({
  currentPathname,
  nextGroupId,
  nextGroupIsAdmin,
}) {
  if (!GROUP_SETTINGS_PATH_RE.test(currentPathname)) return null
  if (!nextGroupId) return '/'
  return nextGroupIsAdmin ? `/groups/${nextGroupId}/settings` : '/'
}
