import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useLogger } from '../../hooks/use-logger'
import { GradesTab, StudentsTab, TasksTab } from '../../components/courses'
import { AttendanceTab } from '../../components/courses'

export const Route = createFileRoute('/courses/$id')({
  component: CourseDetailPage,
})

type TabType = 'grades' | 'students' | 'tasks' | 'attendances'

function CourseDetailPage() {
  const { id } = Route.useParams()
  const [activeTab, setActiveTab] = useState<TabType>('grades')
  const logger = useLogger("CourseDetailPage")

  logger.debug(`Rendering course detail page for course ID: ${id}`)

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Detail kurzu</h1>
        <p className="text-gray-600">ID kurzu: {id}</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('grades')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'grades'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Známky
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'tasks'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Úkoly
          </button>
          <button
            onClick={() => setActiveTab('attendances')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'attendances'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Účast
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'students'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Studenti
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'grades' && <GradesTab courseId={id} />}
        {activeTab === 'students' && <StudentsTab courseId={id} />}
        {activeTab === 'tasks' && <TasksTab courseId={id} />}
        {activeTab === 'attendances' && <AttendanceTab courseId={id} />}
      </div>
    </div>
  )
}