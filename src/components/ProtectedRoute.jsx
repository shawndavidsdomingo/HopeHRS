import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Still checking — avoid flash
  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    )
  }

  // Not logged in — redirect to login
  if (!session) {
    return <Navigate to="/" replace />
  }

  return children
}