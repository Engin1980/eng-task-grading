import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { courseService } from '../../services/course-service'
import { useLogger } from '../../hooks/use-logger'
import type { CourseOverviewDto } from '../../model/course-overview-dto'

export const Route = createFileRoute('/courses/')({
  component: CoursesPage,
})

function CoursesPage() {
  const [courses, setCourses] = useState<CourseOverviewDto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newCourse, setNewCourse] = useState({ code: '', name: '' })
  const logger = useLogger()

  useEffect(() => {
    const loadCourses = async () => {
      logger.info("Načítám kurzíky");
      try {
        logger.info('CoursesPage: Načítám kurzy')
        setLoading(true)
        const coursesData = await courseService.getAllCourses()
        setCourses(coursesData)
        logger.info(`CoursesPage: Úspěšně načteno ${coursesData.length} kurzů`)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Neznámá chyba'
        setError(errorMessage)
        logger.error('CoursesPage: Chyba při načítání kurzů', { error: err })
      } finally {
        setLoading(false)
      }
    }

    logger.info("CoursesPage: useEffect volán, načítám kurzy");
    loadCourses()
  }, [])

  const handleCreateCourse = async () => {
    try {
      logger.info('Vytváří se nový kurz', newCourse)
      // TODO: Implementovat API volání pro vytvoření kurzu
      console.log('Vytváří se kurz:', newCourse)
      
      // Resetovat formulář a zavřít modal
      setNewCourse({ code: '', name: '' })
      setIsModalOpen(false)
      
      // Znovu načíst kurzy
      // loadCourses() - můžeme volat později
    } catch (err) {
      logger.error('Chyba při vytváření kurzu', { error: err })
    }
  }

  return (
  <div className="container mx-auto p-4">
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Všechny kurzy</h1>
      
      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Trigger asChild>
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors">
            + Přidat kurz
          </button>
        </Dialog.Trigger>
        
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-white/20 backdrop-blur-sm" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-96 max-w-[90vw] shadow-xl">
            <Dialog.Title className="text-xl font-semibold mb-4">
              Přidat nový kurz
            </Dialog.Title>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="courseCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Zkratka kurzu *
                </label>
                <input
                  id="courseCode"
                  type="text"
                  value={newCourse.code}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, code: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="např. JS101"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-1">
                  Název kurzu
                </label>
                <input
                  id="courseName"
                  type="text"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="např. JavaScript pro začátečníky"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <Dialog.Close asChild>
                <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
                  Zrušit
                </button>
              </Dialog.Close>
              
              <button
                onClick={handleCreateCourse}
                disabled={!newCourse.code.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Vytvořit kurz
              </button>
            </div>
            
            <Dialog.Close asChild>
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                aria-label="Zavřít"
              >
                ✕
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>

    {loading && (
      <div className="text-center">Načítám kurzy...</div>
    )}

    {error && (
      <div className="text-red-600 text-center">
        Chyba při načítání kurzů: {error}
      </div>
    )}

    {!loading && !error && courses.length === 0 && (
      <div className="text-center text-gray-600">
        Žádné kurzy nebyly nalezeny.
      </div>
    )}

    {!loading && !error && courses.length > 0 && (
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
              <p>Studenti: {course.studentCount}</p>
              <p>Úkoly: {course.taskCount}</p>
            </div>
            <Link
              to="/courses/$id"     // 💡 tady musí být stejný název jako v souboru ($courseId.tsx)
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