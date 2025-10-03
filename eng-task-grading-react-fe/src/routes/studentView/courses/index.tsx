import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { studentViewService } from '../../../services/student-view-service'
import type { CourseDto } from '../../../model/course-dto';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast'
import { StudentInfo } from '../../../components/studentView'
import { Loading } from '../../../ui/loading';
import { LoadingError } from '../../../ui/loadingError';

export const Route = createFileRoute('/studentView/courses/')({
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
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const studentNumber = getStudentNumberFromJWT();

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      const courses = await studentViewService.getCourses();
      setCourses(courses);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Nepodařilo se načíst kurzy. Zkuste to prosím znovu.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCourses();
  }, []);

  if (isLoading) { return (<Loading message="Načítám kurzy..." />); }
  if (error) { return (<LoadingError message={error} onRetry={loadCourses} />); }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Moje kurzy</h1>
                <p className="text-gray-600 mt-1">Přehled kurzů, do kterých jste zapsáni</p>
              </div>
              <StudentInfo studentNumber={studentNumber} />
            </div>
          </div>

          {courses.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Žádné kurzy</h3>
              <p className="text-gray-500">Nejste zapsáni do žádných kurzů.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Název kurzu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kód
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Počet úkolů
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courses.map((course) => (
                    <tr key={course.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          className="text-left w-full"
                          onClick={() => {
                            navigate({ to: `/studentView/courses/${course.id}` });
                          }}
                        >
                          <div className="text-sm font-medium text-blue-600 hover:text-blue-900 transition-colors">
                            {course.name || course.code}
                          </div>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {course.code}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          {course.tasksCount}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
