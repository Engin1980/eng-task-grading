import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { AttendanceDays, StudentOverview } from '../../components/attendances'

export const Route = createFileRoute('/attendances/$id')({
  component: AttendanceDetailPage,
})

type TabType = 'attendanceDays' | 'studentOverview'

function AttendanceDetailPage() {
  const { id } = Route.useParams() // attendanceId
  const [activeTab, setActiveTab] = useState<TabType>('attendanceDays')

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Detail docházky</h1>
        <p className="text-gray-600">ID docházky: {id}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('attendanceDays')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'attendanceDays'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Zaznamenané dny
          </button>
          <button
            onClick={() => setActiveTab('studentOverview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'studentOverview'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Celkový přehled
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'attendanceDays' && <AttendanceDays attendanceId={id} />}
        {activeTab === 'studentOverview' && <StudentOverview attendanceId={id} />}
      </div>
    </div>
  )
}
