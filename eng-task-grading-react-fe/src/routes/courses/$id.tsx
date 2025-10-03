import { createFileRoute, Link, Outlet, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useLogger } from '../../hooks/use-logger'
import { courseService } from '../../services/course-service'
import type { CourseDto } from '../../model/course-dto'
import { TabLabelBlock } from '../../ui/tabLabelBlock'
import { TabLabelLink } from '../../ui/tabLabelLink'
import { TaskIcon } from '../../ui/icons/taskIcon'
import { AttendanceIcon } from '../../ui/icons/attendanceIcon'
import { GradeIcon } from '../../ui/icons/gradeIcon'
import { StudentIcon } from '../../ui/icons/studentIcon'
import { useNavigationContext } from '../../contexts/NavigationContext'
import { Loading } from '../../ui/loading'
import { LoadingError } from '../../ui/loadingError'
import { useLoadingState } from '../../types/loadingState'

export const Route = createFileRoute('/courses/$id')({
  component: CourseDetailPage,
})

function CourseDetailPage() {
  const { id } = Route.useParams()
  const logger = useLogger("CourseDetailPage")
  const [course, setCourse] = useState<CourseDto | null>(null)
  const ldgState = useLoadingState();
  const navigate = useNavigate();
  const navCtx = useNavigationContext();

  const loadCourse = async () => {
    try {
      ldgState.setLoading();
      logger.info(`Načítám kurz s ID: ${id}`);
      const courseData = await courseService.get(id);
      setCourse(courseData);
      navCtx.setCourse({ id: courseData.id, title: courseData.code });
      logger.info('Kurz byl úspěšně načten', { course: courseData });
      ldgState.setDone();
    } catch (err) {
      ldgState.setError(err);
      logger.error('Chyba při načítání kurzu', { error: err, courseId: id });
    }
  }

  useEffect(() => {
    loadCourse();
  }, [id, navigate])

  logger.debug(`Rendering course detail page for course ID: ${id}`)

  if (ldgState.loading) { return (<Loading message="Načítám kurz..." />) }
  if (ldgState.error) { return (<LoadingError message={ldgState.error} onRetry={loadCourse} />) }

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
      <TabLabelBlock selectedTabKey='grades'>
        <TabLabelLink to={`/courses/${id}/grades`} tabKey='grades'>
          <GradeIcon />
          Známky
        </TabLabelLink>
        <TabLabelLink to={`/courses/${id}/tasks`} tabKey='tasks'>
          <TaskIcon />
          Úkoly
        </TabLabelLink>
        <TabLabelLink to={`/courses/${id}/attendances`} tabKey='attendances'>
          <AttendanceIcon />
          Účast
        </TabLabelLink>
        <TabLabelLink to={`/courses/${id}/students`} tabKey='students'>
          <StudentIcon />
          Studenti
        </TabLabelLink>
      </TabLabelBlock>

      {/* Tab Content - nyní se renderuje podle child route */}
      <div className="min-h-96">
        <Outlet />
      </div>
    </div>
  )
}