import { useState, useMemo, memo } from 'react'
import { AVAILABLE_ICONS } from '../data/availableIcons'

const EXPANSION_ORDER = [
  'base', 'reaper', 'dungeon', 'highland', 'sacred_pool',
  'harbinger', 'frostmarch', 'nether', 'clockwork', 'blood_moon', 'city', 'woodland',
]

const EXPANSION_LABELS = {
  base: 'Base Game',
  reaper: 'The Reaper',
  dungeon: 'The Dungeon',
  highland: 'The Highland',
  sacred_pool: 'The Sacred Pool',
  harbinger: 'The Harbinger',
  frostmarch: 'The Frostmarch',
  nether: 'The Nether Realm',
  clockwork: 'The Clockwork Kingdom',
  blood_moon: 'The Blood Moon',
  city: 'The City',
  woodland: 'The Woodland',
}

const CharacterTile = memo(function CharacterTile({ icon, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(icon)}
      className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-colors ${
        selected
          ? 'border-gold bg-gold/10'
          : 'border-gold-dim/20 hover:border-gold-dim/50 hover:bg-elevated'
      }`}
    >
      <img
        src={`/icons/${icon.key}.png`}
        alt={icon.name}
        className="w-12 h-12 rounded object-cover bg-deep"
      />
      <span className="text-[10px] font-body text-muted leading-tight text-center w-14 truncate">
        {icon.name}
      </span>
    </button>
  )
})

export function IconPicker({ currentKey, onSelect, onClose }) {
  const [search, setSearch] = useState('')

  const grouped = useMemo(() => {
    const q = search.toLowerCase()
    const filtered = q
      ? AVAILABLE_ICONS.filter(i => i.name.toLowerCase().includes(q))
      : AVAILABLE_ICONS
    const map = {}
    for (const icon of filtered) {
      if (!map[icon.expansion]) map[icon.expansion] = []
      map[icon.expansion].push(icon)
    }
    return map
  }, [search])

  const expansionKeys = search
    ? Object.keys(grouped)
    : EXPANSION_ORDER.filter(e => grouped[e]?.length)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-deep/80" onClick={onClose} />
      <div className="relative bg-surface border border-gold-dim/20 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-fade-up">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gold-dim/10">
          <h2 className="font-heading text-lg text-parchment tracking-wide">Choose Icon</h2>
          <button onClick={onClose} className="text-muted hover:text-parchment transition-colors text-xl leading-none">✕</button>
        </div>

        <div className="px-5 py-3 border-b border-gold-dim/10">
          <input
            className="input-field w-full"
            placeholder="Search characters..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          {expansionKeys.length === 0 ? (
            <p className="text-muted text-sm font-body text-center py-8">No icons available. Add PNG files to public/icons/ and run the generate script.</p>
          ) : (
            expansionKeys.map(exp => (
              <div key={exp}>
                <p className="text-xs font-body text-gold-dim uppercase tracking-widest mb-2">
                  {EXPANSION_LABELS[exp] ?? exp}
                </p>
                <div className="flex flex-wrap gap-2">
                  {grouped[exp].map(icon => (
                    <CharacterTile
                      key={icon.key}
                      icon={icon}
                      selected={icon.key === currentKey}
                      onSelect={i => onSelect(i.key, null)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {currentKey && (
          <div className="px-5 py-3 border-t border-gold-dim/10">
            <button
              onClick={() => onSelect(null, null)}
              className="text-sm font-body text-muted hover:text-danger transition-colors"
            >
              Remove icon
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
