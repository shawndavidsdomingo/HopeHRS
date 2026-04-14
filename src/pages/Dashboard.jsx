import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        if (!session) {
          navigate('/login', { replace: true })
          return
        }
        setSession(session)

        // Get profile from profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileError) {
          // Profile doesn't exist yet — create it
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || session.user.email,
              avatar_url: session.user.user_metadata?.avatar_url || null,
              role: 'staff',
            })
            .select()
            .single()

          if (insertError) throw insertError
          setProfile(newProfile)
        } else {
          setProfile(profileData)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [navigate])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/', { replace: true })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-red-500 mb-2">Error: {error}</p>
          <button
            onClick={() => navigate('/')}
            className="text-sm text-emerald-600 hover:underline"
          >
            Back to login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-8 h-16 flex items-center justify-between">
        <div className="font-extrabold text-xl tracking-tight">
          Hope<span className="text-emerald-600">HRM</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="avatar"
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold">
                {profile?.full_name?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-900 leading-none">{profile?.full_name}</p>
              <p className="text-xs text-gray-400 mt-0.5 capitalize">{profile?.role}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-10">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Welcome back, {profile?.full_name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-gray-400 mt-1">Here's your account information from the database.</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Your profile — profiles table
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Full name</p>
              <p className="text-sm font-medium text-gray-900">{profile?.full_name || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Email</p>
              <p className="text-sm font-medium text-gray-900">{profile?.email || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Role</p>
              <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full capitalize
                ${profile?.role === 'superadmin' ? 'bg-purple-50 text-purple-700' :
                  profile?.role === 'admin' ? 'bg-blue-50 text-blue-700' :
                  'bg-gray-100 text-gray-600'}`}>
                {profile?.role}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Status</p>
              <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full
                ${profile?.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                {profile?.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">User ID</p>
              <p className="text-xs font-mono text-gray-500 break-all">{profile?.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Registered</p>
              <p className="text-sm text-gray-700">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString('en-PH', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })
                  : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Session Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Session info — auth.users
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Provider</p>
              <p className="text-sm font-medium text-gray-900 capitalize">
                {session?.user?.app_metadata?.provider || 'google'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Last sign in</p>
              <p className="text-sm text-gray-700">
                {session?.user?.last_sign_in_at
                  ? new Date(session.user.last_sign_in_at).toLocaleString('en-PH')
                  : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Coming soon modules */}
        <div className="mt-8 grid grid-cols-4 gap-4">
          {['Employees', 'Job History', 'Departments', 'Job Codes'].map((mod) => (
            <div
              key={mod}
              className="bg-white border border-gray-100 rounded-xl p-4 text-center opacity-50 cursor-not-allowed"
            >
              <p className="text-sm font-medium text-gray-700">{mod}</p>
              <p className="text-xs text-gray-400 mt-1">Coming Sprint 2</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}