import { useState, useRef, useEffect } from 'react'
import { PARAGRAPH, BULLETS, TABLE } from '../../../lib/houseRules/newDoc'

export default function AddBlockPopover({ onAdd }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const choose = (kind) => {
    setOpen(false)
    onAdd(kind)
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="border border-dashed border-gold-dim/40 hover:border-gold-dim/80 text-parchment/70 hover:text-gold-light font-body text-sm px-4 py-2 rounded-md transition-colors"
      >
        + Add block
      </button>
      {open && (
        <div className="absolute z-10 mt-2 left-0 bg-elevated border border-gold-dim/30 rounded-md shadow-lg p-1 flex flex-col min-w-[10rem]">
          <button
            type="button"
            onClick={() => choose(PARAGRAPH)}
            className="text-left px-3 py-2 text-parchment/85 hover:bg-surface hover:text-gold-light text-sm rounded"
          >
            Paragraph
          </button>
          <button
            type="button"
            onClick={() => choose(BULLETS)}
            className="text-left px-3 py-2 text-parchment/85 hover:bg-surface hover:text-gold-light text-sm rounded"
          >
            Bullets
          </button>
          <button
            type="button"
            onClick={() => choose(TABLE)}
            className="text-left px-3 py-2 text-parchment/85 hover:bg-surface hover:text-gold-light text-sm rounded"
          >
            Table
          </button>
        </div>
      )}
    </div>
  )
}
