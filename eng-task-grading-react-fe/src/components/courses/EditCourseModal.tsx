import { useState } from 'react'
import type { CourseDto, CourseEditDto } from '../../model/course-dto'
import { AppDialog } from '../../ui/AppDialog'
import { CourseEditor, type CourseEditorData } from '../../ui/editors/CourseEditor'
import { toast } from 'react-hot-toast'
import { isCourseCodeValid } from '../../types/validations'
import { useTranslation } from 'react-i18next'

interface EditCourseModalProps {
  isOpen: boolean
  course: CourseDto
  onClose: () => void
  onSubmit: (course: CourseEditDto) => void
}


export function EditCourseModal(props: EditCourseModalProps) {
  const { t } = useTranslation('courses');
  const [courseEditorData, setCourseEditorData] = useState<CourseEditorData>({
    code: props.course.code ?? '',
    name: props.course.name ?? '',
    isActive: props.course.isActive
  });

  const handleEditCourse = async () => {
    const courseData: CourseEditDto = {
      code: courseEditorData.code,
      name: courseEditorData.name,
      isActive: courseEditorData.isActive
    }

    try {
      props.onSubmit(courseData);
      toast.success(t('edit.success', { code: courseData.code }));
      // setCourseEditorData({ code: '', name: '', isActive: true });
      props.onClose();
    } catch (err) {
      toast.error(t('edit.error'));
    }
  }

  const handleClose = () => {
    // setCourseEditorData({ code: '', name: '', isActive: true });
    props.onClose();
  }

  return (
    <AppDialog
      isOpen={props.isOpen}
      title={t('edit.title')}
      confirmButtonText={t('edit.submit')}
      onSubmit={handleEditCourse}
      confirmButtonEnabled={() => isCourseCodeValid(courseEditorData.code)}
      onClose={handleClose}
    >
      <CourseEditor courseData={courseEditorData} onChange={setCourseEditorData} />
    </AppDialog>
  )
}
