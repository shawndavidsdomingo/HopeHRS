import Layout from '../components/Layout'

export default function DeletedItems() {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Deleted Items</h1>
        <p className="text-sm text-gray-400 mt-1">View and recover deactivated records — nothing is permanently deleted.</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <p className="text-sm font-medium text-gray-400">Deleted items view coming in Sprint 2</p>
        <p className="text-xs text-gray-300 mt-1">Will show all records where is_active = false</p>
      </div>
    </Layout>
  )
}