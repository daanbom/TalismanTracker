import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useGame } from '../hooks/useGame'
import { useDeleteGame } from '../hooks/useDeleteGame'
import { useActiveGroup } from '../hooks/useActiveGroup'
import { useCurrentPlayer } from '../hooks/useCurrentPlayer'
import GroupRequiredState from '../components/GroupRequiredState'
import { WoodlandPathTooltip } from '../components/WoodlandPathTooltip'
import { canDeleteGame, canEditGame } from '../lib/accessControl'
import { AVAILABLE_ICONS } from '../data/availableIcons'

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

const CATEGORY_LABELS = {
  most_gold: 'Most Gold',
  most_followers: 'Most Followers',
  most_objects: 'Most Objects',
  most_fate: 'Most Fate',
  most_strength: 'Most Strength (without bonus)',
  most_craft: 'Most Craft (without bonus)',
  most_life: 'Most Life',
  longest_toad_streak: 'Longest Toad Streak (consecutive turns)',
  most_denizens_on_spot: 'Most Denizens on Spot',
}

const ICON_BY_NAME = new Map(AVAILABLE_ICONS.map((icon) => [icon.name.toLowerCase(), icon]))

const ENDING_THEMES = {
  base: { bgStart: '#0b111d', bgEnd: '#1d2536', accent: '#d5be84', accentSoft: 'rgba(213, 190, 132, 0.45)', text: '#f0e5c4', symbol: 'Crown' },
  reaper: { bgStart: '#0f0f16', bgEnd: '#241a2c', accent: '#c77dff', accentSoft: 'rgba(199, 125, 255, 0.45)', text: '#f1e5ff', symbol: 'Reaper' },
  dungeon: { bgStart: '#111111', bgEnd: '#2a2118', accent: '#e0a458', accentSoft: 'rgba(224, 164, 88, 0.45)', text: '#f4e6d5', symbol: 'Dungeon' },
  highland: { bgStart: '#10202c', bgEnd: '#21455b', accent: '#82cfff', accentSoft: 'rgba(130, 207, 255, 0.45)', text: '#e9f7ff', symbol: 'Highland' },
  sacred_pool: { bgStart: '#091f2e', bgEnd: '#123c4e', accent: '#62d6ff', accentSoft: 'rgba(98, 214, 255, 0.45)', text: '#ddf6ff', symbol: 'Sacred Pool' },
  harbinger: { bgStart: '#1b0f20', bgEnd: '#3d1f42', accent: '#f39cf3', accentSoft: 'rgba(243, 156, 243, 0.45)', text: '#ffe9ff', symbol: 'Harbinger' },
  frostmarch: { bgStart: '#0d1f33', bgEnd: '#204b6f', accent: '#9ad8ff', accentSoft: 'rgba(154, 216, 255, 0.45)', text: '#e9f8ff', symbol: 'Frostmarch' },
  blood_moon: { bgStart: '#280d11', bgEnd: '#4b1b24', accent: '#ff8c8c', accentSoft: 'rgba(255, 140, 140, 0.45)', text: '#ffe8e8', symbol: 'Blood Moon' },
  city: { bgStart: '#1b1f2a', bgEnd: '#333c4d', accent: '#ffd38a', accentSoft: 'rgba(255, 211, 138, 0.45)', text: '#f6ecdc', symbol: 'City' },
  woodland: { bgStart: '#102112', bgEnd: '#1f4629', accent: '#8fd88f', accentSoft: 'rgba(143, 216, 143, 0.45)', text: '#e8f8e8', symbol: 'Woodland' },
  dragon: { bgStart: '#21110e', bgEnd: '#482318', accent: '#ff9a62', accentSoft: 'rgba(255, 154, 98, 0.45)', text: '#ffeedd', symbol: 'Dragon' },
  firelands: { bgStart: '#2a1208', bgEnd: '#5c2713', accent: '#ffb366', accentSoft: 'rgba(255, 179, 102, 0.45)', text: '#fff0dc', symbol: 'Firelands' },
  cataclysm: { bgStart: '#181818', bgEnd: '#343434', accent: '#d1d5db', accentSoft: 'rgba(209, 213, 219, 0.45)', text: '#f3f4f6', symbol: 'Cataclysm' },
  default: { bgStart: '#0c1019', bgEnd: '#1a2233', accent: '#d5be84', accentSoft: 'rgba(213, 190, 132, 0.45)', text: '#f0e5c4', symbol: 'Talisman' },
}

