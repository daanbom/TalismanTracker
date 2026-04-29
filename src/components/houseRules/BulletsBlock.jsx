export default function BulletsBlock({ block }) {
  const items = Array.isArray(block.items) ? block.items : []
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex flex-col gap-2">
          <div className="flex gap-3 text-parchment/85 font-body text-sm leading-relaxed">
            <span className="text-gold-dim flex-shrink-0 mt-1.5 text-xs">&#9670;</span>
            <span>{item.text}</span>
          </div>
          {item.subrules?.length > 0 && (
            <ul className="ml-6 space-y-1.5">
              {item.subrules.map((sub, si) => (
                <li
                  key={si}
                  className="flex gap-3 text-parchment/70 font-body text-sm leading-relaxed"
                >
                  <span className="text-gold-dim/60 flex-shrink-0 mt-1.5 text-xs">&#9642;</span>
                  <span>{sub}</span>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  )
}
