function ToolbarButton({ label, onClick, disabled, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="w-7 h-7 inline-flex items-center justify-center rounded border border-gold-dim/30 text-parchment/70 hover:text-gold hover:border-gold-dim/60 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-parchment/70 disabled:hover:border-gold-dim/30 transition-colors"
    >
      {children}
    </button>
  )
}

export default function BlockToolbar({ onMoveUp, onMoveDown, onDelete, canMoveUp, canMoveDown }) {
  return (
    <div className="flex items-center gap-1">
      <ToolbarButton label="Move up" onClick={onMoveUp} disabled={!canMoveUp}>&uarr;</ToolbarButton>
      <ToolbarButton label="Move down" onClick={onMoveDown} disabled={!canMoveDown}>&darr;</ToolbarButton>
      <ToolbarButton label="Delete" onClick={onDelete}>&times;</ToolbarButton>
    </div>
  )
}