function groupEventsByPlayer(events) {
  const groups = new Map()
  for (const event of events) {
    const key = event.player?.id ?? '__unassigned__'
    if (!groups.has(key)) {
      groups.set(key, { player: event.player, woodlandPaths: [], dungeonBeaten: false })
    }
    const group = groups.get(key)
    if (event.expansion === 'woodland' && event.detail) {
      group.woodlandPaths.push(event.detail)
    }
    if (event.event_type === 'dungeon_beaten') {
      group.dungeonBeaten = true
    }
  }
  return Array.from(groups.values())
}

function normalizeExpansionKey(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
}

function getEndingTheme(expansion) {
  const key = normalizeExpansionKey(expansion)
  const aliases = {
    base_game: 'base',
    the_reaper: 'reaper',
    the_dungeon: 'dungeon',
    the_highland: 'highland',
    the_sacred_pool: 'sacred_pool',
    the_harbinger: 'harbinger',
    the_frostmarch: 'frostmarch',
    the_blood_moon: 'blood_moon',
    the_city: 'city',
    the_woodland: 'woodland',
    the_dragon: 'dragon',
    the_firelands: 'firelands',
    the_cataclysm: 'cataclysm',
  }
  const resolved = aliases[key] ?? key
  return ENDING_THEMES[resolved] ?? ENDING_THEMES.default
}

function getWinnerPortraits(game, winners) {
  if (winners.length === 0) {
    return [{ label: 'Talisman', src: '/icons/talisman-logo.png' }]
  }

  const portraits = []
  for (const winner of winners) {
    const charName = winner.winning_character || winner.characters_played?.[winner.characters_played.length - 1] || null
    if (!charName) continue
    const icon = ICON_BY_NAME.get(String(charName).toLowerCase())
    if (!icon) continue
    portraits.push({
      label: `${winner.player.name}${charName ? ` (${charName})` : ''}`,
      src: `/icons/${icon.key}${icon.ext}`,
    })
  }

  if (portraits.length === 0) {
    return [{ label: winners.map((winner) => winner.player.name).join(', '), src: '/icons/talisman-logo.png' }]
  }

  return portraits.slice(0, 2)
}

function sanitizeFilename(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'game-recap'
}

function wrapText(ctx, text, maxWidth) {
  const words = String(text ?? '').split(/\s+/).filter(Boolean)
  if (words.length === 0) return ['']

  const lines = []
  let line = words[0]

  for (let i = 1; i < words.length; i += 1) {
    const test = `${line} ${words[i]}`
    if (ctx.measureText(test).width <= maxWidth) line = test
    else {
      lines.push(line)
      line = words[i]
    }
  }
  lines.push(line)
  return lines
}

function getRecapSections(game, winners, groupName) {
  const winnerText = winners.length === 0
    ? 'Talisman'
    : winners.map((w) => w.player.name).join(', ')
  const playersLine = game.players.map((gp) => gp.player.name).join(', ')
  const participantRows = game.players.map((gp) => {
    const played = (gp.characters_played ?? []).join(' -> ')
    return `${gp.player.name}${gp.is_winner ? ' [Winner]' : ''}: ${played || 'NA'} (${gp.total_deaths} deaths, ${gp.total_toad_times ?? 0} toads)`
  })
  const highlightRows = (game.highscores ?? [])
    .slice(0, 6)
    .map((score) => `${CATEGORY_LABELS[score.category] || score.category}: ${score.player?.name ?? 'Game'} (${score.value})`)

  const sections = [
    {
      title: 'Session',
      rows: [
        `Date: ${formatDate(game.date)}`,
        `Group: ${groupName ?? 'Unknown group'}`,
        `Ending: ${game.ending?.name ?? 'Unknown ending'}`,
        `Players (${game.players.length}): ${playersLine}`,
        `Winner${winners.length > 1 ? 's' : ''}: ${winnerText}`,
      ],
    },
    {
      title: 'Participants',
      rows: participantRows,
    },
  ]

  if (highlightRows.length > 0) {
    sections.push({ title: 'Highlights', rows: highlightRows })
  }
  if (game.notes) {
    sections.push({ title: 'Notes', rows: [game.notes] })
  }

  return sections
}

