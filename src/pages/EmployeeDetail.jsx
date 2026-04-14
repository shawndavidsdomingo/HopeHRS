import { useParams } from 'react-router-dom'
import Layout from '../components/Layout'

export default function EmployeeDetail() {
  const { empno } = useParams()

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Employee Detail</h1>
        <p className="text-sm text-gray-400 mt-1">Employee No: {empno}</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <p className="text-sm font-medium text-gray-400">Employee detail view coming in Sprint 2</p>
        <p className="text-xs text-gray-300 mt-1">Will show employee info and full job history</p>
      </div>
    </Layout>
  )
}