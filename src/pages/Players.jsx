import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePlayers } from '../hooks/usePlayers'
import { useLeaderboardStats } from '../hooks/useLeaderboardStats'
import { useAddPlayer } from '../hooks/useAddPlayer'
import { useUpdatePlayer } from '../hooks/useUpdatePlayer'
import { useCharacters } from '../hooks/useCharacters'
import { IconPicker } from '../components/IconPicker'

function PlayerAvatar({ iconKey, name, onClick, size = 'lg' }) {
  const dim = size === 'lg' ? 'w-20 h-20' : 'w-10 h-10'
  const text = size === 'lg' ? 'text-2xl' : 'text-sm'
  const frame = size === 'lg'
    ? 'avatar-heraldic'
    : 'border border-gold-dim/20 hover:border-gold/50 transition-colors'

  if (!iconKey) {
    return (
      <button
        onClick={onClick}
        title="Set profile icon"
        className={`${dim} rounded-xl bg-elevated flex items-center justify-center ${text} font-heading text-gold-dim ${frame}`}
      >
        {name.charAt(0).toUpperCase()}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      title="Change profile icon"
      className={`${dim} rounded-xl overflow-hidden ${frame}`}
    >
      <img
        src={`/icons/${iconKey}.png`}
        alt={iconKey}
        className="w-full h-full object-cover"
        onError={e => {
          e.currentTarget.style.display = 'none'
          e.currentTarget.parentElement.classList.add('bg-elevated', 'flex', 'items-center', 'justify-center')
          e.currentTarget.parentElement.innerHTML = `<span class="font-heading text-gold-dim text-xl">${name.charAt(0).toUpperCase()}</span>`
        }}
      />
    </button>
  )
}

export default function Players() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIconKey, setNewIconKey] = useState(null)
  const [newIconCharacterId, setNewIconCharacterId] = useState(null)
  const [newFavoriteCharacterId, setNewFavoriteCharacterId] = useState(null)
  const [showNewIconPicker, setShowNewIconPicker] = useState(false)

  const [editingPlayer, setEditingPlayer] = useState(null)
  const [editName, setEditName] = useState('')
  const [editIconKey, setEditIconKey] = useState(null)
  const [editIconCharacterId, setEditIconCharacterId] = useState(null)
  const [editFavoriteCharacterId, setEditFavoriteCharacterId] = useState(null)
  const [showEditIconPicker, setShowEditIconPicker] = useState(false)

  const playersQuery = usePlayers()
  const statsQuery = useLeaderboardStats()
  const { data: allCharacters = [] } = useCharacters()
  const addPlayer = useAddPlayer()
  const updatePlayer = useUpdatePlayer()

  const expansionOrder = [
    'Base Game', 'The Reaper', 'The Frostmarch', 'The Dragon', 'The Woodland',
    'The City', 'The Harbinger', 'The Firelands', 'The Cataclysm', 'The Dungeon',
    'The Sacred Pool', 'The Blood Moon',
  ]
  const charactersByExpansion = allCharacters.reduce((acc, c) => {
    if (!acc[c.expansion]) acc[c.expansion] = []
    acc[c.expansion].push(c)
    return acc
  }, {})
  const orderedExpansions = expansionOrder.filter(e => charactersByExpansion[e])

  const players = playersQuery.data ?? []
  const stats = statsQuery.data ?? []

  const playersWithStats = players.map(p => {
    const s = stats.find(row => row.id === p.id)
    return { ...p, ...s }
  })

  const error = playersQuery.error || statsQuery.error || addPlayer.error || updatePlayer.error

  const handleAdd = () => {
    addPlayer.mutate({ name: newName, iconKey: newIconKey, iconCharacterId: newIconCharacterId, favoriteCharacterId: newFavoriteCharacterId }, {
      onSuccess: () => {
        setShowAddModal(false)
        setNewName('')
        setNewIconKey(null)
        setNewIconCharacterId(null)
        setNewFavoriteCharacterId(null)
      },
    })
  }

  const handleCloseAddModal = () => {
    setShowAddModal(false)
    setNewName('')
    setNewIconKey(null)
    setNewIconCharacterId(null)
    setNewFavoriteCharacterId(null)
    addPlayer.reset()
  }

  const openEditModal = (player) => {
    setEditingPlayer(player)
    setEditName(player.name)
    setEditIconKey(player.iconKey ?? null)
    setEditIconCharacterId(player.iconCharacterId ?? null)
    setEditFavoriteCharacterId(player.favoriteCharacterId ?? null)
  }

  const handleSave = () => {
    updatePlayer.mutate(
      { playerId: editingPlayer.id, name: editName, iconKey: editIconKey, iconCharacterId: editIconCharacterId, favoriteCharacterId: editFavoriteCharacterId },
      { onSuccess: closeEditModal },
    )
  }

  const closeEditModal = () => {
    setEditingPlayer(null)
    setEditName('')
    setEditIconKey(null)
    setEditIconCharacterId(null)
    setEditFavoriteCharacterId(null)
    updatePlayer.reset()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-3xl text-parchment tracking-wide">Players</h1>
          <button onClick={() => setShowAddModal(true)} className="btn-gold text-sm">
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
              <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-gold-dim/10">
                <div>
                  <button
                    onClick={() => openEditModal(player)}
                    className="font-heading text-lg text-parchment tracking-wide hover:text-gold transition-colors text-left"
                  >
                    {player.name}
                  </button>
                  <div className="mt-0.5">
                    <span className="text-muted text-xs font-body">Favourite Character</span>
                    <p className="text-sm font-body text-parchment/80">
                      {allCharacters.find(c => c.id === player.favoriteCharacterId)?.name ?? 'NA'}
                    </p>
                  </div>
                </div>
                <PlayerAvatar
                  iconKey={player.iconKey}
                  name={player.name}
                  onClick={() => openEditModal(player)}
                />
              </div>
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
              <div className="mt-3 pt-3 border-t border-gold-dim/10 flex items-center justify-between gap-2 text-xs font-body">
                <span className="text-muted">
                  Joined {new Date(player.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
                <Link
                  to={`/players/${player.id}/tierlist`}
                  className="text-gold-dim hover:text-gold transition-colors tracking-wide"
                >
                  Tierlist &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Player Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-deep/80" onClick={handleCloseAddModal} />
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

            <div className="mb-4">
              <label className="block text-sm font-body text-parchment/80 mb-1.5">Favourite Character <span className="text-muted">(optional)</span></label>
              <select
                className="input-field"
                value={newFavoriteCharacterId ?? ''}
                onChange={e => setNewFavoriteCharacterId(e.target.value || null)}
              >
                <option value="">None</option>
                {orderedExpansions.map(exp => (
                  <optgroup key={exp} label={exp}>
                    {charactersByExpansion[exp].map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-body text-parchment/80 mb-1.5">Profile Icon <span className="text-muted">(optional)</span></label>
              <div className="flex items-center gap-3">
                {newIconKey ? (
                  <img src={`/icons/${newIconKey}.png`} alt={newIconKey} className="w-12 h-12 rounded-lg object-cover border border-gold-dim/30" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-elevated border border-gold-dim/20 flex items-center justify-center text-muted text-xs font-body">?</div>
                )}
                <button onClick={() => setShowNewIconPicker(true)} className="btn-outline text-sm">
                  {newIconKey ? 'Change' : 'Choose icon'}
                </button>
                {newIconKey && (
                  <button onClick={() => { setNewIconKey(null); setNewIconCharacterId(null) }} className="text-sm font-body text-muted hover:text-danger transition-colors">
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={handleCloseAddModal} className="btn-outline text-sm">Cancel</button>
              <button onClick={handleAdd} className="btn-gold text-sm" disabled={!newName.trim() || addPlayer.isPending}>
                {addPlayer.isPending ? 'Adding...' : 'Add Player'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Icon picker for new player */}
      {showNewIconPicker && (
        <IconPicker
          currentKey={newIconKey}
          onSelect={(key, characterId) => { setNewIconKey(key); setNewIconCharacterId(characterId); setShowNewIconPicker(false) }}
          onClose={() => setShowNewIconPicker(false)}
        />
      )}

      {/* Edit Player Modal */}
      {editingPlayer && !showEditIconPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-deep/80" onClick={closeEditModal} />
          <div className="relative bg-surface border border-gold-dim/20 rounded-xl p-6 w-full max-w-md animate-fade-up">
            <h2 className="font-heading text-xl text-parchment tracking-wide mb-4">Edit Player</h2>

            <div className="mb-4">
              <label className="block text-sm font-body text-parchment/80 mb-1.5">Player Name</label>
              <input
                className="input-field"
                placeholder="Enter name..."
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && editName.trim()) handleSave() }}
                autoFocus
              />
              {updatePlayer.error && (
                <p className="text-danger text-xs font-body mt-2">{updatePlayer.error.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-body text-parchment/80 mb-1.5">Favourite Character <span className="text-muted">(optional)</span></label>
              <select
                className="input-field"
                value={editFavoriteCharacterId ?? ''}
                onChange={e => setEditFavoriteCharacterId(e.target.value || null)}
              >
                <option value="">None</option>
                {orderedExpansions.map(exp => (
                  <optgroup key={exp} label={exp}>
                    {charactersByExpansion[exp].map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-body text-parchment/80 mb-1.5">Profile Icon <span className="text-muted">(optional)</span></label>
              <div className="flex items-center gap-3">
                {editIconKey ? (
                  <img src={`/icons/${editIconKey}.png`} alt={editIconKey} className="w-12 h-12 rounded-lg object-cover border border-gold-dim/30" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-elevated border border-gold-dim/20 flex items-center justify-center text-muted text-xs font-body">?</div>
                )}
                <button onClick={() => setShowEditIconPicker(true)} className="btn-outline text-sm">
                  {editIconKey ? 'Change' : 'Choose icon'}
                </button>
                {editIconKey && (
                  <button onClick={() => { setEditIconKey(null); setEditIconCharacterId(null) }} className="text-sm font-body text-muted hover:text-danger transition-colors">
                    Remove
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button onClick={closeEditModal} className="btn-outline text-sm">Cancel</button>
              <button onClick={handleSave} className="btn-gold text-sm" disabled={!editName.trim() || updatePlayer.isPending}>
                {updatePlayer.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Icon picker for edit player */}
      {showEditIconPicker && (
        <IconPicker
          currentKey={editIconKey}
          onSelect={(key, characterId) => { setEditIconKey(key); setEditIconCharacterId(characterId); setShowEditIconPicker(false) }}
          onClose={() => setShowEditIconPicker(false)}
        />
      )}
    </div>
  )
}
