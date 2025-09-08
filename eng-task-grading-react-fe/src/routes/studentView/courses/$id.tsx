import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { studentViewService } from '../../../services/student-view-service'
import type { CourseDto } from '../../../model/course-dto'
import toast from 'react-hot-toast'
import type { StudentViewCourseDto } from '../../../model/student-view-dto'

export const Route = createFileRoute('/studentView/courses/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const { id } = Route.useParams()
  const [courseData, setCourseData] = useState<StudentViewCourseDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
    <div></div>
  )
}
