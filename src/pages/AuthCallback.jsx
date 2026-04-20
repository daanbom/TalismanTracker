import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { sanitizeNext } from '../utils/redirect'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const next = sanitizeNext(searchParams.get('next'))
        navigate(next, { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    })
  }, [navigate, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center text-parchment bg-deep">
      Signing you in…
    </div>
  )
}
