import { useState } from 'react';
import type { StudentDto } from '../../model/student-dto';
import type { GradeCreateDto, GradeDto } from '../../model/grade-dto';
import { gradeService } from '../../services/grade-service';

interface AddGradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentDto | null;
  taskId: string;
  taskMinGrade: number | null;
  taskMaxGrade: number | null;
  onGradeAdded: (grade: GradeDto) => void;
}

export function AddGradeModal({ isOpen, onClose, student, taskId, taskMinGrade, taskMaxGrade, onGradeAdded }: AddGradeModalProps) {
  const [value, setValue] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const quickSelectPercentages: number[] = [0, 5, 25, 35, 45, 55, 60, 65, 70, 75, 80, 85, 90, 95, 98, 100];
  const quickSelectValues: number[] = Array.from(
    new Set(
      quickSelectPercentages.map(p =>
        Math.ceil((p / 100) * (taskMaxGrade ?? 100))
      )
    )
  );

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
              <div className="text-sm text-gray-600">Student</div>
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
                Známka (0-{taskMaxGrade ?? "?"}, min {taskMinGrade ?? "?"}) <span className="text-red-500">*</span>
              </label>
              <input
                id="grade-value"
                type="number"
                min="0"
                max={taskMaxGrade ?? 100}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Zadejte známku..."
                required
                autoFocus
              />

              {/* Quick select buttons */}
              <div className="mt-2 flex flex-wrap gap-2">
                {quickSelectValues.map((quickValue) => {
                  const isFail = taskMinGrade != null && quickValue < taskMinGrade;
                  const isSuccess = taskMinGrade != null && quickValue >= taskMinGrade;
                  return (
                    <button
                      key={quickValue}
                      type="button"
                      onClick={() => setValue(quickValue.toString())}
                      className={`px-2 py-1 text-xs font-medium rounded border transition-colors 
                        ${value === quickValue.toString()
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100'
                        } ${isFail ? 'text-red-800' : ''} 
                          ${isSuccess ? 'text-green-800' : ''
                        }`}
                    >
                      {quickValue}
                    </button>)
                })}
              </div>
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
