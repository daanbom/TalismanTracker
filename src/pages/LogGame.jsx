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
  { key: 'most_strength', label: 'Most Strength' },
  { key: 'most_craft', label: 'Most Craft' },
  { key: 'most_life', label: 'Most Life' },
  { key: 'most_deaths', label: 'Most Deaths' },
  { key: 'most_toad_times', label: 'Most Times Turned Into Toad' },
  { key: 'longest_toad_streak', label: 'Longest Toad Streak' },
  { key: 'most_denizens_on_spot', label: 'Most Denizens on Spot', gameLevel: true },
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
  optional_expansions: [],
  players: [],
  playerData: {},
  highscores: {},
  expansionEvents: {},
}

const emptyPlayerEvents = () => ({
  woodland: { paths_completed: [] },
  dungeon: { beaten: false, character: null },
})

const OPTIONAL_EXPANSIONS = [
  { key: 'dragon', label: 'The Dragon' },
  { key: 'harbinger', label: 'The Harbinger' },
]

function SectionHeader({ title, subtitle }) {
  return (
    <div className="section-header">
      <h2 className="font-heading text-xl text-gold tracking-wide">{title}</h2>
      {subtitle && <p className="text-muted text-sm mt-1 font-body">{subtitle}</p>}
    </div>
  )
}

function StepNode({ number, label, status }) {
  const isActive = status === 'active'
  const isDone = status === 'done'
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={[
        'w-9 h-9 rounded-full flex items-center justify-center font-heading text-sm font-bold border-2 transition-all duration-300',
        isActive ? 'border-gold bg-gold text-deep shadow-[0_0_16px_rgba(201,168,76,0.4)]' : '',
        isDone ? 'border-gold bg-gold/20 text-gold' : '',
        !isActive && !isDone ? 'border-gold-dim/40 bg-transparent text-muted' : '',
      ].filter(Boolean).join(' ')}>
        {isDone ? '\u2713' : number}
      </div>
      <span className={`text-xs font-body tracking-wide whitespace-nowrap ${isActive ? 'text-gold' : 'text-muted'}`}>
        {label}
      </span>
    </div>
  )
}

function StepIndicator({ step }) {
  return (
    <div className="flex items-center justify-center mb-10 animate-fade-up">
      <StepNode number={1} label="Game Details" status={step > 1 ? 'done' : 'active'} />
      <div className={`w-24 h-px mx-3 transition-all duration-500 ${step > 1 ? 'bg-gold' : 'bg-gold-dim/30'}`} />
      <StepNode number={2} label="Highscores" status={step === 2 ? 'active' : 'idle'} />
    </div>
  )
}

