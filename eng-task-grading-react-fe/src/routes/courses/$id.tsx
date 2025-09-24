import { createFileRoute, Link, Outlet } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useLogger } from '../../hooks/use-logger'
import { courseService } from '../../services/course-service'
import type { CourseDto } from '../../model/course-dto'

export const Route = createFileRoute('/courses/$id')({
  component: CourseDetailPage,
})

function CourseDetailPage() {
  const { id } = Route.useParams()
  // Navigace je nyní přes Link komponenty, není potřeba activeTab
  const logger = useLogger("CourseDetailPage")
  const [course, setCourse] = useState<CourseDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCourse = async () => {
    try {
      setLoading(true)
      setError(null)
      logger.info(`Načítám kurz s ID: ${id}`)
      const courseData = await courseService.get(id)
      setCourse(courseData)
      logger.info('Kurz byl úspěšně načten', { course: courseData })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Chyba při načítání kurzu'
      setError(errorMessage)
      logger.error('Chyba při načítání kurzu', { error: err, courseId: id })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourse()
  }, [id])

  logger.debug(`Rendering course detail page for course ID: ${id}`)

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Načítám kurz...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Chyba při načítání kurzu</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadCourse}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Zkusit znovu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {course?.name || course?.code || `Kurz ${id}`}
        </h1>
        {course?.name && course?.code && (
          <p className="text-gray-600">Kód kurzu: {course.code}</p>
        )}
        {course && (
          <div className="text-sm text-gray-500 mt-2">
            <span>Studenti: {course.studentsCount || 0}</span>
            <span className="mx-2">•</span>
            <span>Úkoly: {course.tasksCount || 0}</span>
            <span className="mx-2">•</span>
            <span>Účasti: {course.attendancesCount || 0}</span>
          </div>
        )}
      </div>

      {/* Tabs - nová navigace přes Link */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <Link
            to="/courses/$id/grades"
            params={{ id }}
            className="py-2 px-1 border-b-2 font-medium text-sm text-blue-600 hover:text-blue-800 hover:border-blue-500"
          >
            Známky
          </Link>
          <Link
            to="/courses/$id/tasks"
            params={{ id }}
            className="py-2 px-1 border-b-2 font-medium text-sm text-blue-600 hover:text-blue-800 hover:border-blue-500"
          >
            Úkoly
          </Link>
          <Link
            to="/courses/$id/attendances"
            params={{ id }}
            className="py-2 px-1 border-b-2 font-medium text-sm text-blue-600 hover:text-blue-800 hover:border-blue-500"
          >
            Účast
          </Link>
          <Link
            to="/courses/$id/students"
            params={{ id }}
            className="py-2 px-1 border-b-2 font-medium text-sm text-blue-600 hover:text-blue-800 hover:border-blue-500"
          >
            Studenti
          </Link>
        </nav>
      </div>
      {/* Tab Content - nyní se renderuje podle child route */}
      <div className="min-h-96">
        <Outlet />
      </div>
    </div>
  )
}