function measureRecapHeight(game, winners, groupName, width, padding) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return 960

  const maxWidth = width - (padding * 2)
  const sections = getRecapSections(game, winners, groupName)
  const portraits = getWinnerPortraits(game, winners)
  const portraitSize = 132
  const portraitGap = 28
  const portraitLabelHeight = 44
  const portraitTotalWidth = portraits.length > 0
    ? (portraits.length * portraitSize) + ((portraits.length - 1) * portraitGap)
    : 0
  const portraitExclusionWidth = portraits.length > 0 ? portraitTotalWidth + 36 : 0
  let y = padding

  ctx.font = '700 54px "Cinzel", serif'
  y += 68
  y += 12

  ctx.font = '500 24px "Alegreya Sans", sans-serif'
  y += 34
  y += 18
  y += 52
  const portraitBottom = portraits.length > 0 ? y + portraitSize + portraitLabelHeight : 0

  for (const section of sections) {
    const sectionMaxWidth = y < portraitBottom ? maxWidth - portraitExclusionWidth : maxWidth
    ctx.font = '600 29px "Cinzel", serif'
    y += sectionMaxWidth < maxWidth ? 42 : 38
    y += 10
    ctx.font = '400 24px "Alegreya Sans", sans-serif'
    for (const row of section.rows) {
      const rowMaxWidth = y < portraitBottom ? maxWidth - portraitExclusionWidth : maxWidth
      const wrapped = wrapText(ctx, row, rowMaxWidth - 24)
      y += wrapped.length * 33
      y += 8
    }
    y += 12
  }

  y += 26
  return Math.max(960, Math.ceil(y + padding))
}

async function canvasToBlob(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
}

async function loadImage(src) {
  return new Promise((resolve) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = src
  })
}

function drawPortraitCard(ctx, image, x, y, size, accentSoft, accent) {
  ctx.fillStyle = 'rgba(7, 10, 16, 0.75)'
  ctx.fillRect(x, y, size, size)
  if (image) {
    ctx.drawImage(image, x, y, size, size)
  }
  ctx.strokeStyle = accentSoft
  ctx.lineWidth = 5
  ctx.strokeRect(x - 3, y - 3, size + 6, size + 6)
  ctx.strokeStyle = accent
  ctx.lineWidth = 1
  ctx.strokeRect(x - 7, y - 7, size + 14, size + 14)
}

