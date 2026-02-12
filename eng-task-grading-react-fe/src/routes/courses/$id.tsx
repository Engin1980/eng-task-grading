import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useLogger } from '../../hooks/use-logger'
import { courseService } from '../../services/course-service'
import type { CourseDto, CourseEditDto } from '../../model/course-dto'
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
import { EditIcon } from '../../ui/icons/editIcon'
import { DeleteIcon } from '../../ui/icons/deleteIcon'
import { DeleteModal } from '../../components/global/DeleteModal'
import { EditCourseModal } from '../../components/courses/EditCourseModal'
import { useToast } from '../../hooks/use-toast'

export const Route = createFileRoute('/courses/$id')({
  component: CourseDetailPage,
})

function CourseDetailPage() {
  const { id } = Route.useParams()
  const logger = useLogger("CourseDetailPage")
  const [course, setCourse] = useState<CourseDto>(null!)
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const ldgState = useLoadingState();
  const navigate = useNavigate();
  const navCtx = useNavigationContext();
  const tst = useToast();

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

  const handleCourseDelete = async () => {
    tst.error("Funkce mazání kurzů ještě není implementována");
  }

  const handleCourseEdit = async (courseData: CourseEditDto) => {
    await courseService.update(id, courseData);
    setCourse({ ...course, ...courseData });
  }

  useEffect(() => {
    loadCourse();
  }, [id, navigate])

  if (ldgState.loading) { return (<Loading message="Načítám kurz..." />) }
  if (ldgState.error) { return (<LoadingError message={ldgState.error} onRetry={loadCourse} />) }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <h1 className={`text-3xl font-bold text-gray-${course.isActive ? '900' : '500'} mb-2`}>
            {course?.name || course?.code || `Kurz ${id}`}
            {!course.isActive && <span className='ml-4'>
              &lt;inactive&gt;
            </span>}
          </h1>
          <button
            className="pl-3"
            onClick={() => setEditModalVisible(true)}
          >
            <EditIcon size="m" />
          </button>
          <EditCourseModal
            isOpen={editModalVisible}
            course={course}
            onSubmit={handleCourseEdit}
            onClose={() => setEditModalVisible(false)}
          />

          <button
            className="pl-m"
            onClick={() => setDeleteModalVisible(true)}
          >
            <DeleteIcon />
          </button>
          <DeleteModal
            title="Opravdu smazat kurz?"
            question="Bude nevratně smazán kurz i všechna případná související hodnocení a docházky!"
            verification={course?.name || course?.code || ''}
            isOpen={deleteModalVisible}
            onDelete={handleCourseDelete}
            onClose={() => setDeleteModalVisible(false)}
          />
        </div>
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