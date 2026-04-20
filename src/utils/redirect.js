// Returns a safe same-origin relative path, or '/' if input is unsafe.
// Accepts: strings starting with '/', not starting with '//', no ':' before the first '/'.
export function sanitizeNext(raw) {
  if (typeof raw !== 'string' || raw.length === 0) return '/'
  if (!raw.startsWith('/')) return '/'
  if (raw.startsWith('//')) return '/'
  const firstSlash = raw.indexOf('/', 1)
  const head = firstSlash === -1 ? raw.slice(1) : raw.slice(1, firstSlash)
  if (head.includes(':')) return '/'
  return raw
}
