import { useMemo, useState } from 'react'
import {
  DetailPanel,
  EntityImage,
} from './tierlistShared'
import {
  TIERS,
  TIER_STYLES,
  tileSrcFor,
} from './tierlistConfig'

function MobileTile({
  item,
  listType,
  isSelected,
  isPreviewed,
  canPlaceAround,
  onSelect,
  onPlaceBefore,
  onPlaceAfter,
}) {
  const isPet = listType === 'pet'
  const tileFrameClass = isPet ? 'w-12 h-16 rounded-md' : 'w-14 h-14 rounded-lg'
  const tileImageClass = isPet
    ? 'w-full h-full object-contain pointer-events-none p-0.5 bg-surface'
    : 'w-full h-full object-cover pointer-events-none'

  return (
    <div className="flex flex-col items-center gap-1">
      {canPlaceAround && (
        <button
          type="button"
          onClick={onPlaceBefore}
          className="px-2 py-1 rounded border border-gold-dim/30 bg-deep text-[10px] font-body text-gold-dim"
        >
          Before
        </button>
      )}
      <button
        type="button"
        onClick={onSelect}
        className={`${tileFrameClass} overflow-hidden border bg-deep transition-colors ${
          isSelected
            ? 'border-gold ring-2 ring-gold/50'
            : isPreviewed
              ? 'border-gold ring-1 ring-gold/40'
              : 'border-gold-dim/30'
        }`}
        title={item.name}
      >
        <EntityImage
          key={item.key}
          src={tileSrcFor(item, listType)}
          name={item.name}
          className={tileImageClass}
        />
      </button>
      {canPlaceAround && (
        <button
          type="button"
          onClick={onPlaceAfter}
          className="px-2 py-1 rounded border border-gold-dim/30 bg-deep text-[10px] font-body text-gold-dim"
        >
          After
        </button>
      )}
    </div>
  )
}

