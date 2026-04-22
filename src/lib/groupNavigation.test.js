import test from 'node:test'
import assert from 'node:assert/strict'

import { getGroupSwitchDestination } from './groupNavigation.js'

test('returns next group settings route when switching groups from settings as an admin', () => {
  assert.equal(
    getGroupSwitchDestination({
      currentPathname: '/groups/current-group/settings',
      nextGroupId: 'next-group',
      nextGroupAdminUserId: 'user-1',
      userId: 'user-1',
    }),
    '/groups/next-group/settings',
  )
})

test('returns home when switching to a non-admin group from settings', () => {
  assert.equal(
    getGroupSwitchDestination({
      currentPathname: '/groups/current-group/settings',
      nextGroupId: 'next-group',
      nextGroupAdminUserId: 'user-2',
      userId: 'user-1',
    }),
    '/',
  )
})

test('returns null when switching groups outside group settings', () => {
  assert.equal(
    getGroupSwitchDestination({
      currentPathname: '/leaderboard',
      nextGroupId: 'next-group',
      nextGroupAdminUserId: 'user-1',
      userId: 'user-1',
    }),
    null,
  )
})