async function downloadRecapImage(game, winners, groupName) {
  const theme = getEndingTheme(game.ending?.expansion)
  const winnerPortraits = getWinnerPortraits(game, winners)
  const portraitImages = await Promise.all(winnerPortraits.map((portrait) => loadImage(portrait.src)))
  const width = 1200
  const padding = 70
  const height = measureRecapHeight(game, winners, groupName, width, padding)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas_unavailable')

  const maxWidth = width - (padding * 2)
  const sections = getRecapSections(game, winners, groupName)

  const background = ctx.createLinearGradient(0, 0, width, height)
  background.addColorStop(0, theme.bgStart)
  background.addColorStop(1, theme.bgEnd)
  ctx.fillStyle = background
  ctx.fillRect(0, 0, width, height)

  ctx.strokeStyle = theme.accentSoft
  ctx.lineWidth = 4
  ctx.strokeRect(26, 26, width - 52, height - 52)

  let y = padding

  ctx.fillStyle = theme.text
  ctx.font = '700 54px "Cinzel", serif'
  ctx.textBaseline = 'top'
  for (const line of wrapText(ctx, game.title, maxWidth)) {
    ctx.fillText(line, padding, y)
    y += 68
  }

  y += 8
  ctx.fillStyle = theme.accent
  ctx.font = '500 24px "Alegreya Sans", sans-serif'
  ctx.fillText(`${formatDate(game.date)} | ${game.ending?.name ?? 'Unknown ending'}`, padding, y)
  y += 52

  let portraitBottom = 0
  let portraitExclusionWidth = 0
  if (winnerPortraits.length > 0) {
    const portraitSize = 132
    const gap = 28
    const totalWidth = (winnerPortraits.length * portraitSize) + ((winnerPortraits.length - 1) * gap)
    const portraitTop = y
    portraitBottom = portraitTop + portraitSize + 44
    portraitExclusionWidth = totalWidth + 36
    let x = width - padding - totalWidth
    for (let i = 0; i < winnerPortraits.length; i += 1) {
      drawPortraitCard(ctx, portraitImages[i], x, portraitTop, portraitSize, theme.accentSoft, theme.accent)
      ctx.fillStyle = theme.text
      ctx.font = '500 16px "Alegreya Sans", sans-serif'
      const label = winnerPortraits[i].label
      const labelLines = wrapText(ctx, label, portraitSize + 20).slice(0, 2)
      let labelY = portraitTop + portraitSize + 10
      for (const line of labelLines) {
        ctx.fillText(line, x, labelY)
        labelY += 20
      }
      x += portraitSize + gap
    }
  }

  for (const section of sections) {
    const sectionMaxWidth = y < portraitBottom ? maxWidth - portraitExclusionWidth : maxWidth
    ctx.fillStyle = theme.text
    ctx.font = '600 29px "Cinzel", serif'
    ctx.fillText(section.title, padding, y)
    y += sectionMaxWidth < maxWidth ? 52 : 48

    ctx.fillStyle = 'rgba(239, 231, 210, 0.96)'
    ctx.font = '400 24px "Alegreya Sans", sans-serif'
    for (const row of section.rows) {
      const rowMaxWidth = y < portraitBottom ? maxWidth - portraitExclusionWidth : maxWidth
      const wrapped = wrapText(ctx, row, rowMaxWidth - 24)
      for (const line of wrapped) {
        ctx.fillText(`- ${line}`, padding + 12, y)
        y += 33
      }
      y += 8
    }
    y += 12
  }

  ctx.fillStyle = `${theme.accent}E6`
  ctx.font = '400 21px "Alegreya Sans", sans-serif'
  ctx.fillText(`Talisman Tracker • ${theme.symbol} Theme`, padding, height - padding + 8)

  const blob = await canvasToBlob(canvas)
  if (!blob) throw new Error('image_export_failed')
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${sanitizeFilename(game.title)}-recap.png`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export default function GameDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [shareMessage, setShareMessage] = useState(null)
  const { activeGroupId, activeGroup, isLoading: groupsLoading } = useActiveGroup()
  const { data: currentPlayer, isLoading: currentPlayerLoading } = useCurrentPlayer()
  const { data: game, error, isLoading } = useGame(id)
  const deleteGame = useDeleteGame()

  const handleDelete = () => {
    if (!confirm('Delete this game? This cannot be undone.')) return
    deleteGame.mutate(id, {
      onSuccess: () => navigate('/history'),
    })
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-danger text-sm font-body">{error.message}</p>
      </div>
    )
  }
  if (groupsLoading || isLoading || currentPlayerLoading) return null

  if (!activeGroupId) {
    return (
      <GroupRequiredState
        title="Select a group to view game details"
        body="Game details are scoped to the active group. Pick the group that owns this session to continue."
      />
    )
  }
  if (!game) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-ornate bg-surface border border-gold-dim/15 rounded-xl p-6 text-center animate-fade-up">
          <h1 className="font-heading text-2xl text-parchment tracking-wide">Game not found</h1>
          <div className="ornament-divider mt-3">
            <span className="text-gold-dim">&#9670;</span>
          </div>
          <p className="text-muted font-body mt-4">
            This game is not in the active group, or it no longer exists.
          </p>
          <div className="mt-6 flex justify-center">
            <Link to="/history" className="btn-outline text-sm">
              Back to History
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const winners = game.players.filter(p => p.is_winner)
  const canEdit = canEditGame({ activeGroup, currentPlayer, game })
  const canDelete = canDeleteGame({ activeGroup, currentPlayer })
  const handleExportRecap = async () => {
    try {
      await downloadRecapImage(game, winners, activeGroup?.name ?? null)
      setShareMessage('Recap image downloaded.')
      setTimeout(() => setShareMessage(null), 2500)
    } catch {
      setShareMessage('Unable to generate recap image on this device.')
      setTimeout(() => setShareMessage(null), 2500)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-up">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link to="/history" className="text-muted text-sm font-body hover:text-gold/60 transition-colors mb-2 inline-block">
              &larr; Back to History
            </Link>
            <h1 className="font-heading text-3xl text-parchment tracking-wide">{game.title}</h1>
          </div>
          <div className="flex gap-2 mt-6">
            <button type="button" onClick={handleExportRecap} className="btn-outline text-sm">
              Download Recap Image
            </button>
            {canEdit ? (
              <Link to={`/games/${game.id}/edit`} className="btn-outline text-sm">
                Edit Game
              </Link>
            ) : (
              <span className="text-xs font-body text-muted self-center">No permission to edit this game</span>
            )}
            {canDelete && (
              <button onClick={handleDelete} disabled={deleteGame.isPending} className="btn-danger text-sm">
                {deleteGame.isPending ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
        </div>
        <div className="ornament-divider mt-3">
          <span className="text-gold-dim">&#9670;</span>
        </div>
        {deleteGame.error && (
          <p className="text-danger text-sm font-body mt-3">{deleteGame.error.message}</p>
        )}
        {shareMessage && (
          <p className="text-teal-light text-sm font-body mt-3">{shareMessage}</p>
        )}
      </div>

      {/* Game info card */}
      <div className="bg-surface border border-gold-dim/15 rounded-xl p-6 mb-6 animate-fade-up delay-1">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span className="text-muted text-xs font-body uppercase tracking-wider">Date</span>
            <p className="text-parchment font-body mt-1">{formatDate(game.date)}</p>
          </div>
          <div>
            <span className="text-muted text-xs font-body uppercase tracking-wider">Ending</span>
            <p className="text-parchment font-heading tracking-wide mt-1">{game.ending?.name}</p>
          </div>
          <div>
            <span className="text-muted text-xs font-body uppercase tracking-wider">
              {winners.length > 1 ? 'Winners' : 'Winner'}
            </span>
            {winners.length === 0 ? (
              <p className="text-gold font-heading tracking-wide mt-1">Talisman</p>
            ) : (
              <div className="mt-1 space-y-0.5">
                {winners.map(w => (
                  <p key={w.player.id} className="text-gold font-heading tracking-wide">
                    {w.player.name}
                    {w.winning_character && (
                      <span className="text-gold/50 font-body text-sm ml-1">as {w.winning_character}</span>
                    )}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
        {game.notes && (
          <div className="mt-4 pt-4 border-t border-gold-dim/10">
            <span className="text-muted text-xs font-body uppercase tracking-wider">Notes</span>
            <p className="text-parchment/70 font-body mt-1 italic">{game.notes}</p>
          </div>
        )}
      </div>

      {/* Participants */}
      <div className="mb-6 animate-fade-up delay-2">
        <h2 className="font-heading text-xl text-gold tracking-wide mb-4">Participants</h2>
        <div className="space-y-3">
          {game.players.map(gp => (
            <div
              key={gp.player.id}
              className={`bg-surface border rounded-xl p-5 ${
                gp.is_winner ? 'border-gold/30' : 'border-gold-dim/15'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className={`font-heading tracking-wide ${gp.is_winner ? 'text-gold text-lg' : 'text-parchment'}`}>
                    {gp.player.name}
                  </h3>
                  {gp.is_winner && (
                    <span className="px-2 py-0.5 bg-gold/15 border border-gold/30 rounded-full text-gold text-xs font-heading tracking-wider">
                      WINNER
                    </span>
                  )}
                </div>
                <span className="text-muted text-sm font-body">
                  {gp.total_deaths} death{gp.total_deaths !== 1 ? 's' : ''}
                  {(gp.total_toad_times ?? 0) > 0 && (
                    <> &middot; {gp.total_toad_times} toad time{gp.total_toad_times !== 1 ? 's' : ''}</>
                  )}
                </span>
              </div>
              {(gp.deaths ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {gp.deaths.map((d, i) => (
                    <span
                      key={d.id ?? i}
                      className="px-2.5 py-0.5 rounded-full text-xs font-body border border-danger/20 bg-danger/5 text-danger/80"
                    >
                      {d.character?.name && <>{d.character.name} &middot; </>}
                      {d.death_type?.name ?? 'Unknown'}
                      {d.killed_by && <> by {d.killed_by.name}</>}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                {gp.characters_played.map((char, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5">
                    {idx > 0 && <span className="text-gold-dim/40 text-xs">&rarr;</span>}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-body border ${
                        gp.is_winner && char === gp.winning_character
                          ? 'border-gold/30 bg-gold/10 text-gold'
                          : 'border-gold-dim/15 bg-elevated/50 text-parchment/60'
                      }`}
                    >
                      {char}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Highscores */}
      {game.highscores.length > 0 && (
        <div className="mb-6 animate-fade-up delay-3">
          <h2 className="font-heading text-xl text-gold tracking-wide mb-4">Game Highscores</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {game.highscores.map(hs => (
              <div key={hs.id ?? hs.category} className="bg-surface border border-gold-dim/15 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-heading text-parchment/80 tracking-wide">
                    {CATEGORY_LABELS[hs.category] || hs.category}
                  </p>
                  <p className="text-gold/70 text-sm font-body mt-0.5">
                    {hs.player?.name ?? 'Game record'}
                  </p>
                </div>
                <span className="text-gold font-display text-2xl">{hs.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expansion Events */}
      {game.expansion_events.length > 0 && (
        <div className="animate-fade-up delay-4">
          <h2 className="font-heading text-xl text-gold tracking-wide mb-4">Expansion Events</h2>
          <div className="space-y-3">
            {groupEventsByPlayer(game.expansion_events).map((group, idx) => (
              <div key={group.player?.id ?? idx} className="bg-surface border border-gold-dim/15 rounded-xl p-4">
                <h3 className="font-heading text-sm text-parchment tracking-wide mb-3">
                  {group.player?.name ?? 'Unassigned'}
                </h3>
                <div className="space-y-2">
                  {group.woodlandPaths.length > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-teal/10 border border-teal/20 rounded-lg text-teal-light text-xs font-heading tracking-wider uppercase">
                        Woodland
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {group.woodlandPaths.map((path, i) => (
                          <WoodlandPathTooltip key={i} name={path}>
                            <span className="px-2 py-0.5 rounded-full text-xs font-body border border-gold-dim/20 text-parchment/70 cursor-default">
                              {path}
                            </span>
                          </WoodlandPathTooltip>
                        ))}
                      </div>
                    </div>
                  )}
                  {group.dungeonBeaten && (
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 bg-teal/10 border border-teal/20 rounded-lg text-teal-light text-xs font-heading tracking-wider uppercase">
                        Dungeon
                      </span>
                      <span className="text-sm font-body text-parchment/80">Dungeon Beaten</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
