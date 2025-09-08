import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { studentViewService } from '../../../services/student-view-service'
import toast from 'react-hot-toast'
import type { StudentViewCourseDto } from '../../../model/student-view-dto'
import { TasksTab, AttendanceTab } from '../../../components/studentView'

export const Route = createFileRoute('/studentView/courses/$id')({
  component: RouteComponent,
})

// Helper function to extract sub from JWT token
function getStudentNumberFromJWT(): string | null {
  try {
    const token = localStorage.getItem('studentViewAccessJWT');
    if (!token) return null;

    // Decode JWT payload (base64url decode)
    const payload = token.split('.')[1];
    if (!payload) return null;

    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload.sub || null;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

// Helper function to extract student ID from JWT token
function getStudentIdFromJWT(): string | null {
  try {
    const token = localStorage.getItem('studentViewAccessJWT');
    if (!token) return null;

    // Decode JWT payload (base64url decode)  
    const payload = token.split('.')[1];
    if (!payload) return null;

    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload.studentId || decodedPayload.id || null;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

function RouteComponent() {
  const { id } = Route.useParams()
  const [courseData, setCourseData] = useState<StudentViewCourseDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'tasks' | 'attendance'>('tasks')
  const studentNumber = getStudentNumberFromJWT()

  const loadCourse = async () => {
    try {
      setIsLoading(true)
      const courseData = await studentViewService.getCourse(parseInt(id))
      setCourseData(courseData)
    } catch (error) {
      console.error('Error loading course:', error)
      toast.error('Nepodařilo se načíst detail kurzu.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCourse()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítám detail kurzu...</p>
        </div>
      </div>
    )
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Kurz nenalezen</h3>
          <p className="text-gray-500">Požadovaný kurz neexistuje nebo k němu nemáte přístup.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {courseData.course.name || courseData.course.code}
                </h1>
                <div className="flex items-center mt-2 space-x-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {courseData.course.code}
                  </span>
                  {courseData.course.tasksCount > 0 && (
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {courseData.course.tasksCount} úkolů
                    </div>
                  )}
                </div>
              </div>
              {studentNumber && (
                <div className="text-right">
                  <p className="text-sm text-gray-500">Studijní číslo</p>
                  <p className="text-lg font-semibold text-gray-900">{studentNumber}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Course Content with Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tasks'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Úkoly
                </div>
              </button>
              <button
                onClick={() => setActiveTab('attendance')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'attendance'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Docházka
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'tasks' && (
              <TasksTab 
                tasks={courseData.tasks} 
                grades={courseData.grades} 
              />
            )}
            {activeTab === 'attendance' && (
              <AttendanceTab 
                attendances={courseData.attendances} 
                attendanceRecords={courseData.attendanceRecords}
                studentId={parseInt(getStudentIdFromJWT() || '0')}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
