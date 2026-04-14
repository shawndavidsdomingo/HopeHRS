import { useEffect, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Employees', path: '/employees' },
  { label: 'Job History', path: '/job-history' },
  { label: 'Departments', path: '/departments' },
  { label: 'Job Codes', path: '/job-codes' },
  { label: 'Reports', path: '/reports' },
  { label: 'Deleted Items', path: '/deleted-items' },
]

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single()

      setProfile(data)
    }
    fetchProfile()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-8 h-16 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="font-extrabold text-xl tracking-tight">
            Hope<span className="text-emerald-600">HRM</span>
          </Link>
          <div className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-emerald-50 text-emerald-700 font-medium'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
            {/* Admin link — only show for superadmin/admin */}
            {profile?.role !== 'staff' && (
              <Link
                to="/admin"
                className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                  location.pathname === '/admin'
                    ? 'bg-purple-50 text-purple-700 font-medium'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Admin
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {profile && (
            <div className="flex items-center gap-3">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold">
                  {profile.full_name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 leading-none">{profile.full_name}</p>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">{profile.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Page content */}
      <main className="max-w-6xl mx-auto px-8 py-8">
        {children}
      </main>

    </div>
  )
}