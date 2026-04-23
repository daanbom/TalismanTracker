export default function ScopeToggle({
  value,
  onChange,
  groupName,
  leftLabel = 'Global',
  leftValue = 'global',
  rightValue = 'group',
}) {
  const groupDisabled = !groupName

  return (
    <div className="inline-flex rounded-lg border border-gold-dim/30 overflow-hidden">
      <button
        type="button"
        onClick={() => value !== leftValue && onChange(leftValue)}
        className={`px-4 py-1.5 text-sm font-heading transition-colors border-r border-gold-dim/30 ${
          value === leftValue
            ? 'bg-gold/20 text-gold'
            : 'text-parchment/60 hover:text-parchment hover:bg-gold/5'
        }`}
      >
        {leftLabel}
      </button>
      <button
        type="button"
        onClick={() => value !== rightValue && onChange(rightValue)}
        disabled={groupDisabled}
        title={groupDisabled ? 'Select a group first' : undefined}
        className={`px-4 py-1.5 text-sm font-heading transition-colors ${
          value === rightValue
            ? 'bg-gold/20 text-gold'
            : groupDisabled
            ? 'text-parchment/30 cursor-not-allowed'
            : 'text-parchment/60 hover:text-parchment hover:bg-gold/5'
        }`}
      >
        {groupName ?? 'Group'}
      </button>
    </div>
  )
}
