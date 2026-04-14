import Layout from '../components/Layout'

export default function JobHistory() {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Job History</h1>
        <p className="text-sm text-gray-400 mt-1">Track every role change, promotion, and transfer.</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <p className="text-sm font-medium text-gray-400">Job history table coming in Sprint 2</p>
        <p className="text-xs text-gray-300 mt-1">Will display data from the jobhistory table</p>
      </div>
    </Layout>
  )
}