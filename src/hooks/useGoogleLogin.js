import { supabase } from '../lib/supabase'

export function useGoogleLogin() {
  const signInWithPopup = async () => {
    // Get the OAuth URL without redirecting the current tab
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

    // Open Google login in a popup window
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
      console.error('Popup was blocked. Please allow popups for localhost.')
      alert('Popup was blocked! Please allow popups for this site and try again.')
      return
    }

    // Poll every 500ms — when popup closes, check for session
    const timer = setInterval(async () => {
      if (popup.closed) {
        clearInterval(timer)
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          window.location.href = '/dashboard'
        }
      }
    }, 500)
  }

  return { signInWithPopup }
}