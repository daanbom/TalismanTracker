import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAverageTierlist } from '../hooks/useAverageTierlist'
import { useIcons } from '../hooks/useIcons'
import { usePets } from '../hooks/usePets'
import { useActiveGroup } from '../hooks/useActiveGroup'
import { usePlayers } from '../hooks/usePlayers'
import ScopeToggle from '../components/ScopeToggle'
import { AVAILABLE_ICONS } from '../data/availableIcons'

const iconExtMap = new Map(AVAILABLE_ICONS.map((icon) => [icon.key, icon.ext]))
const TIERS = ['S', 'A', 'B', 'C', 'D', 'F']
const EMPTY_TIERS = { S: [], A: [], B: [], C: [], D: [], F: [] }

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
  blood_moon: 'The Blood Moon',
  city: 'The City',
  woodland: 'The Woodland',
  dragon: 'The Dragon',
  firelands: 'The Firelands',
  cataclysm: 'The Cataclysm',
}

function tabToListType(tab) {
  return tab === 'pets' ? 'pet' : 'character'
}

function listTypeToTab(listType) {
  return listType === 'pet' ? 'pets' : 'characters'
}

function tileSrcFor(item, listType) {
  if (listType === 'pet') return `/pets/${item.key}.png`
  return `/icons/${item.key}${iconExtMap.get(item.key) ?? '.png'}`
}

function detailSrcFor(item, listType) {
  if (listType === 'pet') return `/pets/${item.key}.png`
  return `/characters/${item.key}.webp`
}

function EntityImage({ src, name, className, fallbackTextSize = 'text-xs' }) {
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
      src={src}
      alt={name}
      className={className}
      onError={() => setErrored(true)}
    />
  )
}

function EntityTile({ item, listType, onHover, isActive }) {
  const isPet = listType === 'pet'
  const tileFrameClass = isPet ? 'w-12 h-16 rounded-md' : 'w-14 h-14 rounded-lg'
  const tileImageClass = isPet
    ? 'w-full h-full object-contain pointer-events-none p-0.5 bg-surface'
    : 'w-full h-full object-cover pointer-events-none'

  return (
    <div
      onMouseEnter={() => onHover(item.key)}
      onFocus={() => onHover(item.key)}
      tabIndex={0}
      className={`${tileFrameClass} overflow-hidden border bg-deep transition-colors ${
        isActive ? 'border-gold ring-1 ring-gold/40' : 'border-gold-dim/30 hover:border-gold/60'
      }`}
      title={item.name}
    >
      <EntityImage
        key={item.key}
        src={tileSrcFor(item, listType)}
        name={item.name}
        className={tileImageClass}
      />
    </div>
  )
}

