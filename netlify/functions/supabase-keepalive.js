import process from 'node:process'

export default async function supabaseKeepalive() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase keepalive requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the Netlify Functions environment.',
    )
  }

  const url = new URL('/rest/v1/characters', supabaseUrl)
  url.search = new URLSearchParams({ select: 'id', limit: '1' }).toString()

  const response = await fetch(url, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  })

  if (!response.ok) {
    throw new Error(`Supabase keepalive failed with HTTP ${response.status}. Check the project status and API key.`)
  }

  const characters = await response.json()
  if (!Array.isArray(characters) || characters.length === 0) {
    throw new Error('Supabase keepalive could not read a character. Check the seed data and read policy.')
  }

  console.info('Supabase keepalive succeeded.')
}
