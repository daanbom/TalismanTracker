# History Me/Group Toggle - Design Spec
_GitHub issue #79 | 2026-04-23_

## Goal

Add a `Me / Group` scope toggle to the Game History page so users can switch between:

- all games in the active group
- only the games in the active group that the signed-in player participated in

The page remains group-scoped. No route, schema, or detail-page changes are part of this feature.

## Scope And Defaults

- The feature applies only to `/history`
- An active group is still required to view history
- Default on every page visit: `Group`
- The selected scope is not persisted
- Switching between scopes does not change the route

## UI

Place a two-button segmented toggle in the page header under the title, following the same visual pattern used on other scoped pages.

```
[ Me ] [ <Active Group Name> ]
```

Behavior:
- `Me` shows only games from the active group where the current player participated
- `<Active Group Name>` shows all games from the active group
- Game cards render exactly the same in both modes

Header summary copy:
- `Group`: `<group name>: X games chronicled`
- `Me`: `You in <group name>: X games chronicled`

Empty state copy:
- `Group`: `No games logged yet.`
- `Me`: `You haven't played any games in this group yet.`

## Page State

`GameHistory` owns a local `scope` state with values `'me' | 'group'`.

- Initial value is always `'group'`
- No localStorage or shared/global state is used
- The page still blocks on active-group loading before rendering
- The page also waits for the current player record before rendering the `Me` view

## Data Layer

Extend `useGames` to accept an optional participant filter while preserving its existing group-based behavior.

Proposed shape:

```js
useGames(groupIdOverride, participantPlayerId)
```

Rules:
- `groupIdOverride` stays responsible for scoping the query to the active group
- `participantPlayerId` is optional
- when `participantPlayerId` is omitted, `useGames` returns all games in scope
- when `participantPlayerId` is provided, `useGames` returns only games in scope that include a matching `game_players.player_id`

The hook should continue returning the same normalized game shape so `GameHistory` does not need alternate rendering logic.

## Query And Cache Behavior

- React Query `queryKey` must include both the resolved group scope and the optional participant filter
- `Group` and `Me` should cache independently
- The detail page remains safe because both scopes still return only games from the active group

## Error Handling And Edge Cases

- No active group: keep the existing group-required screen unchanged
- Current player missing: render an empty `Me` state rather than crashing
- Current player has no games in the active group: show the `Me` empty-state copy
- Games without the signed-in player remain visible in `Group` mode

## Acceptance Criteria

- `/history` shows a `Me / Group` toggle in the header
- The page defaults to `Group` every time it loads
- `Group` shows all games in the active group
- `Me` shows only games from the active group where the signed-in player participated
- Game cards look identical in both modes
- Header count/copy updates to match the selected scope
- Empty-state copy differs between `Group` and `Me`
- Clicking a game from either scope still opens the detail page successfully
