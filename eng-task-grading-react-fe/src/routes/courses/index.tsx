import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { courseService } from '../../services/course-service'
import { useLogger } from '../../hooks/use-logger'
import { CreateCourseModal } from '../../components/courses'
import type { CourseDto } from '../../model/course-dto'
import { Loading } from '../../ui/loading'
import { LoadingError } from '../../ui/loadingError'
import { useLoadingState } from '../../types/loadingState'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/courses/')({
  component: CoursesPage,
})

function CoursesPage() {
  const { t } = useTranslation('courses')
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
        <h1 className="text-3xl font-bold">{t('list.title')}</h1>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
        >
          {t('list.add')}
        </button>
      </div>

      <CreateCourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCourseCreated={handleCourseCreated}
      />

      {ldgState.loading && (<Loading message={t('list.loading')} />)}

      {ldgState.error && (<LoadingError message={ldgState.error} onRetry={_loadCourses} />)}

      {ldgState.done && courses.length === 0 && (
        <div className="text-center text-gray-600">
          {t('list.empty')}
        </div>
      )}

      {ldgState.done && courses.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`border rounded-lg p-4 shadow hover:shadow-lg transition-shadow ${!course.isActive ? 'text-gray-500 border-dotted' : ''}`}
            >
              <h2 className="text-xl font-semibold mb-2">
                {course.name || course.code}
              </h2>
              <p className="text-sm text-gray-500 mb-2">{t('list.code', { code: course.code })}</p>
              <div className="text-gray-600 mb-4">
                <p>{t('stats.students', { n: course.studentsCount })}</p>
                <p>{t('stats.tasks', { n: course.tasksCount })}</p>
                <p>{t('stats.attendances', { n: course.attendancesCount })}</p>
              </div>
              <Link
                to="/courses/$id/grades"
                params={{ id: course.id.toString() }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 inline-block"
              >
                {t('list.view')}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}