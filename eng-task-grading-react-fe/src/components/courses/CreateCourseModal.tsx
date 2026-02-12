import { useState } from 'react'
import type { CourseCreateDto } from '../../model/course-dto'
import { AppDialog } from '../../ui/AppDialog'
import { CourseEditor, type CourseEditorData } from '../../ui/editors/CourseEditor'
import { isCourseCodeValid } from '../../types/validations'
import { courseService } from '../../services/course-service'
import { useToast } from '../../hooks/use-toast'

interface CreateCourseModalProps {
  isOpen: boolean
  onClose: () => void
  onCourseCreated: (courseData: CourseCreateDto) => void
}


export function CreateCourseModal(props: CreateCourseModalProps) {
  const [courseEditorData, setCourseEditorData] = useState<CourseEditorData>({ code: '', name: '', isActive: true })
  const tst = useToast();

  const handleCreateCourse = async () => {
    const courseData: CourseCreateDto = {
      code: courseEditorData.code,
      name: courseEditorData.name
    }

    try {
      await courseService.createCourse(courseData);
      tst.success(tst.SUC.ITEM_CREATED);
      setCourseEditorData({ code: '', name: '', isActive: true });
      props.onCourseCreated(courseData);
      props.onClose();
    } catch (err) {
      tst.error(err);
    }
  }

  const handleClose = () => {
    setCourseEditorData({ code: '', name: '', isActive: true });
    props.onClose();
  }

  return (
    <AppDialog
      isOpen={props.isOpen}
      title="Přidat nový kurz"
      confirmButtonText='Vytvořit kurz'
      onSubmit={handleCreateCourse}
      confirmButtonEnabled={() => isCourseCodeValid(courseEditorData.code)}
      onClose={handleClose}
    >
      <CourseEditor courseData={courseEditorData} onChange={setCourseEditorData} />
    </AppDialog>
  )
}
