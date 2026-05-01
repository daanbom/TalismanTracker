import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import DesktopTierBoard from '../components/tierlist/DesktopTierBoard'
import MobileTierBoard from '../components/tierlist/MobileTierBoard'
import {
  LIST_CONFIG,
  TIERS,
  listTypeToTab,
  moveKeyInTiers,
  tabToListType,
} from '../components/tierlist/tierlistConfig'
import { useCurrentPlayer } from '../hooks/useCurrentPlayer'
import { useIcons } from '../hooks/useIcons'
import { usePets } from '../hooks/usePets'
import { usePlayers } from '../hooks/usePlayers'
import { useSaveTierlist } from '../hooks/useSaveTierlist'
import { EMPTY_TIERS, useTierlist } from '../hooks/useTierlist'
import { canEditTierlist } from '../lib/accessControl'

export default function Tierlist() {
  const { id: playerId } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const listType = tabToListType(searchParams.get('tab'))
  const config = LIST_CONFIG[listType]

  const playersQuery = usePlayers()
  const { data: currentPlayer, isLoading: currentPlayerLoading } = useCurrentPlayer()
  const iconsQuery = useIcons()
  const petsQuery = usePets()

  const isPlayerVisible = (playersQuery.data ?? []).some(p => p.id === playerId)
  const tierlistQuery = useTierlist(playerId, listType, { enabled: isPlayerVisible })
  const save = useSaveTierlist()

  const player = useMemo(
    () => (playersQuery.data ?? []).find(p => p.id === playerId),
    [playersQuery.data, playerId],
  )
  const canEdit = canEditTierlist({ currentPlayer, player })

  const sourceItems = useMemo(() => {
    if (listType === 'pet') return petsQuery.data ?? []
    return (iconsQuery.data ?? []).filter(i => i.key !== 'toad')
  }, [listType, petsQuery.data, iconsQuery.data])
  const sourceReady = listType === 'pet' ? petsQuery.isSuccess : iconsQuery.isSuccess

  const itemsByKey = useMemo(() => {
    const map = new Map()
    for (const item of sourceItems) map.set(item.key, item)
    return map
  }, [sourceItems])

  const [tiers, setTiers] = useState(EMPTY_TIERS)
  const [isDirty, setIsDirty] = useState(false)
  const [seededAt, setSeededAt] = useState(null)
  const [previewKey, setPreviewKey] = useState(null)

  const queryStamp = `${listType}:${tierlistQuery.dataUpdatedAt}`
  if (tierlistQuery.data && sourceReady && seededAt !== queryStamp) {
    const validKeys = new Set(sourceItems.map(i => i.key))
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
    const handler = e => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const placedKeys = useMemo(() => {
    const set = new Set()
    for (const t of TIERS) for (const k of tiers[t] ?? []) set.add(k)
    return set
  }, [tiers])

  const poolKeys = useMemo(
    () => sourceItems.filter(i => !placedKeys.has(i.key)).map(i => i.key),
    [sourceItems, placedKeys],
  )

  const previewItem = itemsByKey.get(previewKey ?? poolKeys[0]) ?? null

  const handlePreview = key => setPreviewKey(prev => (prev === key ? prev : key))

  const handleMove = (key, targetZone, opts) => {
    setTiers(prev => moveKeyInTiers(prev, key, targetZone, opts))
    setIsDirty(true)
  }

  const handleSave = () => {
    if (!canEdit) return
    save.mutate(
      { playerId, listType, tiers },
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

  const handleTabSwitch = nextType => {
    if (nextType === listType) return
    if (isDirty && !window.confirm('You have unsaved changes. Switch list anyway?')) return

    setPreviewKey(null)

    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      next.set('tab', listTypeToTab(nextType))
      return next
    })
  }

  const activeSourceError = listType === 'pet' ? petsQuery.error : iconsQuery.error
  const error = playersQuery.error || activeSourceError || tierlistQuery.error || save.error

  if (!playersQuery.isLoading && !player) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-muted text-sm font-body italic">Player not found.</p>
        <Link to="/players" className="text-gold hover:text-gold-light text-sm font-body mt-4 inline-block">Back to Players</Link>
      </div>
    )
  }

  const isLoading =
    playersQuery.isLoading ||
    currentPlayerLoading ||
    (listType === 'pet' ? petsQuery.isLoading : iconsQuery.isLoading) ||
    (isPlayerVisible && tierlistQuery.isLoading)

  const boardProps = {
    tiers,
    poolKeys,
    itemsByKey,
    listType,
    config,
    previewItem,
    previewKey,
    onPreview: handlePreview,
    onMove: handleMove,
    isReadOnly: !canEdit,
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 animate-fade-up">
        <button
          onClick={handleBack}
          className="text-gold-dim hover:text-gold text-sm font-body transition-colors mb-3"
        >
          Back to Players
        </button>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-heading text-3xl text-parchment tracking-wide">
              {player ? `${player.name}'s Tierlists` : 'Tierlists'}
            </h1>
            <p className="hidden md:block text-muted text-sm font-body mt-1">
              {canEdit
                ? config.editHint
                : 'Read only view. Only the tierlist owner can edit.'}
            </p>
            <p className="md:hidden text-muted text-sm font-body mt-1">
              {canEdit
                ? config.mobileEditHint
                : 'Read only view. Only the tierlist owner can edit.'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {canEdit && isDirty && <span className="text-xs font-body text-gold-dim italic">Unsaved changes</span>}
            {canEdit ? (
              <button
                onClick={handleSave}
                disabled={!isDirty || save.isPending}
                className="btn-gold text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none"
              >
                {save.isPending ? 'Saving...' : 'Save Tierlist'}
              </button>
            ) : (
              <span className="text-xs font-body text-muted">No permission to edit</span>
            )}
          </div>
        </div>

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

      {error && (
        <p className="text-danger text-sm font-body mb-4">{error.message}</p>
      )}

      {isLoading ? (
        <p className="text-muted text-sm font-body italic">Loading...</p>
      ) : (
        <div className="animate-fade-up delay-1">
          <div className="md:hidden">
            <MobileTierBoard {...boardProps} />
          </div>
          <div className="hidden md:block">
            <DesktopTierBoard {...boardProps} />
          </div>
        </div>
      )}
    </div>
  )
}
