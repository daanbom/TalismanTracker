import { useParams } from 'react-router-dom'
import { MOCK_GAMES, MOCK_ENDINGS } from '../lib/mockData'
import LogGame from './LogGame'

export default function EditGame() {
  const { id } = useParams()
  const game = MOCK_GAMES.find(g => g.id === id) || MOCK_GAMES[0]

  const initialData = {
    date: game.date,
    ending_id: game.ending.id,
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
      acc[h.category] = { player_id: h.player.id, value: h.value }
      return acc
    }, {}),
    expansionEvents: {
      woodland: {
        paths_completed: game.expansion_events
          .filter(e => e.expansion === 'woodland')
          .map(e => e.detail),
      },
      dungeon: {
        beaten: game.expansion_events.some(e => e.event_type === 'dungeon_beaten'),
        detail: game.expansion_events.find(e => e.event_type === 'dungeon_beaten')?.detail || '',
      },
    },
  }

  return <LogGame initialData={initialData} isEditing />
}
