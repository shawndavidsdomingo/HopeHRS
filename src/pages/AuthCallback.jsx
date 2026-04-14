import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      // If inside a popup, close it and notify parent
      if (window.opener && !window.opener.closed) {
        // Send message to parent window before closing
        try {
          window.opener.postMessage('auth-success', window.location.origin)
        } catch (e) {
          console.log('Could not send message to parent:', e)
        }
        
        // Small delay to ensure message is sent before closing
        setTimeout(() => {
          window.close()
        }, 100)
        return
      }

      // Fallback for same-tab redirect
      if (session) {
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    })
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-gray-400">Signing you in...</p>
    </div>
  )
}