import { useParams } from 'react-router-dom'
import { useGame } from '../hooks/useGame'
import LogGame from './LogGame'

export default function EditGame() {
  const { id } = useParams()
  const { data: game, error, isLoading } = useGame(id)

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-danger text-sm font-body">{error.message}</p>
      </div>
    )
  }
  if (isLoading || !game) return null

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
        total_deaths: p.total_deaths,
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

  return <LogGame initialData={initialData} isEditing gameId={id} />
}
