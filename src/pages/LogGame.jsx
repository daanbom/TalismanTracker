import { useState } from 'react'
import { MOCK_PLAYERS, MOCK_CHARACTERS, MOCK_ENDINGS, HIGHSCORE_CATEGORIES, WOODLAND_PATHS } from '../lib/mockData'

const INITIAL_STATE = {
  date: new Date().toISOString().split('T')[0],
  ending_id: '',
  notes: '',
  players: [],
  playerData: {},
  highscores: {},
  expansionEvents: {
    woodland: { paths_completed: [] },
    dungeon: { beaten: false, detail: '' },
  },
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="section-header">
      <h2 className="font-heading text-xl text-gold tracking-wide">{title}</h2>
      {subtitle && <p className="text-muted text-sm mt-1 font-body">{subtitle}</p>}
    </div>
  )
}

export default function LogGame({ initialData, isEditing }) {
  const [form, setForm] = useState(initialData || INITIAL_STATE)
  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [newPlayerName, setNewPlayerName] = useState('')

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const togglePlayer = (playerId) => {
    setForm(prev => {
      const exists = prev.players.includes(playerId)
      const players = exists
        ? prev.players.filter(id => id !== playerId)
        : prev.players.length < 5 ? [...prev.players, playerId] : prev.players
      const playerData = { ...prev.playerData }
      if (!exists) {
        playerData[playerId] = { characters_played: [], total_deaths: 0, is_winner: false, winning_character: null }
      } else {
        delete playerData[playerId]
      }
      return { ...prev, players, playerData }
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

  const setWinner = (playerId) => {
    setForm(prev => {
      const playerData = { ...prev.playerData }
      for (const id of prev.players) {
        playerData[id] = { ...playerData[id], is_winner: id === playerId }
        if (id === playerId) {
          const chars = playerData[id].characters_played
          playerData[id].winning_character = chars.length > 0 ? chars[chars.length - 1] : null
        } else {
          playerData[id].winning_character = null
        }
      }
      return { ...prev, playerData }
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

  const toggleWoodlandPath = (path) => {
    setForm(prev => {
      const current = prev.expansionEvents.woodland.paths_completed
      const updated = current.includes(path) ? current.filter(p => p !== path) : [...current, path]
      return { ...prev, expansionEvents: { ...prev.expansionEvents, woodland: { paths_completed: updated } } }
    })
  }

  const selectedPlayers = form.players.map(id => MOCK_PLAYERS.find(p => p.id === id)).filter(Boolean)
  const charactersByExpansion = MOCK_CHARACTERS.reduce((acc, c) => {
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
            </div>
            <div>
              <label className="block text-sm font-body text-parchment/80 mb-1.5">Ending Type</label>
              <select
                className="input-field"
                value={form.ending_id}
                onChange={e => updateForm('ending_id', e.target.value)}
              >
                <option value="">Select an ending...</option>
                {MOCK_ENDINGS.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.expansion})</option>
                ))}
              </select>
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
            {MOCK_PLAYERS.map(player => {
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
          {form.players.length > 0 && form.players.length < 2 && (
            <p className="text-danger text-sm mt-2 font-body">At least 2 players required</p>
          )}
          {showAddPlayer && (
            <div className="mt-4 flex gap-2">
              <input
                className="input-field flex-1"
                placeholder="New player name"
                value={newPlayerName}
                onChange={e => setNewPlayerName(e.target.value)}
              />
              <button type="button" className="btn-outline text-sm" onClick={() => { setShowAddPlayer(false); setNewPlayerName('') }}>
                Cancel
              </button>
              <button type="button" className="btn-gold text-sm" onClick={() => { setShowAddPlayer(false); setNewPlayerName('') }}>
                Add
              </button>
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
                          type="radio"
                          name="winner"
                          checked={data.is_winner}
                          onChange={() => setWinner(player.id)}
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
        <section className="animate-fade-up delay-5">
          <SectionHeader title="Expansion Events" subtitle="Did anything noteworthy happen?" />
          <div className="space-y-4">
            {/* Woodland */}
            <div className="bg-surface border border-gold-dim/15 rounded-xl p-4">
              <h4 className="font-heading text-sm text-teal-light tracking-wide mb-3">Woodland — Paths Completed</h4>
              <div className="flex flex-wrap gap-2">
                {WOODLAND_PATHS.map(path => {
                  const selected = form.expansionEvents.woodland.paths_completed.includes(path)
                  return (
                    <button
                      key={path}
                      type="button"
                      onClick={() => toggleWoodlandPath(path)}
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

            {/* Dungeon */}
            <div className="bg-surface border border-gold-dim/15 rounded-xl p-4">
              <h4 className="font-heading text-sm text-teal-light tracking-wide mb-3">Dungeon</h4>
              <label className="flex items-center gap-3 mb-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.expansionEvents.dungeon.beaten}
                  onChange={e => setForm(prev => ({
                    ...prev,
                    expansionEvents: {
                      ...prev.expansionEvents,
                      dungeon: { ...prev.expansionEvents.dungeon, beaten: e.target.checked },
                    },
                  }))}
                  className="accent-teal w-4 h-4"
                />
                <span className="text-sm font-body text-parchment/80">Dungeon Beaten</span>
              </label>
              {form.expansionEvents.dungeon.beaten && (
                <input
                  className="input-field text-sm"
                  placeholder="Floor / detail (optional)"
                  value={form.expansionEvents.dungeon.detail}
                  onChange={e => setForm(prev => ({
                    ...prev,
                    expansionEvents: {
                      ...prev.expansionEvents,
                      dungeon: { ...prev.expansionEvents.dungeon, detail: e.target.value },
                    },
                  }))}
                />
              )}
            </div>
          </div>
        </section>

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
                {form.ending_id ? MOCK_ENDINGS.find(e => e.id === form.ending_id)?.name : '—'}
              </span>
              <span className="text-muted">Players</span>
              <span className="text-parchment">
                {selectedPlayers.length > 0 ? selectedPlayers.map(p => p.name).join(', ') : '—'}
              </span>
              <span className="text-muted">Winner</span>
              <span className="text-gold">
                {selectedPlayers.find(p => form.playerData[p.id]?.is_winner)?.name || '—'}
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

            <div className="pt-4 flex gap-3">
              <button type="button" className="btn-gold">
                {isEditing ? 'Save Changes' : 'Submit Game'}
              </button>
              {isEditing && (
                <button type="button" className="btn-danger">
                  Delete Game
                </button>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
