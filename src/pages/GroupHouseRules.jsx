import { Link } from 'react-router-dom'
import { useState, lazy, Suspense } from 'react'
import { useActiveGroup } from '../hooks/useActiveGroup'
import { useGroupHouseRules } from '../hooks/useGroupHouseRules'
import { useSaveGroupHouseRules } from '../hooks/useSaveGroupHouseRules'
import { useIsActiveGroupAdmin } from '../hooks/useIsActiveGroupAdmin'
import GroupHouseRulesView from './GroupHouseRulesView'

const GroupHouseRulesEditor = lazy(() => import('./GroupHouseRulesEditor'))

function NoActiveGroup() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <h1 className="font-heading text-2xl text-parchment tracking-wide mb-3">
        Select a group first
      </h1>
      <p className="text-muted font-body mb-6">
        Group house rules are scoped to an active group. Pick one from the group switcher.
      </p>
      <Link
        to="/house-rules"
        className="text-gold-light hover:text-gold font-body text-sm transition-colors"
      >
        &larr; Back to House Rules
      </Link>
    </div>
  )
}

function EmptyState({ groupName, isAdmin, onAddSection }) {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      <Link
        to="/house-rules"
        className="text-muted hover:text-gold-light font-body text-sm inline-flex items-center gap-1.5 mb-8 transition-colors"
      >
        <span aria-hidden>&larr;</span> Back to House Rules
      </Link>
      <h1 className="font-heading text-3xl text-parchment tracking-wide mb-3">
        {groupName} House Rules
      </h1>
      <p className="text-muted font-body mb-6">
        {groupName} has not added house rules yet.
      </p>
      {isAdmin && (
        <button
          type="button"
          onClick={onAddSection}
          className="border border-gold-dim/40 hover:border-gold-dim/80 text-gold-light hover:text-gold font-heading text-sm tracking-wide px-5 py-2.5 rounded-md transition-colors"
        >
          Add section
        </button>
      )}
    </div>
  )
}

export default function GroupHouseRules() {
  const { activeGroup } = useActiveGroup()
  const isAdmin = useIsActiveGroupAdmin()
  const { data, isLoading } = useGroupHouseRules(activeGroup?.id)
  const save = useSaveGroupHouseRules(activeGroup?.id)
  const [editing, setEditing] = useState(false)
  const [staleConflict, setStaleConflict] = useState(false)

  if (!activeGroup) return <NoActiveGroup />
  if (isLoading) return null

  const sections = data?.content?.sections ?? []
  const groupName = activeGroup.name

  const handleSave = async ({ content, expectedUpdatedAt }) => {
    setStaleConflict(false)
    try {
      const result = await save.mutateAsync({ content, expectedUpdatedAt })
      if (result.stale) {
        setStaleConflict(true)
        return
      }
      setEditing(false)
    } catch (err) {
      window.alert(`Save failed: ${err.message ?? 'unknown error'}`)
    }
  }

  if (editing && isAdmin) {
    return (
      <Suspense fallback={null}>
        <GroupHouseRulesEditor
          groupName={groupName}
          initialDoc={data?.content ?? { sections: [] }}
          initialUpdatedAt={data?.updatedAt}
          onSave={handleSave}
          onCancel={() => {
            setStaleConflict(false)
            setEditing(false)
          }}
          saving={save.isPending}
          staleConflict={staleConflict}
          onDismissStale={() => setStaleConflict(false)}
        />
      </Suspense>
    )
  }

  if (sections.length === 0) {
    return (
      <EmptyState
        groupName={groupName}
        isAdmin={isAdmin}
        onAddSection={() => setEditing(true)}
      />
    )
  }

  return (
    <GroupHouseRulesView
      doc={data?.content}
      groupName={groupName}
      onEnterEdit={isAdmin ? () => setEditing(true) : undefined}
    />
  )
}
