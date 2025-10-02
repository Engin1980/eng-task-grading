import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';
import { AttendanceRecordsTab, SelfSignTab } from '../../components/attendanceDays';

export const Route = createFileRoute('/attendanceDays/$id')({
  component: AttendanceDayDetailPage,
})

function AttendanceDayDetailPage() {
  const { id } = Route.useParams()
  const [activeTab, setActiveTab] = useState('records');

  const tabs = [
    { key: 'records', label: 'Záznamy docházky' },
    { key: 'self-sign', label: 'Pokročilé možnosti' }
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Detail dne docházky</h1>
        <p className="text-gray-600">ID dne: {id}</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'records' && <AttendanceRecordsTab attendanceDayId={id} />}
        {activeTab === 'self-sign' && <SelfSignTab attendanceDayId={id} />}
      </div>
    </div>
  )
}