function DetailPanel({ item, listType, stats }) {
  const isPet = listType === 'pet'
  const detailFrameClass = isPet
    ? 'w-full max-w-sm aspect-[5/7] rounded-lg overflow-hidden border border-gold-dim/40 bg-deep shadow-2xl shadow-black/70'
    : 'w-full max-w-lg aspect-[3/2] rounded-lg overflow-hidden border border-gold-dim/40 bg-deep shadow-2xl shadow-black/70'

  if (!item) {
    return (
      <div className="bg-surface border border-gold-dim/15 rounded-xl p-6 flex items-center justify-center min-h-28">
        <p className="text-muted text-sm font-body italic">Hover an entry to preview details.</p>
      </div>
    )
  }

  function PetDetailArtwork() {
    const [failed, setFailed] = useState(false)
    if (failed) {
      return (
        <div className="w-full h-full p-6 flex flex-col items-center justify-center gap-3 text-center">
          <p className="font-heading text-lg text-gold-light">{item.name}</p>
          <p className="text-sm font-body text-parchment/80">
            {item.ability_text ?? 'Image coming soon.'}
          </p>
        </div>
      )
    }
    return (
      <img
        src={detailSrcFor(item, listType)}
        alt={item.name}
        className="w-full h-full object-contain p-1 bg-surface"
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <div className="bg-surface border border-gold-dim/20 rounded-xl p-6 flex flex-col items-center gap-4">
      <div className="text-center">
        <p className="text-xs font-body text-gold-dim uppercase tracking-widest mb-1">
          {EXPANSION_LABELS[item.expansion] ?? item.expansion ?? ''}
        </p>
        <h3 className="font-heading text-2xl text-parchment tracking-wide">{item.name}</h3>
      </div>
      <div className={detailFrameClass}>
        {listType === 'pet' ? (
          <PetDetailArtwork key={item.key} />
        ) : (
          <EntityImage
            src={detailSrcFor(item, listType)}
            name={item.name}
            className="w-full h-full object-cover"
            fallbackTextSize="text-base"
          />
        )}
      </div>
      {stats && (
        <p className="text-sm font-body text-gold-dim text-center">
          Average score: {stats.average.toFixed(2)} ({stats.count} ranked)
        </p>
      )}
      {listType === 'pet' && item.ability_text && (
        <p className="text-sm font-body text-parchment/80 text-center max-w-lg">
          {item.ability_text}
        </p>
      )}
    </div>
  )
}

export default function AverageTierlist() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { activeGroupId, activeGroup } = useActiveGroup()
  const playersQuery = usePlayers()
  const [scope, setScope] = useState(() => (activeGroupId ? 'group' : 'global'))
  const effectiveScope = scope === 'group' && activeGroupId ? 'group' : 'global'

  const listType = tabToListType(searchParams.get('tab'))
  const groupPlayerIds = useMemo(
    () => ((effectiveScope === 'group' && activeGroupId) ? (playersQuery.data ?? []).map((player) => player.id) : []),
    [effectiveScope, activeGroupId, playersQuery.data],
  )
  const averageQuery = useAverageTierlist({
    listType,
    scope: effectiveScope,
    groupPlayerIds,
    enabled: effectiveScope === 'group' ? Boolean(activeGroupId) && playersQuery.isSuccess : true,
  })
  const iconsQuery = useIcons()
  const petsQuery = usePets()

  const sourceItems = useMemo(() => {
    if (listType === 'pet') return petsQuery.data ?? []
    return (iconsQuery.data ?? []).filter((icon) => icon.key !== 'toad')
  }, [listType, iconsQuery.data, petsQuery.data])

  const itemsByKey = useMemo(() => {
    const map = new Map()
    for (const item of sourceItems) map.set(item.key, item)
    return map
  }, [sourceItems])

  const statsByKey = averageQuery.data?.statsByKey ?? {}
  const tiers = averageQuery.data?.tiers ?? EMPTY_TIERS

  const rankedKeys = useMemo(() => {
    const set = new Set()
    for (const tier of TIERS) {
      for (const key of tiers[tier] ?? []) set.add(key)
    }
    return set
  }, [tiers])

  const unranked = useMemo(
    () => sourceItems.filter((item) => !rankedKeys.has(item.key)),
    [sourceItems, rankedKeys],
  )

  const [previewKey, setPreviewKey] = useState(null)
  const firstRankedKey = TIERS.flatMap((tier) => tiers[tier] ?? [])[0] ?? unranked[0]?.key ?? null
  const activePreviewKey = previewKey ?? firstRankedKey
  const previewItem = activePreviewKey ? itemsByKey.get(activePreviewKey) ?? null : null

  const handleTabSwitch = (nextType) => {
    if (nextType === listType) return
    setPreviewKey(null)
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('tab', listTypeToTab(nextType))
      return next
    })
  }

  const sourceError = listType === 'pet' ? petsQuery.error : iconsQuery.error
  const error = averageQuery.error || sourceError || playersQuery.error
  const isLoading =
    (effectiveScope === 'group' && playersQuery.isLoading) ||
    averageQuery.isLoading ||
    (listType === 'pet' ? petsQuery.isLoading : iconsQuery.isLoading)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 animate-fade-up">
        <Link to="/players" className="text-gold-dim hover:text-gold text-sm font-body transition-colors mb-3 inline-block">
          Back to Players
        </Link>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-3xl text-parchment tracking-wide">Average Tierlist</h1>
            <p className="text-muted text-sm font-body mt-1">
              {effectiveScope === 'group'
                ? `Group: ${activeGroup?.name ?? 'Select a group'}`
                : 'Global scope across every player on the platform (all groups combined).'}
            </p>
          </div>
          <div className="text-xs font-body text-muted space-y-1">
            <p>Players in scope: {averageQuery.data?.playerCount ?? 0}</p>
            <p>Submitted list count: {averageQuery.data?.submittedCount ?? 0}</p>
          </div>
        </div>

        <div className="mt-4">
          <ScopeToggle value={effectiveScope} onChange={setScope} groupName={activeGroup?.name ?? null} />
        </div>

        <p className="text-muted text-sm font-body mt-3">
          Unranked entries are excluded from averages and stay in the unranked pool.
        </p>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleTabSwitch('character')}
            className={`px-3 py-1.5 rounded-md text-xs font-body tracking-wide border transition-colors ${
              listType === 'character'
                ? 'bg-gold/20 border-gold/60 text-gold-light'
                : 'bg-surface border-gold-dim/30 text-muted hover:text-gold hover:border-gold/40'
            }`}
          >
            Characters
          </button>
          <button
            type="button"
            onClick={() => handleTabSwitch('pet')}
            className={`px-3 py-1.5 rounded-md text-xs font-body tracking-wide border transition-colors ${
              listType === 'pet'
                ? 'bg-gold/20 border-gold/60 text-gold-light'
                : 'bg-surface border-gold-dim/30 text-muted hover:text-gold hover:border-gold/40'
            }`}
          >
            Pets
          </button>
        </div>

        <div className="ornament-divider mt-4">
          <span className="text-gold-dim">&#9670;</span>
        </div>
      </div>

      {error && <p className="text-danger text-sm font-body mb-4">{error.message}</p>}

      {isLoading ? (
        <p className="text-muted text-sm font-body italic">Loading...</p>
      ) : (
        <div className="space-y-3 animate-fade-up delay-1">
          {TIERS.map((tier) => {
            const style = TIER_STYLES[tier]
            const keys = tiers[tier] ?? []

            return (
              <div key={tier} className={`flex items-stretch border rounded-lg overflow-hidden ${style.row}`}>
                <div className={`flex items-center justify-center w-16 font-display text-3xl tracking-wider border-r ${style.label}`}>
                  {tier}
                </div>
                <div className="flex-1 min-h-[72px] p-2 flex flex-wrap gap-2 items-start">
                  {keys.length === 0 ? (
                    <span className="text-muted/60 text-xs font-body italic self-center px-2">No ranked entries in this tier.</span>
                  ) : (
                    keys.map((key) => {
                      const item = itemsByKey.get(key)
                      if (!item) return null
                      return (
                        <EntityTile
                          key={key}
                          item={item}
                          listType={listType}
                          onHover={setPreviewKey}
                          isActive={key === activePreviewKey}
                        />
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}

          <DetailPanel
            item={previewItem}
            listType={listType}
            stats={previewItem ? (statsByKey[previewItem.key] ?? null) : null}
          />

          <div className="bg-surface border border-gold-dim/20 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading text-lg text-parchment tracking-wide">Unranked Pool</h2>
              <span className="text-xs font-body text-muted">{unranked.length} entries</span>
            </div>
            <div className="flex flex-wrap gap-2 min-h-[72px]">
              {unranked.length === 0 ? (
                <p className="text-muted text-sm font-body italic">Every entry has at least one ranking.</p>
              ) : (
                unranked.map((item) => (
                  <EntityTile
                    key={item.key}
                    item={item}
                    listType={listType}
                    onHover={setPreviewKey}
                    isActive={item.key === activePreviewKey}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
