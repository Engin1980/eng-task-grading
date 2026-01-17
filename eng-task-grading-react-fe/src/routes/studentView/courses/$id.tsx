import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { studentViewService } from '../../../services/student-view-service'
import type { StudentViewCourseDto } from '../../../model/student-view-dto'
import { StudentViewDataContext } from '../../../contexts/StudentViewDataContext'
import { StudentInfo } from '../../../components/studentView'
import { TaskIcon } from '../../../ui/icons/taskIcon'
import { AttendanceIcon } from '../../../ui/icons/attendanceIcon'
import { TabLabelLink } from '../../../ui/tabLabelLink'
import { TabLabelBlock } from '../../../ui/tabLabelBlock'
import { Loading } from '../../../ui/loading'
import { LoadingError } from '../../../ui/loadingError'
import { useLoadingState } from '../../../types/loadingState'
import { useToast } from '../../../hooks/use-toast'

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

function RouteComponent() {
  const { id } = Route.useParams()
  const [courseData, setCourseData] = useState<StudentViewCourseDto | null>(null)
  const ldgState = useLoadingState();
  const studentNumber = getStudentNumberFromJWT()
  const tst = useToast();

  const loadCourse = async () => {
    try {
      ldgState.setLoading()
      const courseData = await studentViewService.getCourse(parseInt(id))
      setCourseData(courseData)
      ldgState.setDone();
    } catch (error) {
      console.error('Error loading course:', error)
      tst.error(error);
      ldgState.setError(error);
    }
  }

  useEffect(() => {
    loadCourse()
  }, [id])

  if (ldgState.loading) { return (<Loading message="Načítám kurz..." />) }
  if (ldgState.error) { return (<LoadingError message={ldgState.error} onRetry={loadCourse} />) }

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
                      {/* <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg> */}
                      <TaskIcon />
                      {courseData.course.tasksCount} úkolů
                    </div>
                  )}
                  {courseData.course.attendancesCount > 0 && (
                    <div className="flex items-center text-sm text-gray-500">
                      {/* <svg className="w-4 h-4 text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg> */}
                      <AttendanceIcon />
                      {courseData.course.attendancesCount} docházek
                    </div>
                  )}
                </div>
              </div>
              <StudentInfo studentNumber={studentNumber} />
            </div>
          </div>
        </div>

        {/* Tabs - nová navigace přes Link */}
        <TabLabelBlock selectedTabKey="a">
          <TabLabelLink to={`/studentView/courses/${id}/tasks`} tabKey="a">
            <TaskIcon />
            Úkoly
          </TabLabelLink>
          <TabLabelLink to={`/studentView/courses/${id}/attendance`} tabKey="b">
            <AttendanceIcon />
            Docházka
          </TabLabelLink>
        </TabLabelBlock>

        {/* Tab Content - nyní se renderuje podle child route */}
        <div className="min-h-96">
          <StudentViewDataContext.Provider value={courseData}>
            <Outlet />
          </StudentViewDataContext.Provider>
        </div>
      </div >
    </div >
  )
}
