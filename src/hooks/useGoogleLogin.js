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

    // Better approach: Use message event listener instead of polling popup.closed
    const handleMessage = (event) => {
      // Validate the origin for security
      if (event.origin !== window.location.origin) return
      
      if (event.data === 'auth-success') {
        window.removeEventListener('message', handleMessage)
        
        // Check for session and redirect
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            window.location.href = '/dashboard'
          }
        })
      }
    }
    
    window.addEventListener('message', handleMessage)
    
    // Fallback: Poll for popup closure with try-catch to handle errors
    const timer = setInterval(() => {
      try {
        if (!popup || popup.closed) {
          clearInterval(timer)
          window.removeEventListener('message', handleMessage)
          
          // Check session when popup closes
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
              window.location.href = '/dashboard'
            }
          })
        }
      } catch (e) {
        // If we can't access popup.closed due to cross-origin policy,
        // we'll rely on the message event instead
        console.log('Cannot access popup.closed due to cross-origin policy, relying on message event')
      }
    }, 500)
    
    // Cleanup timeout - if popup doesn't close in 5 minutes, clean up
    setTimeout(() => {
      clearInterval(timer)
      window.removeEventListener('message', handleMessage)
    }, 300000)
  }

  return { signInWithPopup }
}