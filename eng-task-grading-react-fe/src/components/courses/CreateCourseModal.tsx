import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { logService } from '../../services/log-service'
import type { CourseCreateDto } from '../../model/course-dto'
import { courseService } from '../../services/course-service'

interface CreateCourseModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onCourseCreated?: () => void
}

interface CourseFormData {
  code: string
  name: string
}

export function CreateCourseModal({ isOpen, onOpenChange, onCourseCreated }: CreateCourseModalProps) {
  const [newCourse, setNewCourse] = useState<CourseFormData>({ code: '', name: '' })

  const handleCreateCourse = async () => {
    try {
      logService.info('CreateCourseModal: Vytváří se nový kurz', newCourse)
      
      // Připravit data ve formátu CourseCreateDto
      const courseData: CourseCreateDto = {
        code: newCourse.code,
        name: newCourse.name || undefined // prázdný string → undefined
      }

      const course = await courseService.createCourse(courseData);
      logService.info('CreateCourseModal: Kurz byl úspěšně vytvořen', { response: course })
      
      // Resetovat formulář a zavřít modal
      setNewCourse({ code: '', name: '' })
      onOpenChange(false)
      
      // Zavolat callback pro obnovení dat
      onCourseCreated?.()
    } catch (err) {
      logService.error('CreateCourseModal: Chyba při vytváření kurzu', { error: err })
    }
  }

  const handleClose = () => {
    setNewCourse({ code: '', name: '' })
    onOpenChange(false)
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
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
              <button 
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
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
              onClick={handleClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              aria-label="Zavřít"
            >
              ✕
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
