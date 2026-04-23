const GROUP_SETTINGS_PATH_RE = /^\/groups\/[^/]+\/settings\/?$/

export function getGroupSwitchDestination({
  currentPathname,
  nextGroupId,
  nextGroupAdminUserId,
  userId,
}) {
  if (!GROUP_SETTINGS_PATH_RE.test(currentPathname)) return null
  if (!nextGroupId) return '/'
  return nextGroupAdminUserId === userId ? `/groups/${nextGroupId}/settings` : '/'
}