function MobileTierRow({
  tier,
  keys,
  itemsByKey,
  listType,
  selectedKey,
  previewKey,
  emptyTier,
  isReadOnly,
  onSelect,
  onAppend,
  onPlace,
}) {
  const style = TIER_STYLES[tier]
  const canAppend = selectedKey && !isReadOnly

  return (
    <div className={`flex items-stretch border rounded-lg overflow-hidden transition-colors ${style.row} ${canAppend ? 'ring-1 ring-gold/30' : ''}`}>
      <button
        type="button"
        onClick={() => {
          if (canAppend) onAppend(tier)
        }}
        className={`flex items-center justify-center w-14 shrink-0 font-display text-2xl tracking-wider border-r ${style.label}`}
      >
        {tier}
      </button>
      <div className="flex-1 min-h-[86px] p-2">
        {keys.length === 0 ? (
          <button
            type="button"
            onClick={() => {
              if (canAppend) onAppend(tier)
            }}
            disabled={!canAppend}
            className="w-full min-h-[68px] rounded-md border border-dashed border-gold-dim/20 text-muted/60 text-xs font-body italic disabled:cursor-default"
          >
            {canAppend ? `Place in ${tier}` : emptyTier}
          </button>
        ) : (
          <div className="flex flex-wrap gap-3 items-start">
            {keys.map(key => {
              const item = itemsByKey.get(key)
              if (!item) return null
              const canPlaceAround = selectedKey && selectedKey !== key && !isReadOnly
              return (
                <MobileTile
                  key={key}
                  item={item}
                  listType={listType}
                  isSelected={selectedKey === key}
                  isPreviewed={previewKey === key}
                  canPlaceAround={canPlaceAround}
                  onSelect={() => onSelect(key)}
                  onPlaceBefore={() => onPlace(tier, key, 'before')}
                  onPlaceAfter={() => onPlace(tier, key, 'after')}
                />
              )
            })}
            {canAppend && (
              <button
                type="button"
                onClick={() => onAppend(tier)}
                className="self-stretch min-h-14 px-3 rounded-md border border-dashed border-gold-dim/40 text-xs font-body text-gold-dim"
              >
                End
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function MobilePool({
  listType,
  poolTitle,
  emptyPool,
  keys,
  itemsByKey,
  selectedKey,
  previewKey,
  isReadOnly,
  onSelect,
  onMoveToPool,
}) {
  const canMoveToPool = selectedKey && !isReadOnly

  return (
    <div className={`bg-surface border border-gold-dim/20 rounded-xl p-4 transition-colors ${canMoveToPool ? 'ring-1 ring-gold/30' : ''}`}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="font-heading text-lg text-parchment tracking-wide">{poolTitle}</h2>
        <span className="text-xs font-body text-muted">{keys.length} unranked</span>
      </div>
      {canMoveToPool && (
        <button
          type="button"
          onClick={onMoveToPool}
          className="mb-3 w-full rounded-md border border-dashed border-gold-dim/40 px-3 py-2 text-xs font-body text-gold-dim"
        >
          Move selected to pool
        </button>
      )}
      <div className="flex flex-wrap gap-3 min-h-[72px]">
        {keys.length === 0 ? (
          <p className="text-muted text-sm font-body italic">{emptyPool}</p>
        ) : (
          keys.map(key => {
            const item = itemsByKey.get(key)
            if (!item) return null
            return (
              <MobileTile
                key={key}
                item={item}
                listType={listType}
                isSelected={selectedKey === key}
                isPreviewed={previewKey === key}
                canPlaceAround={false}
                onSelect={() => onSelect(key)}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

export default function MobileTierBoard({
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
  const [selectedKey, setSelectedKey] = useState(null)
  const activeSelectedKey = selectedKey && itemsByKey.has(selectedKey) ? selectedKey : null

  const selectedItem = useMemo(
    () => itemsByKey.get(activeSelectedKey) ?? null,
    [itemsByKey, activeSelectedKey],
  )

  const handleSelect = key => {
    onPreview(key)
    if (isReadOnly) return
    setSelectedKey(prev => (prev === key ? null : key))
  }

  const handleAppend = tier => {
    if (!activeSelectedKey || isReadOnly) return
    onMove(activeSelectedKey, tier)
    setSelectedKey(null)
  }

  const handlePlace = (tier, beforeKey, side) => {
    if (!activeSelectedKey || isReadOnly) return
    onMove(activeSelectedKey, tier, { beforeKey, side })
    setSelectedKey(null)
  }

  const handleMoveToPool = () => {
    if (!activeSelectedKey || isReadOnly) return
    onMove(activeSelectedKey, 'pool')
    setSelectedKey(null)
  }

  return (
    <div className="space-y-3">
      {!isReadOnly && (
        <div className="sticky top-16 z-20 rounded-lg border border-gold-dim/30 bg-deep/95 p-3 shadow-lg shadow-black/40">
          {selectedItem ? (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-body uppercase tracking-widest text-gold-dim">Selected</p>
                <p className="truncate font-heading text-base text-parchment">{selectedItem.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedKey(null)}
                className="shrink-0 rounded border border-gold-dim/30 px-3 py-1.5 text-xs font-body text-muted"
              >
                Cancel
              </button>
            </div>
          ) : (
            <p className="text-xs font-body text-muted">Tap an item to select it, then tap a tier or a Before/After position.</p>
          )}
        </div>
      )}

      {TIERS.map(t => (
        <MobileTierRow
          key={t}
          tier={t}
          keys={tiers[t] ?? []}
          itemsByKey={itemsByKey}
          listType={listType}
          selectedKey={activeSelectedKey}
          previewKey={previewKey}
          emptyTier={config.emptyTier}
          isReadOnly={isReadOnly}
          onSelect={handleSelect}
          onAppend={handleAppend}
          onPlace={handlePlace}
        />
      ))}

      <div className="pt-4">
        <MobilePool
          listType={listType}
          poolTitle={config.poolTitle}
          emptyPool={config.emptyPool}
          keys={poolKeys}
          itemsByKey={itemsByKey}
          selectedKey={activeSelectedKey}
          previewKey={previewKey}
          isReadOnly={isReadOnly}
          onSelect={handleSelect}
          onMoveToPool={handleMoveToPool}
        />
      </div>

      <div className="pt-4">
        <DetailPanel item={previewItem} listType={listType} hoverText={config.hoverText} />
      </div>
    </div>
  )
}
