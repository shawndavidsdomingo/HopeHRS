import Layout from '../components/Layout'

export default function Admin() {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Admin</h1>
        <p className="text-sm text-gray-400 mt-1">Manage user accounts and assign roles.</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <p className="text-sm font-medium text-gray-400">User management coming in Sprint 2</p>
        <p className="text-xs text-gray-300 mt-1">Will show all users from the profiles table with role controls</p>
      </div>
    </Layout>
  )
}