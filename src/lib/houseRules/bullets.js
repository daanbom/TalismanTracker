// Convert stored bullets shape -> TipTap doc JSON.
// Stored: { items: [{ text: string, subrules: string[] }] }
// TipTap: bulletList containing listItems, each with a paragraph and an optional nested bulletList.
export function bulletsToTipTapDoc(items) {
  const safe = Array.isArray(items) ? items : []
  return {
    type: 'doc',
    content: [
      {
        type: 'bulletList',
        content: safe.map((item) => {
          const subrules = Array.isArray(item.subrules) ? item.subrules : []
          const listItemContent = [
            { type: 'paragraph', content: textToInline(item.text) },
          ]
          if (subrules.length > 0) {
            listItemContent.push({
              type: 'bulletList',
              content: subrules.map((sub) => ({
                type: 'listItem',
                content: [{ type: 'paragraph', content: textToInline(sub) }],
              })),
            })
          }
          return { type: 'listItem', content: listItemContent }
        }),
      },
    ],
  }
}

// Convert a TipTap doc JSON back to the stored bullets shape.
// We only honour one level of nesting; deeper nesting is flattened to text on the parent.
export function tipTapDocToBullets(doc) {
  if (!doc || doc.type !== 'doc') return []
  const rows = []
  const content = doc.content ?? []

  content.forEach((node) => {
    if (node.type === 'bulletList') {
      rows.push(...listToRows(node))
      return
    }
    if (node.type === 'paragraph') {
      const text = paragraphToText(node)
      if (text.length > 0) rows.push({ text, subrules: [] })
    }
  })

  return rows.filter((row) => row.text.length > 0 || row.subrules.length > 0)
}

function textToInline(text) {
  if (!text) return []
  return [{ type: 'text', text }]
}

function paragraphToText(paragraph) {
  if (!paragraph) return ''
  return (paragraph.content ?? [])
    .map((node) => (node.type === 'text' ? node.text : ''))
    .join('')
}

function listToRows(list) {
  return (list.content ?? [])
    .filter((n) => n.type === 'listItem')
    .map((li) => {
      const paragraph = (li.content ?? []).find((n) => n.type === 'paragraph')
      const text = paragraphToText(paragraph)
      const nestedList = (li.content ?? []).find((n) => n.type === 'bulletList')
      const subrules = nestedList
        ? flattenNestedTexts(nestedList)
        : []
      return { text, subrules }
    })
}

function flattenNestedTexts(list) {
  return (list.content ?? [])
    .filter((n) => n.type === 'listItem')
    .flatMap((li) => {
      const paragraph = (li.content ?? []).find((n) => n.type === 'paragraph')
      const text = paragraphToText(paragraph)
      const nestedList = (li.content ?? []).find((n) => n.type === 'bulletList')
      const own = text.length > 0 ? [text] : []
      const descendants = nestedList ? flattenNestedTexts(nestedList) : []
      return own.concat(descendants)
    })
}
