import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePlayers } from '../hooks/usePlayers'
import { useCharacters } from '../hooks/useCharacters'
import { useEndings } from '../hooks/useEndings'
import { useAddPlayer } from '../hooks/useAddPlayer'
import { useLogGame } from '../hooks/useLogGame'
import { useUpdateGame } from '../hooks/useUpdateGame'
import { useDeleteGame } from '../hooks/useDeleteGame'

const HIGHSCORE_CATEGORIES = [
  { key: 'most_gold', label: 'Most Gold' },
  { key: 'most_followers', label: 'Most Followers' },
  { key: 'most_objects', label: 'Most Objects' },
  { key: 'most_fate', label: 'Most Fate' },
  { key: 'most_strength', label: 'Most Strength (without bonus)' },
  { key: 'most_craft', label: 'Most Craft (without bonus)' },
  { key: 'most_life', label: 'Most Life' },
  { key: 'most_deaths', label: 'Most Deaths' },
  { key: 'most_toad_times', label: 'Most Times Turned Into Toad' },
  { key: 'longest_toad_streak', label: 'Longest Toad Streak (consecutive turns)' },
  { key: 'most_denizens_on_spot', label: 'Most Denizens on Spot' },
]

const WOODLAND_PATHS = [
  'Way of Light',
  'Path of Destiny',
  'Sylvan Path',
  'Ancient Way',
  'Dark Path',
]

const INITIAL_STATE = {
  date: new Date().toISOString().split('T')[0],
  ending_id: '',
  notes: '',
  players: [],
  playerData: {},
  highscores: {},
  expansionEvents: {},
}

const emptyPlayerEvents = () => ({
  woodland: { paths_completed: [] },
  dungeon: { beaten: false },
})

function SectionHeader({ title, subtitle }) {
  return (
    <div className="section-header">
      <h2 className="font-heading text-xl text-gold tracking-wide">{title}</h2>
      {subtitle && <p className="text-muted text-sm mt-1 font-body">{subtitle}</p>}
    </div>
  )
}

