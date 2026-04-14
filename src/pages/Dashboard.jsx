import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Layout from '../components/Layout'

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
  <Layout>
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
    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
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

    {/* Module links */}
    <div className="grid grid-cols-4 gap-4">
      {[
        { label: 'Employees', path: '/employees' },
        { label: 'Job History', path: '/job-history' },
        { label: 'Departments', path: '/departments' },
        { label: 'Job Codes', path: '/job-codes' },
      ].map((mod) => (
        <a
          key={mod.path}
          href={mod.path}
          className="bg-white border border-gray-100 rounded-xl p-4 text-center hover:border-emerald-200 hover:bg-emerald-50 transition-colors"
        >
          <p className="text-sm font-medium text-gray-700">{mod.label}</p>
          <p className="text-xs text-gray-400 mt-1">View module →</p>
        </a>
      ))}
    </div>
  </Layout>
)
}