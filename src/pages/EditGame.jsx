import { useParams } from 'react-router-dom'
import { useGame } from '../hooks/useGame'
import { useActiveGroup } from '../hooks/useActiveGroup'
import { useCurrentPlayer } from '../hooks/useCurrentPlayer'
import GroupRequiredState from '../components/GroupRequiredState'
import LogGame from './LogGame'
import { canDeleteGame, canEditGame } from '../lib/accessControl'

export default function EditGame() {
  const { id } = useParams()
  const { activeGroupId, activeGroup, isLoading: groupsLoading } = useActiveGroup()
  const { data: currentPlayer, isLoading: currentPlayerLoading } = useCurrentPlayer()
  const { data: game, error, isLoading } = useGame(id)

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-danger text-sm font-body">{error.message}</p>
      </div>
    )
  }
  if (groupsLoading || isLoading || currentPlayerLoading) return null

  if (!activeGroupId) {
    return (
      <GroupRequiredState
        title="Select a group to edit games"
        body="Games are scoped to the active group. Pick the group that owns this game before editing it."
      />
    )
  }
  if (!game) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-ornate bg-surface border border-gold-dim/15 rounded-xl p-6 text-center animate-fade-up">
          <h1 className="font-heading text-2xl text-parchment tracking-wide">Game not found</h1>
          <div className="ornament-divider mt-3">
            <span className="text-gold-dim">&#9670;</span>
          </div>
          <p className="text-muted font-body mt-4">
            This game is not in the active group, or it no longer exists.
          </p>
        </div>
      </div>
    )
  }

  const canEdit = canEditGame({ activeGroup, currentPlayer, game })
  const canDelete = canDeleteGame({ activeGroup, currentPlayer })

  if (!canEdit) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-ornate bg-surface border border-gold-dim/15 rounded-xl p-6 text-center animate-fade-up">
          <h1 className="font-heading text-2xl text-parchment tracking-wide">No permission</h1>
          <div className="ornament-divider mt-3">
            <span className="text-gold-dim">&#9670;</span>
          </div>
          <p className="text-muted font-body mt-4">
            You can only edit games where you participated, unless you are the group admin.
          </p>
        </div>
      </div>
    )
  }

  const initialData = {
    title: game.title ?? '',
    date: game.date,
    ending_id: game.ending?.id ?? '',
    notes: game.notes || '',
    optional_expansions: game.optional_expansions ?? [],
    players: game.players.map(p => p.player.id),
    playerData: game.players.reduce((acc, p) => {
      acc[p.player.id] = {
        characters_played: p.characters_played,
        deaths: (p.deaths ?? []).map(d => ({
          death_type_id: d.death_type?.id ?? '',
          character_id: d.character?.id ?? '',
          killed_by_player_id: d.killed_by?.id ?? null,
        })),
        total_toad_times: p.total_toad_times ?? 0,
        is_winner: p.is_winner,
      }
      return acc
    }, {}),
    highscores: game.highscores.reduce((acc, h) => {
      if (!acc[h.category]) acc[h.category] = []
      acc[h.category].push({ player_id: h.player?.id ?? '', value: h.value })
      return acc
    }, {}),
    expansionEvents: game.players.reduce((acc, gp) => {
      const pid = gp.player.id
      const dungeonEvent = game.expansion_events.find(
        e => e.player?.id === pid && e.event_type === 'dungeon_beaten',
      )
      acc[pid] = {
        woodland: {
          paths_completed: game.expansion_events
            .filter(e => e.player?.id === pid && e.expansion === 'woodland')
            .map(e => ({ path: e.detail, character: e.character || null }))
            .filter(e => e.path),
        },
        dungeon: {
          beaten: !!dungeonEvent,
          character: dungeonEvent?.character || null,
        },
      }
      return acc
    }, {}),
  }

  return <LogGame initialData={initialData} isEditing gameId={id} canDelete={canDelete} />
}