export default function LogGame({ initialData, isEditing, gameId }) {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialData || INITIAL_STATE)
  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [newPlayerName, setNewPlayerName] = useState('')

  const { data: allPlayers = [] } = usePlayers()
  const { data: allCharacters = [] } = useCharacters()
  const { data: allEndings = [] } = useEndings()
  const addPlayer = useAddPlayer()
  const logGame = useLogGame()
  const updateGame = useUpdateGame()
  const deleteGame = useDeleteGame()

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const togglePlayer = (playerId) => {
    setForm(prev => {
      const exists = prev.players.includes(playerId)
      const players = exists
        ? prev.players.filter(id => id !== playerId)
        : prev.players.length < 5 ? [...prev.players, playerId] : prev.players
      const playerData = { ...prev.playerData }
      const expansionEvents = { ...prev.expansionEvents }
      if (!exists) {
        playerData[playerId] = { characters_played: [], total_deaths: 0, is_winner: false, winning_character: null }
        expansionEvents[playerId] = emptyPlayerEvents()
      } else {
        delete playerData[playerId]
        delete expansionEvents[playerId]
      }
      return { ...prev, players, playerData, expansionEvents }
    })
  }

  const updatePlayerData = (playerId, key, value) => {
    setForm(prev => ({
      ...prev,
      playerData: {
        ...prev.playerData,
        [playerId]: { ...prev.playerData[playerId], [key]: value },
      },
    }))
  }

  const toggleWinner = (playerId) => {
    setForm(prev => {
      const current = prev.playerData[playerId]
      if (!current) return prev
      const nextIsWinner = !current.is_winner
      const chars = current.characters_played
      return {
        ...prev,
        playerData: {
          ...prev.playerData,
          [playerId]: {
            ...current,
            is_winner: nextIsWinner,
            winning_character: nextIsWinner
              ? (current.winning_character || (chars.length > 0 ? chars[chars.length - 1] : null))
              : null,
          },
        },
      }
    })
  }

  const addCharacter = (playerId, charName) => {
    if (!charName) return
    updatePlayerData(playerId, 'characters_played', [
      ...form.playerData[playerId].characters_played,
      charName,
    ])
  }

  const removeCharacter = (playerId, idx) => {
    updatePlayerData(
      playerId,
      'characters_played',
      form.playerData[playerId].characters_played.filter((_, i) => i !== idx),
    )
  }

  const updateHighscore = (category, field, value) => {
    setForm(prev => ({
      ...prev,
      highscores: {
        ...prev.highscores,
        [category]: { ...prev.highscores[category], [field]: value },
      },
    }))
  }

  const toggleWoodlandPath = (playerId, path) => {
    setForm(prev => {
      const existing = prev.expansionEvents[playerId] ?? emptyPlayerEvents()
      const current = existing.woodland.paths_completed
      const updated = current.includes(path) ? current.filter(p => p !== path) : [...current, path]
      return {
        ...prev,
        expansionEvents: {
          ...prev.expansionEvents,
          [playerId]: { ...existing, woodland: { paths_completed: updated } },
        },
      }
    })
  }

  const toggleDungeonBeaten = (playerId, checked) => {
    setForm(prev => {
      const existing = prev.expansionEvents[playerId] ?? emptyPlayerEvents()
      return {
        ...prev,
        expansionEvents: {
          ...prev.expansionEvents,
          [playerId]: { ...existing, dungeon: { beaten: checked } },
        },
      }
    })
  }

  const handleAddPlayerInline = () => {
    const name = newPlayerName.trim()
    if (!name) return
    addPlayer.mutate(name, {
      onSuccess: (created) => {
        setShowAddPlayer(false)
        setNewPlayerName('')
        togglePlayer(created.id)
      },
    })
  }

  const validationErrors = {
    date: !form.date ? 'Date is required' : null,
    ending_id: !form.ending_id ? 'Ending is required' : null,
    players: form.players.length < 2 ? 'Select at least 2 players' : null,
  }
  const hasErrors = Object.values(validationErrors).some(Boolean)

  const handleSubmit = () => {
    if (hasErrors) return
    if (isEditing) {
      updateGame.mutate(
        { gameId, formState: form },
        { onSuccess: () => navigate(`/games/${gameId}`) },
      )
    } else {
      logGame.mutate(form, {
        onSuccess: (newId) => navigate(`/games/${newId}`),
      })
    }
  }

  const handleDelete = () => {
    if (!confirm('Delete this game? This cannot be undone.')) return
    deleteGame.mutate(gameId, {
      onSuccess: () => navigate('/history'),
    })
  }

  const submitting = logGame.isPending || updateGame.isPending
  const submitError = logGame.error || updateGame.error || deleteGame.error

  const selectedPlayers = form.players.map(id => allPlayers.find(p => p.id === id)).filter(Boolean)
  const charactersByExpansion = allCharacters.reduce((acc, c) => {
    if (!acc[c.expansion]) acc[c.expansion] = []
    acc[c.expansion].push(c)
    return acc
  }, {})

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page title */}
      <div className="mb-8 animate-fade-up">
        <h1 className="font-heading text-3xl text-parchment tracking-wide">
          {isEditing ? 'Edit Game' : 'Log a Game'}
        </h1>
        <div className="ornament-divider mt-3">
          <span className="text-gold-dim">&#9670;</span>
        </div>
      </div>

      <div className="space-y-2">
        {/* ── Game Setup ── */}
        <section className="animate-fade-up delay-1">
          <SectionHeader title="Game Setup" subtitle="When did the battle take place?" />
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-body text-parchment/80 mb-1.5">Date</label>
              <input
                type="date"
                className="input-field"
                value={form.date}
                onChange={e => updateForm('date', e.target.value)}
              />
              {validationErrors.date && (
                <p className="text-danger text-xs mt-1 font-body">{validationErrors.date}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-body text-parchment/80 mb-1.5">Ending Type</label>
              <select
                className="input-field"
                value={form.ending_id}
                onChange={e => updateForm('ending_id', e.target.value)}
              >
                <option value="">Select an ending...</option>
                {allEndings.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.expansion})</option>
                ))}
              </select>
              {validationErrors.ending_id && (
                <p className="text-danger text-xs mt-1 font-body">{validationErrors.ending_id}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-body text-parchment/80 mb-1.5">Notes (optional)</label>
              <textarea
                className="input-field min-h-[80px] resize-y"
                placeholder="Any memorable moments..."
                value={form.notes}
                onChange={e => updateForm('notes', e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* ── Players ── */}
        <section className="animate-fade-up delay-2">
          <SectionHeader title="Players" subtitle="Select 2-5 adventurers" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {allPlayers.map(player => {
              const selected = form.players.includes(player.id)
              return (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => togglePlayer(player.id)}
                  className={`p-3 rounded-lg border text-left font-body transition-all duration-200 ${
                    selected
                      ? 'border-gold bg-gold/10 text-gold'
                      : 'border-gold-dim/20 bg-surface text-parchment/70 hover:border-gold-dim/40'
                  }`}
                >
                  <span className="text-sm font-medium">{player.name}</span>
                  {selected && <span className="ml-2 text-gold/60 text-xs">&#10003;</span>}
                </button>
              )
            })}
            <button
              type="button"
              onClick={() => setShowAddPlayer(true)}
              className="p-3 rounded-lg border border-dashed border-teal/30 text-teal-light/70 hover:border-teal hover:text-teal-light text-sm font-body transition-colors"
            >
              + Add Player
            </button>
          </div>
          {validationErrors.players && (
            <p className="text-danger text-sm mt-2 font-body">{validationErrors.players}</p>
          )}
          {showAddPlayer && (
            <div className="mt-4">
              <div className="flex gap-2">
                <input
                  className="input-field flex-1"
                  placeholder="New player name"
                  value={newPlayerName}
                  onChange={e => setNewPlayerName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddPlayerInline() }}
                  autoFocus
                />
                <button
                  type="button"
                  className="btn-outline text-sm"
                  onClick={() => { setShowAddPlayer(false); setNewPlayerName(''); addPlayer.reset() }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-gold text-sm"
                  onClick={handleAddPlayerInline}
                  disabled={!newPlayerName.trim() || addPlayer.isPending}
                >
                  {addPlayer.isPending ? 'Adding...' : 'Add'}
                </button>
              </div>
              {addPlayer.error && (
                <p className="text-danger text-xs font-body mt-2">{addPlayer.error.message}</p>
              )}
            </div>
          )}
        </section>

        {/* ── Per Player Data ── */}
        {selectedPlayers.length > 0 && (
          <section className="animate-fade-up delay-3">
            <SectionHeader title="Player Details" subtitle="Characters, deaths, and the champion" />
            <div className="space-y-6">
              {selectedPlayers.map(player => {
                const data = form.playerData[player.id]
                if (!data) return null
                return (
                  <div key={player.id} className="bg-surface border border-gold-dim/15 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-heading text-lg text-parchment tracking-wide">{player.name}</h3>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={data.is_winner}
                          onChange={() => toggleWinner(player.id)}
                          className="accent-gold w-4 h-4"
                        />
                        <span className={`text-sm font-body ${data.is_winner ? 'text-gold' : 'text-muted'}`}>
                          Winner
                        </span>
                      </label>
                    </div>

                    {/* Characters played */}
                    <div className="mb-4">
                      <label className="block text-sm font-body text-parchment/70 mb-2">Characters Played (in order)</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {data.characters_played.map((char, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 bg-elevated px-3 py-1 rounded-full text-sm font-body text-parchment/80"
                          >
                            <span className="text-gold-dim text-xs">{idx + 1}.</span>
                            {char}
                            <button
                              type="button"
                              onClick={() => removeCharacter(player.id, idx)}
                              className="text-muted hover:text-danger ml-0.5 transition-colors"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                      <select
                        className="input-field text-sm"
                        value=""
                        onChange={e => addCharacter(player.id, e.target.value)}
                      >
                        <option value="">Add a character...</option>
                        {Object.entries(charactersByExpansion).map(([exp, chars]) => (
                          <optgroup key={exp} label={exp.replace('_', ' ')}>
                            {chars.map(c => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    {/* Deaths */}
                    <div>
                      <label className="block text-sm font-body text-parchment/70 mb-1.5">Total Deaths</label>
                      <input
                        type="number"
                        min="0"
                        className="input-field w-24"
                        value={data.total_deaths}
                        onChange={e => updatePlayerData(player.id, 'total_deaths', parseInt(e.target.value) || 0)}
                      />
                    </div>

                    {/* Winning character override */}
                    {data.is_winner && (
                      <div className="mt-4 p-3 bg-gold/5 border border-gold/20 rounded-lg">
                        <label className="block text-sm font-body text-gold/80 mb-1.5">Winning Character</label>
                        <select
                          className="input-field text-sm"
                          value={data.winning_character || ''}
                          onChange={e => updatePlayerData(player.id, 'winning_character', e.target.value)}
                        >
                          <option value="">Select...</option>
                          {data.characters_played.map((char, idx) => (
                            <option key={idx} value={char}>{char}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Highscores ── */}
        <section className="animate-fade-up delay-4">
          <SectionHeader title="Highscores" subtitle="Notable achievements this game (all optional)" />
          <div className="space-y-4">
            {HIGHSCORE_CATEGORIES.map(cat => (
              <div key={cat.key} className="bg-surface border border-gold-dim/15 rounded-xl p-4">
                <label className="block text-sm font-heading text-parchment/80 tracking-wide mb-3">{cat.label}</label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    className="input-field text-sm"
                    value={form.highscores[cat.key]?.player_id || ''}
                    onChange={e => updateHighscore(cat.key, 'player_id', e.target.value)}
                  >
                    <option value="">Player...</option>
                    {selectedPlayers.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="0"
                    className="input-field text-sm"
                    placeholder="Value"
                    value={form.highscores[cat.key]?.value || ''}
                    onChange={e => updateHighscore(cat.key, 'value', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Expansion Events ── */}
        {selectedPlayers.length > 0 && (
          <section className="animate-fade-up delay-5">
            <SectionHeader title="Expansion Events" subtitle="Per-player woodland paths and dungeon runs" />
            <div className="space-y-4">
              {selectedPlayers.map(player => {
                const events = form.expansionEvents[player.id] ?? emptyPlayerEvents()
                return (
                  <div key={player.id} className="bg-surface border border-gold-dim/15 rounded-xl p-5">
                    <h3 className="font-heading text-lg text-parchment tracking-wide mb-4">{player.name}</h3>

                    <div className="mb-4">
                      <h4 className="font-heading text-xs text-teal-light tracking-wide uppercase mb-2">Woodland — Paths Completed</h4>
                      <div className="flex flex-wrap gap-2">
                        {WOODLAND_PATHS.map(path => {
                          const selected = events.woodland.paths_completed.includes(path)
                          return (
                            <button
                              key={path}
                              type="button"
                              onClick={() => toggleWoodlandPath(player.id, path)}
                              className={`px-3 py-1.5 rounded-full text-sm font-body border transition-colors ${
                                selected
                                  ? 'border-teal bg-teal/15 text-teal-light'
                                  : 'border-gold-dim/20 text-muted hover:border-gold-dim/40'
                              }`}
                            >
                              {path}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-heading text-xs text-teal-light tracking-wide uppercase mb-2">Dungeon</h4>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={events.dungeon.beaten}
                          onChange={e => toggleDungeonBeaten(player.id, e.target.checked)}
                          className="accent-teal w-4 h-4"
                        />
                        <span className="text-sm font-body text-parchment/80">Dungeon Beaten</span>
                      </label>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* ── Review & Submit ── */}
        <section className="animate-fade-up delay-6">
          <SectionHeader title="Review & Submit" />
          <div className="bg-surface border border-gold-dim/15 rounded-xl p-6 space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm font-body">
              <span className="text-muted">Date</span>
              <span className="text-parchment">{form.date || '—'}</span>
              <span className="text-muted">Ending</span>
              <span className="text-parchment">
                {form.ending_id ? allEndings.find(e => e.id === form.ending_id)?.name : '—'}
              </span>
              <span className="text-muted">Players</span>
              <span className="text-parchment">
                {selectedPlayers.length > 0 ? selectedPlayers.map(p => p.name).join(', ') : '—'}
              </span>
              <span className="text-muted">Winner</span>
              <span className="text-gold">
                {(() => {
                  const winners = selectedPlayers.filter(p => form.playerData[p.id]?.is_winner)
                  if (winners.length === 0) return selectedPlayers.length > 0 ? 'Talisman' : '—'
                  return winners.map(p => p.name).join(', ')
                })()}
              </span>
            </div>

            {form.notes && (
              <div className="text-sm font-body">
                <span className="text-muted">Notes: </span>
                <span className="text-parchment/80 italic">{form.notes}</span>
              </div>
            )}

            {/* Player details summary */}
            {selectedPlayers.length > 0 && (
              <div>
                <div className="ornament-divider my-4">
                  <span className="text-gold-dim text-xs">&#9670;</span>
                </div>
                <div className="space-y-2">
                  {selectedPlayers.map(player => {
                    const data = form.playerData[player.id]
                    if (!data) return null
                    return (
                      <div key={player.id} className="flex items-start gap-3 text-sm font-body py-1.5">
                        <span className={`font-medium min-w-[80px] ${data.is_winner ? 'text-gold' : 'text-parchment'}`}>
                          {player.name}{data.is_winner ? ' *' : ''}
                        </span>
                        <span className="text-parchment/60">
                          {data.characters_played.length > 0 ? data.characters_played.join(' → ') : 'No characters'}
                          {' · '}{data.total_deaths} death{data.total_deaths !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {submitError && (
              <p className="text-danger text-sm font-body">{submitError.message}</p>
            )}

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                className="btn-gold"
                onClick={handleSubmit}
                disabled={submitting || hasErrors}
              >
                {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Submit Game'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  className="btn-danger"
                  onClick={handleDelete}
                  disabled={deleteGame.isPending}
                >
                  {deleteGame.isPending ? 'Deleting...' : 'Delete Game'}
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
