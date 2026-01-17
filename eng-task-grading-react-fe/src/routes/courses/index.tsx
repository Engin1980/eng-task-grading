import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { courseService } from '../../services/course-service'
import { useLogger } from '../../hooks/use-logger'
import { CreateCourseModal } from '../../components/courses'
import type { CourseDto } from '../../model/course-dto'
import { Loading } from '../../ui/loading'
import { LoadingError } from '../../ui/loadingError'
import { useLoadingState } from '../../types/loadingState'

export const Route = createFileRoute('/courses/')({
  component: CoursesPage,
})

function CoursesPage() {
  const [courses, setCourses] = useState<CourseDto[]>([])
  const ldgState = useLoadingState();
  const [isModalOpen, setIsModalOpen] = useState(false)
  const logger = useLogger("CoursesPage")

  const _loadCourses = async () => {
    try {
      logger.info('Načítám kurzy')
      ldgState.setLoading();
      const coursesData = await courseService.getAllCourses()
      setCourses(coursesData)
      logger.info(`Úspěšně načteno ${coursesData.length} kurzů`)
      ldgState.setDone();
    } catch (err) {
      ldgState.setError(err);
      logger.error('Chyba při načítání kurzů', { error: err })
    }
  };

  useEffect(() => {
    _loadCourses()
  }, [])

  const handleCourseCreated = async () => {
    setIsModalOpen(false);
    await _loadCourses();
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Všechny kurzy</h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          + Přidat kurz
        </button>
      </div>

      <CreateCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCourseCreated={handleCourseCreated}
      />

      {ldgState.loading && (<Loading message="Načítám kurzy..." />)}

      {ldgState.error && (<LoadingError message={ldgState.error} onRetry={_loadCourses} />)}

      {ldgState.done && courses.length === 0 && (
        <div className="text-center text-gray-600">
          Žádné kurzy nebyly nalezeny.
        </div>
      )}

      {ldgState.done && courses.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="border rounded-lg p-4 shadow hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">
                {course.name || course.code}
              </h2>
              <p className="text-sm text-gray-500 mb-2">Kód: {course.code}</p>
              <div className="text-gray-600 mb-4">
                <p>Studenti: {course.studentsCount}</p>
                <p>Úkoly: {course.tasksCount}</p>
                <p>Účasti: {course.attendancesCount}</p>
              </div>
              <Link
                to="/courses/$id/grades"
                params={{ id: course.id.toString() }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 inline-block"
              >
                Zobrazit kurz
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}