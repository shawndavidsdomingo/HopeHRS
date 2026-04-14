import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase automatically detects and exchanges the code/token in the URL
    // via detectSessionInUrl (enabled by default). We just wait for it.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        subscription.unsubscribe()

        // If inside a popup, notify the parent window then close
        if (window.opener && !window.opener.closed) {
          try {
            window.opener.postMessage('auth-success', window.location.origin)
          } catch (e) {
            console.log('Could not send message to parent:', e)
          }
          setTimeout(() => window.close(), 100)
          return
        }

        // Fallback: same-tab redirect
        navigate('/dashboard', { replace: true })
      }
    })

    // If onAuthStateChange never fires (e.g. already signed in, no code in URL),
    // check for an existing session and handle accordingly
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        subscription.unsubscribe()
        if (window.opener && !window.opener.closed) {
          try {
            window.opener.postMessage('auth-success', window.location.origin)
          } catch (e) {
            console.log('Could not send message to parent:', e)
          }
          setTimeout(() => window.close(), 100)
          return
        }
        navigate('/dashboard', { replace: true })
      } else {
        // No session and no code — something went wrong
        const params = new URLSearchParams(window.location.search)
        if (!params.get('code') && !window.location.hash.includes('access_token')) {
          navigate('/login', { replace: true })
        }
        // Otherwise wait for onAuthStateChange to fire after code exchange
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-gray-400">Signing you in...</p>
    </div>
  )
}