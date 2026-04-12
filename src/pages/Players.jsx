import { useState } from 'react'
import { usePlayers } from '../hooks/usePlayers'
import { useLeaderboardStats } from '../hooks/useLeaderboardStats'
import { useAddPlayer } from '../hooks/useAddPlayer'

export default function Players() {
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')

  const playersQuery = usePlayers()
  const statsQuery = useLeaderboardStats()
  const addPlayer = useAddPlayer()

  const players = playersQuery.data ?? []
  const stats = statsQuery.data ?? []

  const playersWithStats = players.map(p => {
    const s = stats.find(row => row.id === p.id)
    return { ...p, ...s }
  })

  const error = playersQuery.error || statsQuery.error || addPlayer.error

  const handleAdd = () => {
    addPlayer.mutate(newName, {
      onSuccess: () => {
        setShowModal(false)
        setNewName('')
      },
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl text-parchment tracking-wide">Players</h1>
          <button onClick={() => setShowModal(true)} className="btn-gold text-sm">
            Add Player
          </button>
        </div>
        <div className="ornament-divider mt-3">
          <span className="text-gold-dim">&#9670;</span>
        </div>
        <p className="text-muted text-sm font-body mt-3">{players.length} adventurers registered</p>
      </div>

      {error && (
        <p className="text-danger text-sm font-body mb-4">{error.message}</p>
      )}

      {players.length === 0 && !playersQuery.isLoading ? (
        <p className="text-muted text-sm font-body italic">No players yet. Add the first adventurer.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playersWithStats.map((player, i) => (
            <div
              key={player.id}
              className={`card-ornate bg-surface border border-gold-dim/15 rounded-xl p-5 animate-fade-up delay-${i + 1}`}
            >
              <h3 className="font-heading text-lg text-parchment tracking-wide mb-3">{player.name}</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm font-body">
                <div>
                  <span className="text-muted text-xs">Games</span>
                  <p className="text-parchment/80">{player.games_played ?? 0}</p>
                </div>
                <div>
                  <span className="text-muted text-xs">Wins</span>
                  <p className="text-gold/80">{player.wins ?? 0}</p>
                </div>
                <div>
                  <span className="text-muted text-xs">Win Rate</span>
                  <p className="text-parchment/80">{player.win_rate != null ? `${player.win_rate.toFixed(1)}%` : 'N/A'}</p>
                </div>
                <div>
                  <span className="text-muted text-xs">Deaths</span>
                  <p className="text-parchment/80">{player.total_deaths ?? 0}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gold-dim/10 text-xs font-body text-muted">
                Joined {new Date(player.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Player Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-deep/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-surface border border-gold-dim/20 rounded-xl p-6 w-full max-w-md animate-fade-up">
            <h2 className="font-heading text-xl text-parchment tracking-wide mb-4">Add New Player</h2>
            <div className="mb-4">
              <label className="block text-sm font-body text-parchment/80 mb-1.5">Player Name</label>
              <input
                className="input-field"
                placeholder="Enter name..."
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && newName.trim()) handleAdd() }}
                autoFocus
              />
              {addPlayer.error && (
                <p className="text-danger text-xs font-body mt-2">{addPlayer.error.message}</p>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowModal(false); setNewName(''); addPlayer.reset() }}
                className="btn-outline text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="btn-gold text-sm"
                disabled={!newName.trim() || addPlayer.isPending}
              >
                {addPlayer.isPending ? 'Adding...' : 'Add Player'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
