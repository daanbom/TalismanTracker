export default function RulesTable({ table }) {
  return (
    <div className="mt-3">
      {table.title && (
        <h5 className="font-heading text-sm text-gold/80 tracking-wide mb-2">
          {table.title}
        </h5>
      )}
      <div className="border border-gold-dim/15 rounded-lg overflow-hidden">
        <table className="w-full text-sm font-body">
          <thead className="bg-elevated/60">
            <tr>
              {table.headers.map((h, i) => (
                <th
                  key={i}
                  className="text-left px-4 py-2 text-muted uppercase tracking-wider text-xs font-heading"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri} className="border-t border-gold-dim/10">
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`px-4 py-2 ${
                      ci === 0 ? 'text-parchment/90' : 'text-parchment/80'
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
