import { useEffect, useState } from 'react'
import { useEncounterScores } from '../hooks/useEncounterScores'
import { useUpdateEncounterScore } from '../hooks/useUpdateEncounterScore'
import { useActiveGroup } from '../hooks/useActiveGroup'
import ScopeToggle from '../components/ScopeToggle'
import GroupRequiredState from '../components/GroupRequiredState'

const ENCOUNTERS = [
  {
    name: 'Basilisk',
    type: 'Strength',
    description: 'Turns players to stone',
  },
  {
    name: 'Dark Fey',
    type: 'Craft',
    description: 'Turns players into a toad on doubles',
  },
]

function ScoreButton({ label, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-9 h-9 rounded-lg border border-gold-dim/20 bg-elevated text-parchment/70 font-heading text-lg transition-colors hover:bg-gold/10 hover:text-gold hover:border-gold-dim/40 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-elevated disabled:hover:text-parchment/70 disabled:hover:border-gold-dim/20"
    >
      {label}
    </button>
  )
}

function Crown() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-gold drop-shadow-[0_0_4px_rgba(212,175,55,0.6)]">
      <path d="M3 18l2-9 5 5 2-9 2 9 5-5 2 9H3z" />
    </svg>
  )
}

function ScoreSide({ label, value, onIncrement, onDecrement, isPending, isWinning, readOnly }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="h-5">{isWinning && <Crown />}</div>
      <span className="text-xs font-body text-muted uppercase tracking-wider">{label}</span>
      <span className="font-display text-5xl text-gold tracking-wider tabular-nums">{value}</span>
      <div className="flex gap-2">
        <ScoreButton label="-" onClick={onDecrement} disabled={readOnly || isPending || value <= 0} />
        <ScoreButton label="+" onClick={onIncrement} disabled={readOnly || isPending} />
      </div>
    </div>
  )
}

function EncounterCard({ encounter, score, onUpdate, isPending, readOnly }) {
  const creatureWins = score?.creatureWins ?? 0
  const playerWins = score?.playerWins ?? 0

  return (
    <div className="bg-surface border border-gold-dim/15 rounded-xl p-6 sm:p-8">
      <div className="text-center mb-6">
        <h2 className="font-heading text-xl text-parchment tracking-wide">{encounter.name}</h2>
        <p className="text-muted text-xs font-body mt-1">
          {encounter.type} &middot; {encounter.description}
        </p>
      </div>

      <div className="flex items-center justify-center gap-8 sm:gap-12">
        <ScoreSide
          label={encounter.name}
          value={creatureWins}
          onIncrement={() => onUpdate(encounter.name, 'creature_wins', 1)}
          onDecrement={() => onUpdate(encounter.name, 'creature_wins', -1)}
          isPending={isPending}
          isWinning={creatureWins > playerWins}
          readOnly={readOnly}
        />

        <div className="flex flex-col items-center gap-1 select-none">
          <span className="font-display text-2xl text-gold-dim/40 tracking-widest">vs</span>
        </div>

        <ScoreSide
          label="Players"
          value={playerWins}
          onIncrement={() => onUpdate(encounter.name, 'player_wins', 1)}
          onDecrement={() => onUpdate(encounter.name, 'player_wins', -1)}
          isPending={isPending}
          isWinning={playerWins > creatureWins}
          readOnly={readOnly}
        />
      </div>
    </div>
  )
}

export default function Counters() {
  const { activeGroupId, activeGroup } = useActiveGroup()
  const [scope, setScope] = useState(() => activeGroupId ? 'group' : 'global')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setScope(activeGroupId ? 'group' : 'global')
  }, [activeGroupId])

  const groupId = scope === 'group' ? activeGroupId : null
  const { data: scores = [], error, isLoading } = useEncounterScores(groupId)
  const mutation = useUpdateEncounterScore()
  const isReadOnly = scope !== 'group'

  const handleUpdate = (encounterName, column, delta) => {
    if (isReadOnly || !activeGroupId) return
    mutation.mutate({ groupId: activeGroupId, encounterName, column, delta })
  }

  const scoresByName = new Map(scores.map((s) => [s.encounterName, s]))

  if (scope === 'group' && !activeGroupId) {
    return (
      <GroupRequiredState
        title="Select a group to update encounter counters"
        body="Global view shows the combined totals across your groups. Pick an active group when you want to edit its counters."
      />
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fade-up text-center">
        <h1 className="font-heading text-3xl text-parchment tracking-wide">Encounter Counters</h1>
        <div className="ornament-divider mt-3">
          <span className="text-gold-dim">&#9670;</span>
        </div>
        <div className="mt-3 flex justify-center">
          <ScopeToggle value={scope} onChange={setScope} groupName={activeGroup?.name ?? null} />
        </div>
        <p className="text-muted text-sm font-body mt-3">
          {scope === 'group'
            ? `Editing counters for ${activeGroup?.name ?? 'the active group'}.`
            : 'Combined encounter totals across all of your groups. Switch to a group to edit.'}
        </p>
      </div>

      {error && (
        <p className="text-danger text-sm font-body mb-4">{error.message}</p>
      )}
      {mutation.error && (
        <p className="text-danger text-sm font-body mb-4">{mutation.error.message}</p>
      )}
      {isLoading && (
        <p className="text-muted text-sm font-body italic">Loading...</p>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up delay-1">
          {ENCOUNTERS.map((encounter) => (
            <EncounterCard
              key={encounter.name}
              encounter={encounter}
              score={scoresByName.get(encounter.name)}
              onUpdate={handleUpdate}
              isPending={mutation.isPending}
              readOnly={isReadOnly}
            />
          ))}
        </div>
      )}
      {!groupId && !isLoading && (
        <p className="text-muted text-xs font-body mt-4 text-center">
          Global view is read-only. Switch to a group to update counters.
        </p>
      )}
    </div>
  )
}
