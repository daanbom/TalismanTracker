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
    date: game.date,
    ending_id: game.ending?.id ?? '',
    notes: game.notes || '',
    players: game.players.map(p => p.player.id),
    playerData: game.players.reduce((acc, p) => {
      acc[p.player.id] = {
        characters_played: p.characters_played,
        total_deaths: p.total_deaths,
        is_winner: p.is_winner,
        winning_character: p.winning_character,
      }
      return acc
    }, {}),
    highscores: game.highscores.reduce((acc, h) => {
      acc[h.category] = { player_id: h.player?.id ?? '', value: h.value }
      return acc
    }, {}),
    expansionEvents: game.players.reduce((acc, gp) => {
      const pid = gp.player.id
      acc[pid] = {
        woodland: {
          paths_completed: game.expansion_events
            .filter(e => e.player?.id === pid && e.expansion === 'woodland')
            .map(e => e.detail)
            .filter(Boolean),
        },
        dungeon: {
          beaten: game.expansion_events.some(
            e => e.player?.id === pid && e.event_type === 'dungeon_beaten',
          ),
        },
      }
      return acc
    }, {}),
  }

  return <LogGame initialData={initialData} isEditing gameId={id} />
}
