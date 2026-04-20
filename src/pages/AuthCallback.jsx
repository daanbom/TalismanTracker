import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/', { replace: true })
      else navigate('/login', { replace: true })
    })
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center text-parchment bg-deep">
      Signing you in…
    </div>
  )
}
