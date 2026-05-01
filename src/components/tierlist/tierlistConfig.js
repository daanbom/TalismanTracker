import { AVAILABLE_ICONS } from '../../data/availableIcons'

const iconExtMap = new Map(AVAILABLE_ICONS.map(i => [i.key, i.ext]))

export const TIERS = ['S', 'A', 'B', 'C', 'D', 'F']

export const TIER_STYLES = {
  S: { label: 'bg-red-900/60 text-red-100 border-red-700/60', row: 'border-red-900/40 bg-red-950/20' },
  A: { label: 'bg-orange-900/60 text-orange-100 border-orange-700/60', row: 'border-orange-900/40 bg-orange-950/20' },
  B: { label: 'bg-yellow-900/60 text-yellow-100 border-yellow-700/60', row: 'border-yellow-900/40 bg-yellow-950/20' },
  C: { label: 'bg-emerald-900/60 text-emerald-100 border-emerald-700/60', row: 'border-emerald-900/40 bg-emerald-950/20' },
  D: { label: 'bg-blue-900/60 text-blue-100 border-blue-700/60', row: 'border-blue-900/40 bg-blue-950/20' },
  F: { label: 'bg-purple-900/60 text-purple-100 border-purple-700/60', row: 'border-purple-900/40 bg-purple-950/20' },
}

export const EXPANSION_LABELS = {
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

export const LIST_CONFIG = {
  character: {
    poolTitle: 'Character Pool',
    emptyPool: 'All characters ranked.',
    emptyTier: 'Drop characters here',
    hoverText: 'Hover a character to see details.',
    editHint: 'Drag characters between tiers. Hover a portrait for details.',
    mobileEditHint: 'Tap a character, then choose a tier or position.',
  },
  pet: {
    poolTitle: 'Pet Pool',
    emptyPool: 'All pets ranked.',
    emptyTier: 'Drop pets here',
    hoverText: 'Hover a pet to see details.',
    editHint: 'Drag pets between tiers. Hover a portrait for details.',
    mobileEditHint: 'Tap a pet, then choose a tier or position.',
  },
}

export function tabToListType(tab) {
  return tab === 'pets' ? 'pet' : 'character'
}

export function listTypeToTab(listType) {
  return listType === 'pet' ? 'pets' : 'characters'
}

export function tileSrcFor(item, listType) {
  if (listType === 'pet') {
    return `/pets/${item.key}.png`
  }
  return `/icons/${item.key}${iconExtMap.get(item.key) ?? '.png'}`
}

export function detailSrcFor(item, listType) {
  if (listType === 'pet') {
    return `/pets/${item.key}.png`
  }
  return `/characters/${item.key}.webp`
}

export function moveKeyInTiers(prev, key, targetZone, opts) {
  const next = {}
  for (const tier of TIERS) next[tier] = (prev[tier] ?? []).filter(k => k !== key)

  if (targetZone !== 'pool') {
    const tierArr = next[targetZone] ?? []
    if (opts && opts.beforeKey && opts.beforeKey !== key) {
      let idx = tierArr.indexOf(opts.beforeKey)
      if (idx === -1) idx = tierArr.length
      if (opts.side === 'after') idx += 1
      next[targetZone] = [...tierArr.slice(0, idx), key, ...tierArr.slice(idx)]
    } else {
      next[targetZone] = [...tierArr, key]
    }
  }

  return next
}
