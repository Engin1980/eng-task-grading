import { useState } from 'react'
import type { CourseDto, CourseEditDto } from '../../model/course-dto'
import { AppDialog } from '../../ui/AppDialog'
import { CourseEditor, type CourseEditorData } from '../../ui/editors/CourseEditor'
import { toast } from 'react-hot-toast'
import { isCourseCodeValid } from '../../types/validations'

interface EditCourseModalProps {
  isOpen: boolean
  course: CourseDto
  onClose: () => void
  onSubmit: (course: CourseEditDto) => void
}


export function EditCourseModal(props: EditCourseModalProps) {
  const [courseEditorData, setCourseEditorData] = useState<CourseEditorData>({
    code: props.course.code ?? '',
    name: props.course.name ?? ''
  });

  const handleEditCourse = async () => {
    const courseData: CourseEditDto = {
      code: courseEditorData.code,
      name: courseEditorData.name
    }

    try {
      props.onSubmit(courseData);
      toast.success(`Kurz ${courseData.code} byl úspěšně upraven.`);
      setCourseEditorData({ code: '', name: '' });
      props.onClose();
    } catch (err) {
      toast.error(`Chyba při úpravě kurzu.`);
    }
  }

  const handleClose = () => {
    setCourseEditorData({ code: '', name: '' });
    props.onClose();
  }

  return (
    <AppDialog
      isOpen={props.isOpen}
      title="Upravit kurz"
      confirmButtonText='Upravit kurz'
      onSubmit={handleEditCourse}
      confirmButtonEnabled={() => isCourseCodeValid(courseEditorData.code)}
      onClose={handleClose}
    >
      <CourseEditor courseData={courseEditorData} onChange={setCourseEditorData} />
    </AppDialog>
  )
}
