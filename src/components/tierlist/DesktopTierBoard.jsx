import { useEffect, useState } from 'react'
import {
  DetailPanel,
  EntityImage,
} from './tierlistShared'
import {
  TIERS,
  TIER_STYLES,
  tileSrcFor,
} from './tierlistConfig'

function TierTile({
  item,
  listType,
  onDragStart,
  onDragEnd,
  onHover,
  onTileDrop,
  isDragging,
  isPreviewed,
  dropSide,
  isReadOnly = false,
}) {
  const isPet = listType === 'pet'
  const tileFrameClass = isPet ? 'w-12 h-16 rounded-md' : 'w-14 h-14 rounded-lg'
  const tileImageClass = isPet
    ? 'w-full h-full object-contain pointer-events-none p-0.5 bg-surface'
    : 'w-full h-full object-cover pointer-events-none'

  const handleDragOver = e => {
    if (!onTileDrop || isReadOnly) return
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    const rect = e.currentTarget.getBoundingClientRect()
    const side = e.clientX < rect.left + rect.width / 2 ? 'before' : 'after'
    onTileDrop.hover(item.key, side)
  }

  const handleDrop = e => {
    if (!onTileDrop || isReadOnly) return
    e.preventDefault()
    e.stopPropagation()
    const rect = e.currentTarget.getBoundingClientRect()
    const side = e.clientX < rect.left + rect.width / 2 ? 'before' : 'after'
    onTileDrop.drop(item.key, side)
  }

  return (
    <div className="relative">
      {dropSide === 'before' && <div className="absolute -left-1 top-0 bottom-0 w-0.5 bg-gold rounded-full pointer-events-none" />}
      {dropSide === 'after' && <div className="absolute -right-1 top-0 bottom-0 w-0.5 bg-gold rounded-full pointer-events-none" />}
      <div
        draggable={!isReadOnly}
        onDragStart={e => {
          if (isReadOnly) return
          e.dataTransfer.effectAllowed = 'move'
          e.dataTransfer.setData('text/plain', item.key)
          onDragStart(item.key)
        }}
        onDragEnd={onDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseEnter={() => onHover(item.key)}
        onFocus={() => onHover(item.key)}
        tabIndex={isReadOnly ? -1 : 0}
        className={`${tileFrameClass} overflow-hidden border bg-deep cursor-grab active:cursor-grabbing transition-colors ${
          isPreviewed ? 'border-gold ring-1 ring-gold/40' : 'border-gold-dim/30 hover:border-gold/60'
        } ${isDragging ? 'opacity-40' : ''} ${isReadOnly ? 'cursor-default active:cursor-default' : ''}`}
        title={item.name}
      >
        <EntityImage
          key={item.key}
          src={tileSrcFor(item, listType)}
          name={item.name}
          className={tileImageClass}
        />
      </div>
    </div>
  )
}

function TierRow({
  tier,
  keys,
  itemsByKey,
  listType,
  onDrop,
  onDragOver,
  onDragStart,
  onDragEnd,
  onHover,
  onTileHover,
  dropTarget,
  draggingKey,
  previewKey,
  isOver,
  emptyTier,
  isReadOnly = false,
}) {
  const style = TIER_STYLES[tier]
  const tileDropApi = {
    hover: (beforeKey, side) => onTileHover(tier, beforeKey, side),
    drop: (beforeKey, side) => onDrop(tier, { beforeKey, side }),
  }

  return (
    <div
      onDragOver={e => {
        if (isReadOnly) return
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        onDragOver(tier)
      }}
      onDrop={e => {
        if (isReadOnly) return
        e.preventDefault()
        onDrop(tier)
      }}
      className={`flex items-stretch border rounded-lg overflow-hidden transition-colors ${style.row} ${isOver ? 'ring-2 ring-gold/60' : ''}`}
    >
      <div className={`flex items-center justify-center w-16 font-display text-3xl tracking-wider border-r ${style.label}`}>
        {tier}
      </div>
      <div className="flex-1 min-h-[72px] p-2 flex flex-wrap gap-2 items-start">
        {keys.length === 0 ? (
          <span className="text-muted/60 text-xs font-body italic self-center px-2">{emptyTier}</span>
        ) : (
          keys.map(key => {
            const item = itemsByKey.get(key)
            if (!item) return null
            const isDropTargetTile = dropTarget && dropTarget.tier === tier && dropTarget.beforeKey === key
            return (
              <TierTile
                key={key}
                item={item}
                listType={listType}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onHover={onHover}
                onTileDrop={tileDropApi}
                isDragging={draggingKey === key}
                isPreviewed={previewKey === key}
                dropSide={isDropTargetTile ? dropTarget.side : null}
                isReadOnly={isReadOnly}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

function Pool({
  listType,
  poolTitle,
  emptyPool,
  keys,
  itemsByKey,
  onDrop,
  onDragOver,
  onDragStart,
  onDragEnd,
  onHover,
  draggingKey,
  previewKey,
  isOver,
  isReadOnly = false,
}) {
  return (
    <div
      onDragOver={e => {
        if (isReadOnly) return
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        onDragOver('pool')
      }}
      onDrop={e => {
        if (isReadOnly) return
        e.preventDefault()
        onDrop('pool')
      }}
      className={`bg-surface border border-gold-dim/20 rounded-xl p-4 transition-colors ${isOver ? 'ring-2 ring-gold/60' : ''}`}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-heading text-lg text-parchment tracking-wide">{poolTitle}</h2>
        <span className="text-xs font-body text-muted">{keys.length} unranked</span>
      </div>
      <div className="flex flex-wrap gap-2 min-h-[72px]">
        {keys.length === 0 ? (
          <p className="text-muted text-sm font-body italic">{emptyPool}</p>
        ) : (
          keys.map(key => {
            const item = itemsByKey.get(key)
            if (!item) return null
            return (
              <TierTile
                key={key}
                item={item}
                listType={listType}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onHover={onHover}
                isDragging={draggingKey === key}
                isPreviewed={previewKey === key}
                isReadOnly={isReadOnly}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

export default function DesktopTierBoard({
  tiers,
  poolKeys,
  itemsByKey,
  listType,
  config,
  previewItem,
  previewKey,
  onPreview,
  onMove,
  isReadOnly,
}) {
  const [draggingKey, setDraggingKey] = useState(null)
  const [overZone, setOverZone] = useState(null)
  const [dropTarget, setDropTarget] = useState(null)

  useEffect(() => {
    if (!draggingKey) return
    const NAV_OFFSET = 64
    const EDGE = 100
    const MAX_SPEED = 18
    let cursorY = -1
    let frame = 0

    const onDragOver = e => {
      cursorY = e.clientY
    }

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

  const handleDragStart = key => setDraggingKey(key)
  const handleDragEnd = () => {
    setDraggingKey(null)
    setOverZone(null)
    setDropTarget(null)
  }
  const handleDragOver = zone => {
    setOverZone(zone)
    setDropTarget(null)
  }
  const handleTileHover = (tier, beforeKey, side) => {
    setOverZone(tier)
    setDropTarget({ tier, beforeKey, side })
  }
  const handleHover = key => onPreview(key)

  const handleDrop = (targetZone, opts) => {
    if (!draggingKey) return
    onMove(draggingKey, targetZone, opts)
    setDraggingKey(null)
    setOverZone(null)
    setDropTarget(null)
  }

  return (
    <div className="space-y-3">
      {TIERS.map(t => (
        <TierRow
          key={t}
          tier={t}
          keys={tiers[t] ?? []}
          itemsByKey={itemsByKey}
          listType={listType}
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
          emptyTier={config.emptyTier}
          isReadOnly={isReadOnly}
        />
      ))}

      <div className="pt-4">
        <Pool
          listType={listType}
          poolTitle={config.poolTitle}
          emptyPool={config.emptyPool}
          keys={poolKeys}
          itemsByKey={itemsByKey}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onHover={handleHover}
          draggingKey={draggingKey}
          previewKey={previewKey}
          isOver={overZone === 'pool'}
          isReadOnly={isReadOnly}
        />
      </div>

      <div className="pt-4">
        <DetailPanel item={previewItem} listType={listType} hoverText={config.hoverText} />
      </div>
    </div>
  )
}