export default function LogGame({ initialData, isEditing, gameId }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [step1Attempted, setStep1Attempted] = useState(false)
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

  const addHighscoreEntry = (category) => {
    setForm(prev => ({
      ...prev,
      highscores: {
        ...prev.highscores,
        [category]: [...(prev.highscores[category] || []), { player_id: '', value: '' }],
      },
    }))
  }

  const updateHighscoreEntry = (category, idx, field, value) => {
    setForm(prev => {
      const entries = [...(prev.highscores[category] || [])]
      entries[idx] = { ...entries[idx], [field]: value }
      return { ...prev, highscores: { ...prev.highscores, [category]: entries } }
    })
  }

  const removeHighscoreEntry = (category, idx) => {
    setForm(prev => {
      const entries = (prev.highscores[category] || []).filter((_, i) => i !== idx)
      const highscores = { ...prev.highscores }
      if (entries.length === 0) {
        delete highscores[category]
      } else {
        highscores[category] = entries
      }
      return { ...prev, highscores }
    })
  }

  const toggleWoodlandPath = (playerId, path) => {
    setForm(prev => {
      const existing = prev.expansionEvents[playerId] ?? emptyPlayerEvents()
      const current = existing.woodland.paths_completed
      const idx = current.findIndex(e => e.path === path)
      const playedChars = prev.playerData[playerId]?.characters_played ?? []
      const fallbackChar = playedChars.length === 1 ? playedChars[0] : null
      const updated = idx >= 0
        ? current.filter((_, i) => i !== idx)
        : [...current, { path, character: fallbackChar }]
      return {
        ...prev,
        expansionEvents: {
          ...prev.expansionEvents,
          [playerId]: { ...existing, woodland: { paths_completed: updated } },
        },
      }
    })
  }

  const setWoodlandPathCharacter = (playerId, path, character) => {
    setForm(prev => {
      const existing = prev.expansionEvents[playerId] ?? emptyPlayerEvents()
      const updated = existing.woodland.paths_completed.map(e =>
        e.path === path ? { ...e, character: character || null } : e,
      )
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
      const playedChars = prev.playerData[playerId]?.characters_played ?? []
      const fallbackChar = playedChars.length === 1 ? playedChars[0] : null
      return {
        ...prev,
        expansionEvents: {
          ...prev.expansionEvents,
          [playerId]: {
            ...existing,
            dungeon: checked
              ? { beaten: true, character: existing.dungeon.character || fallbackChar }
              : { beaten: false, character: null },
          },
        },
      }
    })
  }

  const setDungeonCharacter = (playerId, character) => {
    setForm(prev => {
      const existing = prev.expansionEvents[playerId] ?? emptyPlayerEvents()
      return {
        ...prev,
        expansionEvents: {
          ...prev.expansionEvents,
          [playerId]: {
            ...existing,
            dungeon: { ...existing.dungeon, character: character || null },
          },
        },
      }
    })
  }

  const toggleOptionalExpansion = (key) => {
    setForm(prev => {
      const current = prev.optional_expansions ?? []
      return {
        ...prev,
        optional_expansions: current.includes(key)
          ? current.filter(k => k !== key)
          : [...current, key],
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

  const playersWithNoCharacter = form.players.filter(
    id => !form.playerData[id]?.characters_played?.length,
  )
  const playersWithInvalidDeaths = form.players.filter(id => {
    const pd = form.playerData[id]
    if (!pd) return false
    const n = pd.characters_played?.length ?? 0
    if (n === 0) return false
    const d = Number(pd.total_deaths ?? 0)
    return d !== n && d !== n - 1
  })
  const step1Errors = {
    date: !form.date ? 'Date is required' : null,
    ending_id: !form.ending_id ? 'Ending is required' : null,
    players: form.players.length < 2 ? 'Select at least 2 players' : null,
    characters: playersWithNoCharacter.length > 0
      ? 'Every player needs at least one character'
      : null,
    deaths: playersWithInvalidDeaths.length > 0
      ? 'Total deaths must equal characters played or one less'
      : null,
  }
  const step1HasErrors = Object.values(step1Errors).some(Boolean)

  const handleSubmit = () => {
    if (step1HasErrors || hasHighscoreDuplicates || hasHighscoreMissingPlayer) return
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

  const totalHighscoreEntries = Object.values(form.highscores).reduce(
    (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
    0,
  )

  const highscoreDuplicates = HIGHSCORE_CATEGORIES.reduce((acc, cat) => {
    if (cat.gameLevel) return acc
    const entries = form.highscores[cat.key] || []
    const seen = new Set()
    for (const entry of entries) {
      if (!entry.player_id) continue
      if (seen.has(entry.player_id)) { acc[cat.key] = true; break }
      seen.add(entry.player_id)
    }
    return acc
  }, {})

  const highscoreMissingPlayer = HIGHSCORE_CATEGORIES.reduce((acc, cat) => {
    if (cat.gameLevel) return acc
    const entries = form.highscores[cat.key] || []
    const hasMissing = entries.some(e => (e.value !== '' && e.value != null) && !e.player_id)
    if (hasMissing) acc[cat.key] = true
    return acc
  }, {})

  const hasHighscoreDuplicates = Object.keys(highscoreDuplicates).length > 0
  const hasHighscoreMissingPlayer = Object.keys(highscoreMissingPlayer).length > 0

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 animate-fade-up">
        <h1 className="font-heading text-3xl text-parchment tracking-wide">
          {isEditing ? 'Edit Game' : 'Log a Game'}
        </h1>
        <div className="ornament-divider mt-3">
          <span className="text-gold-dim">&#9670;</span>
        </div>
      </div>

      <StepIndicator step={step} />

      {/* ── STEP 1: Game Details ── */}
      {step === 1 && (
        <div className="space-y-2">
          {/* Game Setup */}
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
                {step1Attempted && step1Errors.date && (
                  <p className="text-danger text-xs mt-1 font-body">{step1Errors.date}</p>
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
                {step1Attempted && step1Errors.ending_id && (
                  <p className="text-danger text-xs mt-1 font-body">{step1Errors.ending_id}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-body text-parchment/80 mb-1.5">Optional Expansions</label>
                <div className="flex flex-wrap gap-2">
                  {OPTIONAL_EXPANSIONS.map(opt => {
                    const selected = (form.optional_expansions ?? []).includes(opt.key)
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => toggleOptionalExpansion(opt.key)}
                        className={`px-3 py-1.5 rounded-full text-sm font-body border transition-colors ${
                          selected
                            ? 'border-gold bg-gold/10 text-gold'
                            : 'border-gold-dim/20 text-muted hover:border-gold-dim/40'
                        }`}
                      >
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
                <p className="text-muted text-xs mt-1.5 font-body">
                  Only check what was actually in play, everything else is assumed on.
                </p>
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

          {/* Players */}
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
            {step1Attempted && step1Errors.players && (
              <p className="text-danger text-sm mt-2 font-body">{step1Errors.players}</p>
            )}
            {showAddPlayer && (
              <div className="mt-4">
                <div className="space-y-2">
                  <input
                    className="input-field w-full"
                    placeholder="New player name"
                    value={newPlayerName}
                    onChange={e => setNewPlayerName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddPlayerInline() }}
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end">
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
                </div>
                {addPlayer.error && (
                  <p className="text-danger text-xs font-body mt-2">{addPlayer.error.message}</p>
                )}
              </div>
            )}
          </section>

          {/* Per Player Data (includes expansion events) */}
          {selectedPlayers.length > 0 && (
            <section className="animate-fade-up delay-3">
              <SectionHeader title="Player Details" subtitle="Characters, deaths, expansions, and the champion" />
              <div className="space-y-6">
                {selectedPlayers.map(player => {
                  const data = form.playerData[player.id]
                  const events = form.expansionEvents[player.id] ?? emptyPlayerEvents()
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
                        <select
                          className="input-field text-sm"
                          value=""
                          onChange={e => addCharacter(player.id, e.target.value)}
                        >
                          <option value="">Add a character...</option>
                          {orderedExpansions.map(exp => (
                            <optgroup key={exp} label={exp}>
                              {charactersByExpansion[exp].map(c => (
                                <option key={c.id} value={c.name}>{c.name}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        {data.characters_played.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
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
                        )}
                        {step1Attempted && playersWithNoCharacter.includes(player.id) && (
                          <p className="text-danger text-xs mt-1.5 font-body">Add at least one character</p>
                        )}
                      </div>

                      {/* Deaths */}
                      <div className="mb-4">
                        <label className="block text-sm font-body text-parchment/70 mb-1.5">Total Deaths</label>
                        <input
                          type="number"
                          min="0"
                          className="input-field w-24"
                          value={data.total_deaths}
                          onChange={e => updatePlayerData(player.id, 'total_deaths', parseInt(e.target.value) || 0)}
                        />
                        {step1Attempted && playersWithInvalidDeaths.includes(player.id) && (
                          <p className="text-danger text-xs mt-1.5 font-body">
                            Must be {Math.max(0, data.characters_played.length - 1)} or {data.characters_played.length}
                          </p>
                        )}
                      </div>

                      {/* Winning character override */}
                      {data.is_winner && (
                        <div className="mb-4 p-3 bg-gold/5 border border-gold/20 rounded-lg">
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

                      {/* Expansion Events */}
                      <div className="border-t border-gold-dim/15 pt-4 mt-2">
                        <p className="text-xs font-heading text-muted uppercase tracking-widest mb-3">Expansion Events</p>

                        <div className="mb-3">
                          <h4 className="font-heading text-xs text-teal-light tracking-wide uppercase mb-2">Woodland, Paths Completed</h4>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {WOODLAND_PATHS.map(path => {
                              const entry = events.woodland.paths_completed.find(e => e.path === path)
                              const selected = !!entry
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
                          {events.woodland.paths_completed.length > 0 && data.characters_played.length > 1 && (
                            <div className="space-y-1.5 mt-2">
                              {events.woodland.paths_completed.map(entry => (
                                <div key={entry.path} className="flex items-center gap-2">
                                  <span className="text-xs font-body text-muted min-w-[120px]">{entry.path}</span>
                                  <select
                                    className="input-field text-xs py-1 flex-1"
                                    value={entry.character || ''}
                                    onChange={e => setWoodlandPathCharacter(player.id, entry.path, e.target.value)}
                                  >
                                    <option value="">Which character?</option>
                                    {data.characters_played.map((c, i) => (
                                      <option key={`${c}-${i}`} value={c}>{c}</option>
                                    ))}
                                  </select>
                                </div>
                              ))}
                            </div>
                          )}
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
                          {events.dungeon.beaten && data.characters_played.length > 1 && (
                            <div className="mt-2">
                              <select
                                className="input-field text-xs py-1"
                                value={events.dungeon.character || ''}
                                onChange={e => setDungeonCharacter(player.id, e.target.value)}
                              >
                                <option value="">Which character?</option>
                                {data.characters_played.map((c, i) => (
                                  <option key={`${c}-${i}`} value={c}>{c}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Step 1 footer */}
          <div className="pt-6 pb-2 animate-fade-up delay-4">
            <button
              type="button"
              className="btn-gold w-full"
              onClick={() => {
                setStep1Attempted(true)
                if (!step1HasErrors) setStep(2)
              }}
            >
              Continue to Highscores &#8594;
            </button>
            {step1Attempted && step1HasErrors && (
              <ul className="mt-3 space-y-1">
                {Object.values(step1Errors).filter(Boolean).map((msg, i) => (
                  <li key={i} className="text-danger text-xs font-body flex items-center gap-1.5">
                    <span className="text-danger/60">&#8212;</span> {msg}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 2: Highscores ── */}
      {step === 2 && (
        <div className="animate-fade-up">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-heading text-xl text-gold tracking-wide">Records &amp; Highscores</h2>
                <p className="text-muted text-sm mt-1 font-body">
                  Multiple players can share a record. All categories are optional.
                </p>
              </div>
              {totalHighscoreEntries > 0 && (
                <div className="flex items-center gap-2 bg-gold/10 border border-gold/20 px-3 py-1.5 rounded-full flex-shrink-0 ml-4">
                  <span className="text-gold font-heading text-sm">{totalHighscoreEntries}</span>
                  <span className="text-gold/70 text-xs font-body">
                    record{totalHighscoreEntries !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
            <div className="ornament-divider mt-4">
              <span className="text-gold-dim">&#9670;</span>
            </div>
          </div>

          {/* Category cards */}
          <div className="space-y-3 mb-8">
            {HIGHSCORE_CATEGORIES.map((cat, i) => {
              const entries = form.highscores[cat.key] || []
              const hasEntries = entries.length > 0
              return (
                <div
                  key={cat.key}
                  className={[
                    'rounded-xl border transition-all duration-300',
                    highscoreDuplicates[cat.key] || highscoreMissingPlayer[cat.key]
                      ? 'border-danger/50 bg-surface'
                      : hasEntries
                        ? 'border-gold/30 bg-gradient-to-r from-gold/5 to-transparent shadow-[0_0_24px_rgba(201,168,76,0.07)]'
                        : 'border-gold-dim/15 bg-surface',
                  ].join(' ')}
                >
                  <div className="p-4">
                    {/* Category header row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`text-xs font-heading tabular-nums flex-shrink-0 ${hasEntries ? 'text-gold' : 'text-muted'}`}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <h3 className={`font-heading text-sm tracking-wide truncate ${hasEntries ? 'text-parchment' : 'text-parchment/60'}`}>
                          {cat.label}
                        </h3>
                        {hasEntries && (
                          <span className="flex-shrink-0 text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full font-body">
                            {entries.length}
                          </span>
                        )}
                        {cat.gameLevel && (
                          <span className="flex-shrink-0 text-xs bg-teal/10 text-teal-light px-2 py-0.5 rounded-full font-body">
                            game
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => addHighscoreEntry(cat.key)}
                        className="flex-shrink-0 ml-3 text-xs font-body text-teal-light hover:text-teal border border-teal/30 hover:border-teal/60 hover:bg-teal/5 px-2.5 py-1 rounded-md transition-colors"
                      >
                        + Add
                      </button>
                    </div>

                    {highscoreDuplicates[cat.key] && (
                      <p className="text-danger text-xs font-body mt-2">A player can only appear once per category</p>
                    )}
                    {highscoreMissingPlayer[cat.key] && (
                      <p className="text-danger text-xs font-body mt-2">Select a player for every entry</p>
                    )}

                    {/* Entries */}
                    {entries.length > 0 && (
                      <div className="space-y-2 mt-3 pt-3 border-t border-gold-dim/10">
                        {entries.map((entry, idx) => (
                          <div
                            key={idx}
                            className={`grid gap-2 items-center animate-fade-in ${cat.gameLevel ? 'grid-cols-[1fr_2rem]' : 'grid-cols-[3fr_7fr_2rem]'}`}
                          >
                            {!cat.gameLevel && (
                              <select
                                className="input-field text-sm min-w-0"
                                value={entry.player_id}
                                onChange={e => updateHighscoreEntry(cat.key, idx, 'player_id', e.target.value)}
                              >
                                <option value="">Player...</option>
                                {selectedPlayers.map(p => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </select>
                            )}
                            <input
                              type="number"
                              min="0"
                              className="input-field text-sm min-w-0"
                              placeholder="Value"
                              value={entry.value}
                              onChange={e => updateHighscoreEntry(cat.key, idx, 'value', e.target.value)}
                            />
                            <button
                              type="button"
                              onClick={() => removeHighscoreEntry(cat.key, idx)}
                              className="text-lg leading-none text-muted hover:text-danger transition-colors p-1 hover:bg-danger/10 rounded-md justify-self-center"
                            >
                              &times;
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Review summary */}
          <div className="bg-surface border border-gold-dim/15 rounded-xl p-6 mb-6">
            <h3 className="font-heading text-base text-parchment tracking-wide mb-4">Summary</h3>
            <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm font-body">
              <span className="text-muted">Date</span>
              <span className="text-parchment">{form.date || 'NA'}</span>
              <span className="text-muted">Ending</span>
              <span className="text-parchment">
                {form.ending_id ? allEndings.find(e => e.id === form.ending_id)?.name : 'NA'}
              </span>
              <span className="text-muted">Players</span>
              <span className="text-parchment">
                {selectedPlayers.length > 0 ? selectedPlayers.map(p => p.name).join(', ') : 'NA'}
              </span>
              <span className="text-muted">Winner</span>
              <span className="text-gold">
                {(() => {
                  const winners = selectedPlayers.filter(p => form.playerData[p.id]?.is_winner)
                  if (winners.length === 0) return selectedPlayers.length > 0 ? 'Talisman' : 'NA'
                  return winners.map(p => p.name).join(', ')
                })()}
              </span>
            </div>

            {selectedPlayers.length > 0 && (
              <>
                <div className="ornament-divider my-4">
                  <span className="text-gold-dim text-xs">&#9670;</span>
                </div>
                <div className="space-y-2">
                  {selectedPlayers.map(player => {
                    const data = form.playerData[player.id]
                    if (!data) return null
                    return (
                      <div key={player.id} className="flex items-start gap-3 text-sm font-body py-1">
                        <span className={`font-medium min-w-[80px] ${data.is_winner ? 'text-gold' : 'text-parchment'}`}>
                          {player.name}{data.is_winner ? ' *' : ''}
                        </span>
                        <span className="text-parchment/60">
                          {data.characters_played.length > 0 ? data.characters_played.join(' \u2192 ') : 'No characters'}
                          {' \u00b7 '}{data.total_deaths} death{data.total_deaths !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {totalHighscoreEntries > 0 && (
              <>
                <div className="ornament-divider my-4">
                  <span className="text-gold-dim text-xs">&#9670;</span>
                </div>
                <p className="text-xs font-heading text-muted uppercase tracking-widest mb-2">Highscores</p>
                <div className="space-y-1">
                  {HIGHSCORE_CATEGORIES.map(cat => {
                    const entries = (form.highscores[cat.key] || []).filter(e => e.value !== '' && e.value != null && (cat.gameLevel || e.player_id))
                    if (entries.length === 0) return null
                    return (
                      <div key={cat.key} className="flex items-start gap-2 text-sm font-body">
                        <span className="text-muted min-w-[140px]">{cat.label}</span>
                        <span className="text-parchment/80">
                          {entries.map(e => {
                            const name = cat.gameLevel ? null : allPlayers.find(p => p.id === e.player_id)?.name
                            return name ? `${name} (${e.value})` : e.value
                          }).join(', ')}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {form.notes && (
              <p className="text-sm font-body mt-3 text-parchment/60 italic">
                &ldquo;{form.notes}&rdquo;
              </p>
            )}
          </div>

          {submitError && (
            <p className="text-danger text-sm font-body mb-4">{submitError.message}</p>
          )}

          {/* Step 2 footer */}
          <div className="flex gap-3">
            <button
              type="button"
              className="btn-outline"
              onClick={() => setStep(1)}
            >
              &#8592; Back
            </button>
            <button
              type="button"
              className="btn-gold flex-1"
              onClick={handleSubmit}
              disabled={submitting}
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
                {deleteGame.isPending ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
