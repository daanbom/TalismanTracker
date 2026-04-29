export const PARAGRAPH = 'paragraph'
export const BULLETS = 'bullets'
export const TABLE = 'table'

const newId = () => globalThis.crypto.randomUUID()

export function emptyDoc() {
  return { sections: [] }
}

export function newSection(title = 'New section') {
  return { id: newId(), title, boxes: [] }
}

export function newBox(title = 'New box') {
  return { id: newId(), title, blocks: [] }
}

export function newParagraphBlock(html = '<p></p>') {
  return { id: newId(), kind: PARAGRAPH, html }
}

export function newBulletsBlock() {
  return { id: newId(), kind: BULLETS, items: [{ text: '', subrules: [] }] }
}

export function newTableBlock(headers = ['Column 1', 'Column 2'], rows = [['', '']]) {
  return { id: newId(), kind: TABLE, headers, rows }
}

export function newBlockOfKind(kind) {
  if (kind === PARAGRAPH) return newParagraphBlock()
  if (kind === BULLETS) return newBulletsBlock()
  if (kind === TABLE) return newTableBlock()
  throw new Error(`Unknown block kind: ${kind}`)
}

// Reorder helpers. Each returns a new array; the original is not mutated.
export function moveItemUp(items, index) {
  if (index <= 0 || index >= items.length) return items
  const next = items.slice()
  ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
  return next
}

export function moveItemDown(items, index) {
  if (index < 0 || index >= items.length - 1) return items
  const next = items.slice()
  ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
  return next
}

export function removeItemAt(items, index) {
  if (index < 0 || index >= items.length) return items
  return items.slice(0, index).concat(items.slice(index + 1))
}

export function replaceItemAt(items, index, value) {
  if (index < 0 || index >= items.length) return items
  const next = items.slice()
  next[index] = value
  return next
}
