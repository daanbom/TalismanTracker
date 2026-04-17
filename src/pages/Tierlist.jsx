import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useIcons } from '../hooks/useIcons'
import { usePlayers } from '../hooks/usePlayers'
import { useTierlist, EMPTY_TIERS } from '../hooks/useTierlist'
import { useSaveTierlist } from '../hooks/useSaveTierlist'

const TIERS = ['S', 'A', 'B', 'C', 'D', 'F']

const TIER_STYLES = {
  S: { label: 'bg-red-900/60 text-red-100 border-red-700/60', row: 'border-red-900/40 bg-red-950/20' },
  A: { label: 'bg-orange-900/60 text-orange-100 border-orange-700/60', row: 'border-orange-900/40 bg-orange-950/20' },
  B: { label: 'bg-yellow-900/60 text-yellow-100 border-yellow-700/60', row: 'border-yellow-900/40 bg-yellow-950/20' },
  C: { label: 'bg-emerald-900/60 text-emerald-100 border-emerald-700/60', row: 'border-emerald-900/40 bg-emerald-950/20' },
  D: { label: 'bg-blue-900/60 text-blue-100 border-blue-700/60', row: 'border-blue-900/40 bg-blue-950/20' },
  F: { label: 'bg-purple-900/60 text-purple-100 border-purple-700/60', row: 'border-purple-900/40 bg-purple-950/20' },
}

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

function CharacterImage({ iconKey, name, className, fallbackTextSize = 'text-xs' }) {
  const [errored, setErrored] = useState(false)
  if (errored) {
    return (
      <div className={`${className} flex items-center justify-center bg-deep`}>
        <span className={`font-heading text-gold-dim ${fallbackTextSize} text-center px-1`}>
          {name}
        </span>
      </div>
    )
  }
  return (
    <img
      src={`/icons/${iconKey}.png`}
      alt={name}
      className={className}
      onError={() => setErrored(true)}
    />
  )
}

