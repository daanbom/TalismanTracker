import { useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { WOODLAND_PATHS } from '../data/woodlandPaths'

const TOOLTIP_WIDTH = 256
const GAP = 8
const MARGIN = 8

export function WoodlandPathTooltip({ name, children }) {
  const [anchor, setAnchor] = useState(null)
  const [pos, setPos] = useState(null)
  const tooltipRef = useRef(null)
  const data = WOODLAND_PATHS.find(p => p.name === name)

  useLayoutEffect(() => {
    if (!anchor || !tooltipRef.current) return
    const tipH = tooltipRef.current.offsetHeight
    const vw = window.innerWidth
    const vh = window.innerHeight

    let left = anchor.left
    if (left + TOOLTIP_WIDTH + MARGIN > vw) left = vw - TOOLTIP_WIDTH - MARGIN
    if (left < MARGIN) left = MARGIN

    let top = anchor.top - tipH - GAP
    if (top < MARGIN) top = anchor.bottom + GAP
    if (top + tipH + MARGIN > vh) top = Math.max(MARGIN, vh - tipH - MARGIN)

    setPos({ left, top })
  }, [anchor])

  return (
    <div
      className="relative inline-block"
      onMouseEnter={e => {
        const rect = e.currentTarget.getBoundingClientRect()
        setAnchor({ left: rect.left, top: rect.top, bottom: rect.bottom })
      }}
      onMouseLeave={() => { setAnchor(null); setPos(null) }}
    >
      {children}
      {anchor && createPortal(
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            left: pos ? pos.left : anchor.left,
            top: pos ? pos.top : anchor.top,
            width: TOOLTIP_WIDTH,
            visibility: pos ? 'visible' : 'hidden',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <div className="bg-deep border border-gold-dim/30 rounded-lg p-3 shadow-xl">
            <p className="font-heading text-xs text-gold mb-2">{data?.name ?? name}</p>
            {data ? (
              <>
                <p className="text-xs font-body text-parchment/80 mb-2">{data.passive}</p>
                <p className="text-xs font-body text-teal-light/80 border-t border-gold-dim/20 pt-2">
                  <span className="text-muted">Destiny: </span>{data.destiny}
                </p>
              </>
            ) : (
              <p className="text-xs font-body italic text-muted">No details available for this path.</p>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
