import { useState } from 'react';
import type { StudentDto } from '../../model/student-dto';
import type { GradeCreateDto, GradeDto } from '../../model/grade-dto';
import { gradeService } from '../../services/grade-service';

interface AddGradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentDto | null;
  taskId: string;
  onGradeAdded: (grade: GradeDto) => void;
}

export function AddGradeModal({ isOpen, onClose, student, taskId, onGradeAdded }: AddGradeModalProps) {
  const [value, setValue] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  console.log('AddGradeModal render:', { isOpen, student: student?.name, taskId });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!student || !value.trim()) return;

    const gradeValue = parseInt(value);
    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 100) {
      alert('Známka musí být číslo mezi 0 a 100');
      return;
    }

    setIsSubmitting(true);

    try {
      const newGrade: GradeCreateDto = {
        taskId: parseInt(taskId),
        studentId: student.id,
        value: gradeValue,
        comment: comment.trim() || null
      };

      const grade = await gradeService.createGrade(newGrade);
      onGradeAdded(grade);
      handleClose();
    } catch (error) {
      console.error('Error adding grade:', error);
      alert('Chyba při přidávání známky');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setValue('');
    setComment('');
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-white/20 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal panel */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full max-h-screen overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Přidat známku
            </h3>

            {/* Student info */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Student:</div>
              <div className="font-medium text-gray-900">
                {student.name && student.surname
                  ? `${student.surname} ${student.name}`
                  : student.userName || '-'}
              </div>
              <div className="text-sm text-gray-600">{student.number}</div>
            </div>

            {/* Grade value */}
            <div className="mb-4">
              <label htmlFor="grade-value" className="block text-sm font-medium text-gray-700 mb-2">
                Známka (0-100) <span className="text-red-500">*</span>
              </label>
              <input
                id="grade-value"
                type="number"
                min="0"
                max="100"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Zadejte známku..."
                required
                autoFocus
              />
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label htmlFor="grade-comment" className="block text-sm font-medium text-gray-700 mb-2">
                Komentář
              </label>
              <textarea
                id="grade-comment"
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Volitelný komentář k známce..."
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="bg-gray-50 px-6 py-3 flex flex-row-reverse gap-3">
            <button
              type="submit"
              disabled={isSubmitting || !value.trim()}
              className="inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Přidávám...' : 'Přidat známku'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Zrušit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
