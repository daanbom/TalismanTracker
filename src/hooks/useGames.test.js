import { beforeEach, describe, expect, it, vi } from 'vitest'

const { useQueryMock, useActiveGroupMock, fromMock } = vi.hoisted(() => {
  const useQueryMock = vi.fn((config) => config)
  const useActiveGroupMock = vi.fn()
  const fromMock = vi.fn()

  return { useQueryMock, useActiveGroupMock, fromMock }
})

vi.mock('@tanstack/react-query', () => ({
  useQuery: useQueryMock,
}))

vi.mock('./useActiveGroup', () => ({
  useActiveGroup: useActiveGroupMock,
}))

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: fromMock,
  },
}))

import { useGames } from './useGames'

function createQueryResult(data) {
  const query = {
    select: vi.fn(() => query),
    order: vi.fn(() => query),
    eq: vi.fn(() => query),
    then: (resolve, reject) => Promise.resolve({ data, error: null }).then(resolve, reject),
  }

  return query
}

beforeEach(() => {
  useQueryMock.mockClear()
  useActiveGroupMock.mockReset()
  fromMock.mockReset()
  useActiveGroupMock.mockReturnValue({ activeGroupId: 'group-1', isLoading: false })
})

describe('useGames', () => {
  it('includes group and participant scope in the query key', () => {
    fromMock.mockReturnValue(createQueryResult([]))

    const result = useGames('group-1', 'player-2')

    expect(result.queryKey).toEqual(['games', 'group-1', 'player-2'])
  })

  it('filters games to the requested participant', async () => {
    fromMock.mockReturnValue(
      createQueryResult([
        {
          id: 'game-1',
          title: 'First',
          date: '2026-04-01',
          notes: null,
          created_at: '2026-04-01T10:00:00.000Z',
          ending: null,
          players: [
            { id: 'gp-1', characters_played: ['a'], total_toad_times: null, is_winner: false, winning_character: null, player: { id: 'player-1', name: 'One' } },
          ],
          expansion_events: [],
        },
        {
          id: 'game-2',
          title: 'Second',
          date: '2026-04-02',
          notes: null,
          created_at: '2026-04-02T10:00:00.000Z',
          ending: null,
          players: [
            { id: 'gp-2', characters_played: ['b'], total_toad_times: null, is_winner: false, winning_character: null, player: { id: 'player-2', name: 'Two' } },
          ],
          expansion_events: [],
        },
      ])
    )

    const result = useGames('group-1', 'player-2')
    const games = await result.queryFn()

    expect(games).toHaveLength(1)
    expect(games[0].id).toBe('game-2')
  })

  it('returns the full group list when no participant is provided', async () => {
    fromMock.mockReturnValue(
      createQueryResult([
        {
          id: 'game-1',
          title: 'First',
          date: '2026-04-01',
          notes: null,
          created_at: '2026-04-01T10:00:00.000Z',
          ending: null,
          players: [],
          expansion_events: [],
        },
        {
          id: 'game-2',
          title: 'Second',
          date: '2026-04-02',
          notes: null,
          created_at: '2026-04-02T10:00:00.000Z',
          ending: null,
          players: [],
          expansion_events: [],
        },
      ])
    )

    const result = useGames('group-1')
    const games = await result.queryFn()

    expect(games).toHaveLength(2)
    expect(games.map((game) => game.id)).toEqual(['game-1', 'game-2'])
  })
})
