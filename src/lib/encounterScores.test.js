import test from 'node:test'
import assert from 'node:assert/strict'

import { aggregateEncounterScores } from './encounterScores.js'

test('aggregateEncounterScores combines encounter totals across groups', () => {
  const rows = [
    {
      id: 'group-a-basilisk',
      encounterName: 'Basilisk',
      creatureWins: 2,
      playerWins: 1,
      groupId: 'group-a',
    },
    {
      id: 'group-b-basilisk',
      encounterName: 'Basilisk',
      creatureWins: 5,
      playerWins: 4,
      groupId: 'group-b',
    },
    {
      id: 'group-a-dark-fey',
      encounterName: 'Dark Fey',
      creatureWins: 1,
      playerWins: 3,
      groupId: 'group-a',
    },
  ]

  assert.deepEqual(aggregateEncounterScores(rows), [
    {
      id: 'global-Basilisk',
      encounterName: 'Basilisk',
      creatureWins: 7,
      playerWins: 5,
      groupId: null,
    },
    {
      id: 'global-Dark Fey',
      encounterName: 'Dark Fey',
      creatureWins: 1,
      playerWins: 3,
      groupId: null,
    },
  ])
})
