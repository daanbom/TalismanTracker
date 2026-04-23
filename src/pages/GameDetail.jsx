import { useParams, Link, useNavigate } from 'react-router-dom'
import { useGame } from '../hooks/useGame'
import { useDeleteGame } from '../hooks/useDeleteGame'
import { useActiveGroup } from '../hooks/useActiveGroup'
import { useCurrentPlayer } from '../hooks/useCurrentPlayer'
import GroupRequiredState from '../components/GroupRequiredState'
import { WoodlandPathTooltip } from '../components/WoodlandPathTooltip'
import { canDeleteGame, canEditGame } from '../lib/accessControl'

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

export default function GameDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
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
