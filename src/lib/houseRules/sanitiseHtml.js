import DOMPurify from 'dompurify'

const ALLOWED_TAGS = ['p', 'strong', 'em', 'a', 'br', 'ul', 'ol', 'li']
const ALLOWED_ATTR = ['href']

export function sanitiseParagraphHtml(html) {
  if (typeof html !== 'string' || html.length === 0) return ''
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  })
}