function CharacterTile({ icon, onDragStart, onDragEnd, onHover, onTileDrop, isDragging, isPreviewed, dropSide }) {
  const handleDragOver = e => {
    if (!onTileDrop) return
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    const rect = e.currentTarget.getBoundingClientRect()
    const side = e.clientX < rect.left + rect.width / 2 ? 'before' : 'after'
    onTileDrop.hover(icon.key, side)
  }
  const handleDrop = e => {
    if (!onTileDrop) return
    e.preventDefault()
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const side = e.clientX < rect.left + rect.width / 2 ? 'before' : 'after'
    onTileDrop.drop(icon.key, side)
  }
  return (
    <div className="relative">
      {dropSide === 'before' && <div className="absolute -left-1 top-0 bottom-0 w-0.5 bg-gold rounded-full pointer-events-none" />}
      {dropSide === 'after' && <div className="absolute -right-1 top-0 bottom-0 w-0.5 bg-gold rounded-full pointer-events-none" />}
      <div
        draggable
        onDragStart={e => {
          e.dataTransfer.effectAllowed = 'move'
          e.dataTransfer.setData('text/plain', icon.key)
          onDragStart(icon.key)
        }}
        onDragEnd={onDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseEnter={() => onHover(icon.key)}
        onFocus={() => onHover(icon.key)}
        tabIndex={0}
        className={`w-14 h-14 rounded-lg overflow-hidden border bg-deep cursor-grab active:cursor-grabbing transition-colors ${
          isPreviewed ? 'border-gold ring-1 ring-gold/40' : 'border-gold-dim/30 hover:border-gold/60'
        } ${isDragging ? 'opacity-40' : ''}`}
        title={icon.name}
      >
        <CharacterImage
          key={icon.key}
          iconKey={icon.key}
          name={icon.name}
          className="w-full h-full object-cover pointer-events-none"
        />
      </div>
    </div>
  )
}

function CharacterDetailPanel({ icon }) {
  if (!icon) {
    return (
      <div className="bg-surface border border-gold-dim/15 rounded-xl p-5 text-center">
        <p className="text-muted text-sm font-body italic">
          Hover a character to see details.
        </p>
      </div>
    )
  }
  return (
    <div key={icon.key} className="bg-surface border border-gold-dim/20 rounded-xl p-5 flex gap-5 items-start animate-fade-in">
      <div className="w-28 h-28 rounded-lg overflow-hidden border border-gold-dim/30 bg-deep shrink-0">
        <CharacterImage
          key={icon.key}
          iconKey={icon.key}
          name={icon.name}
          className="w-full h-full object-cover"
          fallbackTextSize="text-sm"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-body text-gold-dim uppercase tracking-widest mb-1">
          {EXPANSION_LABELS[icon.expansion] ?? icon.expansion ?? ''}
        </p>
        <h3 className="font-heading text-2xl text-parchment tracking-wide mb-2">{icon.name}</h3>
        <p className="text-sm font-body text-muted italic">
          Character description and card art coming soon.
        </p>
      </div>
    </div>
  )
}

function TierRow({ tier, iconKeys, iconsByKey, onDrop, onDragOver, onDragStart, onDragEnd, onHover, onTileHover, dropTarget, draggingKey, previewKey, isOver }) {
  const style = TIER_STYLES[tier]
  const tileDropApi = {
    hover: (beforeKey, side) => onTileHover(tier, beforeKey, side),
    drop: (beforeKey, side) => onDrop(tier, { beforeKey, side }),
  }
  return (
    <div
      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; onDragOver(tier) }}
      onDrop={e => { e.preventDefault(); onDrop(tier) }}
      className={`flex items-stretch border rounded-lg overflow-hidden transition-colors ${style.row} ${isOver ? 'ring-2 ring-gold/60' : ''}`}
    >
      <div className={`flex items-center justify-center w-16 font-display text-3xl tracking-wider border-r ${style.label}`}>
        {tier}
      </div>
      <div className="flex-1 min-h-[72px] p-2 flex flex-wrap gap-2 items-start">
        {iconKeys.length === 0 ? (
          <span className="text-muted/60 text-xs font-body italic self-center px-2">Drop characters here</span>
        ) : (
          iconKeys.map(key => {
            const icon = iconsByKey.get(key)
            if (!icon) return null
            const isDropTargetTile = dropTarget && dropTarget.tier === tier && dropTarget.beforeKey === key
            return (
              <CharacterTile
                key={key}
                icon={icon}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onHover={onHover}
                onTileDrop={tileDropApi}
                isDragging={draggingKey === key}
                isPreviewed={previewKey === key}
                dropSide={isDropTargetTile ? dropTarget.side : null}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

function Pool({ iconKeys, iconsByKey, onDrop, onDragOver, onDragStart, onDragEnd, onHover, draggingKey, previewKey, isOver }) {
  return (
    <div
      onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; onDragOver('pool') }}
      onDrop={e => { e.preventDefault(); onDrop('pool') }}
      className={`bg-surface border border-gold-dim/20 rounded-xl p-4 transition-colors ${isOver ? 'ring-2 ring-gold/60' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-heading text-lg text-parchment tracking-wide">Character Pool</h2>
        <span className="text-xs font-body text-muted">{iconKeys.length} unranked</span>
      </div>
      <div className="flex flex-wrap gap-2 min-h-[72px]">
        {iconKeys.length === 0 ? (
          <p className="text-muted text-sm font-body italic">All characters ranked.</p>
        ) : (
          iconKeys.map(key => {
            const icon = iconsByKey.get(key)
            if (!icon) return null
            return (
              <CharacterTile
                key={key}
                icon={icon}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onHover={onHover}
                isDragging={draggingKey === key}
                isPreviewed={previewKey === key}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

export default function Tierlist() {
  const { id: playerId } = useParams()
  const navigate = useNavigate()

  const playersQuery = usePlayers()
  const iconsQuery = useIcons()
  const tierlistQuery = useTierlist(playerId)
  const save = useSaveTierlist()

  const player = useMemo(
    () => (playersQuery.data ?? []).find(p => p.id === playerId),
    [playersQuery.data, playerId],
  )

  const iconsByKey = useMemo(() => {
    const map = new Map()
    for (const i of iconsQuery.data ?? []) map.set(i.key, i)
    return map
  }, [iconsQuery.data])

  const [tiers, setTiers] = useState(EMPTY_TIERS)
  const [isDirty, setIsDirty] = useState(false)
  const [draggingKey, setDraggingKey] = useState(null)
  const [overZone, setOverZone] = useState(null)
  const [seededAt, setSeededAt] = useState(null)
  const [previewKey, setPreviewKey] = useState(null)
  const [dropTarget, setDropTarget] = useState(null)

  // Seed local state from server data when it first arrives or changes identity.
  // Filter out any dangling keys (characters renamed/removed in the icons table).
  const queryStamp = tierlistQuery.dataUpdatedAt
  if (tierlistQuery.data && iconsQuery.data && seededAt !== queryStamp) {
    const validKeys = new Set(iconsQuery.data.map(i => i.key))
    const sanitized = {}
    for (const t of TIERS) {
      sanitized[t] = (tierlistQuery.data.tiers[t] ?? []).filter(k => validKeys.has(k))
    }
    setTiers(sanitized)
    setIsDirty(false)
    setSeededAt(queryStamp)
  }

  useEffect(() => {
    if (!isDirty) return
    const handler = e => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  // Auto-scroll the window when dragging near the top/bottom edges of the viewport.
  // The fixed nav bar (h-16 = 64px) covers the top, so the trigger zone starts below it.
  useEffect(() => {
    if (!draggingKey) return
    const NAV_OFFSET = 64
    const EDGE = 100
    const MAX_SPEED = 18
    let cursorY = -1
    let frame = 0
    const onDragOver = e => { cursorY = e.clientY }
    const tick = () => {
      const h = window.innerHeight
      let speed = 0
      if (cursorY >= 0) {
        const topZoneEnd = NAV_OFFSET + EDGE
        if (cursorY < topZoneEnd) {
          const intensity = Math.max(0, (topZoneEnd - cursorY) / EDGE)
          speed = -Math.ceil(intensity * MAX_SPEED)
        } else if (cursorY > h - EDGE) {
          const intensity = Math.min(1, (cursorY - (h - EDGE)) / EDGE)
          speed = Math.ceil(intensity * MAX_SPEED)
        }
      }
      if (speed !== 0) window.scrollBy(0, speed)
      frame = requestAnimationFrame(tick)
    }
    window.addEventListener('dragover', onDragOver)
    frame = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('dragover', onDragOver)
      cancelAnimationFrame(frame)
    }
  }, [draggingKey])

  const placedKeys = useMemo(() => {
    const set = new Set()
    for (const t of TIERS) for (const k of tiers[t] ?? []) set.add(k)
    return set
  }, [tiers])

  const poolKeys = useMemo(() => {
    const all = iconsQuery.data ?? []
    return all.filter(i => !placedKeys.has(i.key)).map(i => i.key)
  }, [iconsQuery.data, placedKeys])

  const handleDragStart = key => setDraggingKey(key)
  const handleDragEnd = () => { setDraggingKey(null); setOverZone(null); setDropTarget(null) }
  const handleDragOver = zone => { setOverZone(zone); setDropTarget(null) }
  const handleTileHover = (tier, beforeKey, side) => {
    setOverZone(tier)
    setDropTarget({ tier, beforeKey, side })
  }
  const handleHover = key => setPreviewKey(key)
  const previewIcon = previewKey ? iconsByKey.get(previewKey) : null

  const handleDrop = (targetZone, opts) => {
    if (!draggingKey) return
    setTiers(prev => {
      const next = {}
      for (const t of TIERS) next[t] = (prev[t] ?? []).filter(k => k !== draggingKey)
      if (targetZone !== 'pool') {
        const tierArr = next[targetZone]
        if (opts && opts.beforeKey && opts.beforeKey !== draggingKey) {
          let idx = tierArr.indexOf(opts.beforeKey)
          if (idx === -1) idx = tierArr.length
          if (opts.side === 'after') idx += 1
          next[targetZone] = [...tierArr.slice(0, idx), draggingKey, ...tierArr.slice(idx)]
        } else {
          next[targetZone] = [...tierArr, draggingKey]
        }
      }
      return next
    })
    setIsDirty(true)
    setDraggingKey(null)
    setOverZone(null)
    setDropTarget(null)
  }

  const handleSave = () => {
    save.mutate(
      { playerId, tiers },
      { onSuccess: () => setIsDirty(false) },
    )
  }

  const handleBack = e => {
    if (isDirty && !window.confirm('You have unsaved changes. Leave anyway?')) {
      e.preventDefault()
      return
    }
    navigate('/players')
  }

  const error = playersQuery.error || iconsQuery.error || tierlistQuery.error || save.error

  if (!playersQuery.isLoading && !player) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-muted text-sm font-body italic">Player not found.</p>
        <Link to="/players" className="text-gold hover:text-gold-light text-sm font-body mt-4 inline-block">← Back to Players</Link>
      </div>
    )
  }

  const isLoading = playersQuery.isLoading || iconsQuery.isLoading || tierlistQuery.isLoading

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 animate-fade-up">
        <button
          onClick={handleBack}
          className="text-gold-dim hover:text-gold text-sm font-body transition-colors mb-3"
        >
          ← Back to Players
        </button>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-3xl text-parchment tracking-wide">
              {player ? `${player.name}'s Tierlist` : 'Tierlist'}
            </h1>
            <p className="text-muted text-sm font-body mt-1">
              Drag characters between tiers. Hover a portrait for details.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isDirty && <span className="text-xs font-body text-gold-dim italic">Unsaved changes</span>}
            <button
              onClick={handleSave}
              disabled={!isDirty || save.isPending}
              className="btn-gold text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              {save.isPending ? 'Saving...' : 'Save Tierlist'}
            </button>
          </div>
        </div>
        <div className="ornament-divider mt-4">
          <span className="text-gold-dim">&#9670;</span>
        </div>
      </div>

      {error && (
        <p className="text-danger text-sm font-body mb-4">{error.message}</p>
      )}

      {isLoading ? (
        <p className="text-muted text-sm font-body italic">Loading...</p>
      ) : (
        <div className="space-y-3 animate-fade-up delay-1">
          {TIERS.map(t => (
            <TierRow
              key={t}
              tier={t}
              iconKeys={tiers[t] ?? []}
              iconsByKey={iconsByKey}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onHover={handleHover}
              onTileHover={handleTileHover}
              dropTarget={dropTarget}
              draggingKey={draggingKey}
              previewKey={previewKey}
              isOver={overZone === t}
            />
          ))}

          <div className="pt-4">
            <CharacterDetailPanel icon={previewIcon} />
          </div>

          <div className="pt-4">
            <Pool
              iconKeys={poolKeys}
              iconsByKey={iconsByKey}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onHover={handleHover}
              draggingKey={draggingKey}
              previewKey={previewKey}
              isOver={overZone === 'pool'}
            />
          </div>
        </div>
      )}
    </div>
  )
}
