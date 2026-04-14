import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '../hooks/useGoogleLogin'

export default function Register() {
  const { signInWithPopup } = useGoogleLogin()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-10 w-full max-w-sm text-center">

        <div className="font-extrabold text-2xl tracking-tight mb-1">
          Hope<span className="text-emerald-600">HRM</span>
        </div>
        <p className="text-sm text-gray-400 mb-2">Create your account</p>

        <div className="bg-emerald-50 rounded-xl px-4 py-3 mb-6 text-left">
          <p className="text-xs text-emerald-700 font-medium mb-1">No password needed</p>
          <p className="text-xs text-emerald-600">
            HopeHRM uses Google Sign-In only. Click below to register or sign in with your Hope, Inc. Google account.
          </p>
        </div>

        <button
          onClick={signInWithPopup}
          className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-4"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
            <path d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.3a3.68 3.68 0 0 1-1.6 2.42v2h2.58c1.51-1.39 2.4-3.44 2.4-5.88z" fill="#4285F4"/>
            <path d="M8 16c2.16 0 3.97-.71 5.3-1.94l-2.58-2a4.8 4.8 0 0 1-7.14-2.52H.98v2.07A8 8 0 0 0 8 16z" fill="#34A853"/>
            <path d="M3.58 9.54A4.8 4.8 0 0 1 3.33 8c0-.54.09-1.06.25-1.54V4.39H.98A8 8 0 0 0 0 8c0 1.29.31 2.51.98 3.61l2.6-2.07z" fill="#FBBC05"/>
            <path d="M8 3.18c1.22 0 2.31.42 3.17 1.24l2.37-2.37A8 8 0 0 0 .98 4.39l2.6 2.07C4.22 4.72 5.9 3.18 8 3.18z" fill="#EA4335"/>
          </svg>
          Register with Google
        </button>

        <p className="text-xs text-gray-400">
          Already have an account?{' '}
          <span
            onClick={() => navigate('/login')}
            className="text-emerald-600 cursor-pointer hover:underline"
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  )
}