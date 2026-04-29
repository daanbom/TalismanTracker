// Convert stored table shape -> TipTap doc JSON.
// Stored: { headers: string[], rows: string[][] }
export function tableToTipTapDoc({ headers, rows }) {
  const safeHeaders = Array.isArray(headers) && headers.length > 0 ? headers : ['Column 1']
  const safeRows = Array.isArray(rows) ? rows : []
  return {
    type: 'doc',
    content: [
      {
        type: 'table',
        content: [
          {
            type: 'tableRow',
            content: safeHeaders.map((h) => ({
              type: 'tableHeader',
              content: [{ type: 'paragraph', content: textToInline(h) }],
            })),
          },
          ...safeRows.map((row) => ({
            type: 'tableRow',
            content: padRow(row, safeHeaders.length).map((cell) => ({
              type: 'tableCell',
              content: [{ type: 'paragraph', content: textToInline(cell) }],
            })),
          })),
        ],
      },
    ],
  }
}

export function tipTapDocToTable(doc) {
  const empty = { headers: ['Column 1'], rows: [] }
  if (!doc || doc.type !== 'doc') return empty
  const table = (doc.content ?? []).find((n) => n.type === 'table')
  if (!table) return empty

  const trs = (table.content ?? []).filter((n) => n.type === 'tableRow')
  if (trs.length === 0) return empty

  const headerCells = trs[0].content ?? []
  const headers = headerCells.map((c) => paragraphToText(firstParagraph(c)))
  const cleanedHeaders = headers.length === 0 ? ['Column 1'] : headers

  const rows = trs.slice(1).map((tr) => {
    const cells = (tr.content ?? []).map((c) => paragraphToText(firstParagraph(c)))
    return padRow(cells, cleanedHeaders.length)
  })

  return { headers: cleanedHeaders, rows }
}

function firstParagraph(cell) {
  if (!cell) return null
  return (cell.content ?? []).find((n) => n.type === 'paragraph') ?? null
}

function paragraphToText(paragraph) {
  if (!paragraph) return ''
  return (paragraph.content ?? [])
    .map((node) => (node.type === 'text' ? node.text : ''))
    .join('')
}

function textToInline(text) {
  if (!text) return []
  return [{ type: 'text', text }]
}

function padRow(row, length) {
  const safe = Array.isArray(row) ? row.slice(0, length) : []
  while (safe.length < length) safe.push('')
  return safe
}
