import { supabase } from '../lib/supabase'

export function useGoogleLogin() {
  const signInWithPopup = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: true,
        queryParams: {
          prompt: 'select_account',
        },
      },
    })

    if (error) {
      console.error('OAuth error:', error.message)
      return
    }

    if (!data?.url) {
      console.error('No OAuth URL returned from Supabase')
      return
    }

    const width = 500
    const height = 600
    const left = window.screenX + (window.outerWidth - width) / 2
    const top = window.screenY + (window.outerHeight - height) / 2

    const popup = window.open(
      data.url,
      'GoogleLogin',
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
    )

    if (!popup) {
      alert('Popup was blocked! Please allow popups for this site and try again.')
      return
    }

    const redirect = () => {
      window.location.href = '/dashboard'
    }

    // Primary: postMessage from AuthCallback (fast, reliable)
    const handleMessage = (event) => {
      if (event.origin !== window.location.origin) return
      if (event.data === 'auth-success') {
        cleanup()
        redirect()
      }
    }
    window.addEventListener('message', handleMessage)

    // Fallback: onAuthStateChange — fires when Supabase writes the session
    // to localStorage, even if postMessage is blocked by COOP
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        cleanup()
        redirect()
      }
    })

    const cleanup = () => {
      window.removeEventListener('message', handleMessage)
      subscription.unsubscribe()
      clearTimeout(safetyTimer)
    }

    // Safety cleanup after 5 minutes
    const safetyTimer = setTimeout(cleanup, 300_000)
  }

  return { signInWithPopup }
}