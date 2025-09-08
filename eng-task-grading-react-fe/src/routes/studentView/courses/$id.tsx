import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { studentViewService } from '../../../services/student-view-service'
import type { CourseDto } from '../../../model/course-dto'
import toast from 'react-hot-toast'

export const Route = createFileRoute('/studentView/courses/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const [course, setCourse] = useState<CourseDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadCourse = async () => {
    try {
      setIsLoading(true)
      const courseData = await studentViewService.getCourse(parseInt(id))
      setCourse(courseData)
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

  if (!course) {
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {course.name || course.code}
                </h1>
                <div className="flex items-center mt-2 space-x-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {course.code}
                  </span>
                  {course.tasksCount > 0 && (
                    <div className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {course.tasksCount} úkolů
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Zpět
              </button>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-8">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Detail kurzu</h2>
              <p className="text-gray-600 mb-6">
                Zde bude zobrazen obsah kurzu, úkoly a další informace.
              </p>
              
              {course.tasksCount === 0 ? (
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-500">V tomto kurzu zatím nejsou žádné úkoly.</p>
                </div>
              ) : (
                <div className="bg-blue-50 rounded-lg p-6">
                  <p className="text-blue-700">
                    Tento kurz obsahuje <strong>{course.tasksCount}</strong> úkolů.
                  </p>
                  <p className="text-blue-600 text-sm mt-2">
                    Funkčnost pro zobrazení úkolů bude implementována později.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
