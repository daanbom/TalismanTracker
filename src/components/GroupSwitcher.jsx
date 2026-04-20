import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useActiveGroup } from '../hooks/useActiveGroup'

export default function GroupSwitcher({ onNavigate }) {
  const { activeGroup, groups, setActiveGroup } = useActiveGroup()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const containerRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const label = activeGroup?.name ?? 'No group'

  const choose = (id) => {
    setActiveGroup(id)
    setOpen(false)
    onNavigate?.()
  }

  const goCreate = () => {
    setOpen(false)
    onNavigate?.()
    navigate('/groups/new')
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="px-3 py-1.5 text-sm font-heading text-parchment/80 border border-gold-dim/40 rounded hover:text-gold hover:border-gold-dim transition-colors"
      >
        {label} <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-deep border border-gold-dim/40 rounded shadow-lg z-50 overflow-hidden">
          {groups.length === 0 && (
            <div className="px-3 py-2 text-xs text-parchment/50 font-body italic">
              You're not in any groups yet.
            </div>
          )}
          {groups.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => choose(g.id)}
              className={`w-full text-left px-3 py-2 text-sm font-heading transition-colors ${
                g.id === activeGroup?.id
                  ? 'text-gold bg-gold/10'
                  : 'text-parchment hover:bg-gold/5'
              }`}
            >
              {g.name}
            </button>
          ))}
          <button
            type="button"
            disabled
            title="Global view — coming soon"
            className="w-full text-left px-3 py-2 text-sm font-heading text-parchment/40 cursor-not-allowed"
          >
            Global (disabled)
          </button>
          <div className="border-t border-gold-dim/20" />
          <button
            type="button"
            onClick={goCreate}
            className="w-full text-left px-3 py-2 text-sm font-heading text-gold hover:bg-gold/10 transition-colors"
          >
            + Create group
          </button>
        </div>
      )}
    </div>
  )
}
