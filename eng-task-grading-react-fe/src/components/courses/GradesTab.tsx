import { useLogger } from '../../hooks/use-logger';

interface Grade {
  id: string;
  studentName: string;
  task: string;
  points: number;
  maxPoints: number;
  percentage: number;
  date: string;
}

interface GradesTabProps {
  courseId: string;
}

export function GradesTab({ courseId }: GradesTabProps) {
  const logger = useLogger("GradesTab");

  // Mock data pro známky
  const grades: Grade[] = [
    {
      id: '1',
      studentName: 'Jan Novák',
      task: 'Domácí úkol 1',
      points: 8,
      maxPoints: 10,
      percentage: 80,
      date: '2025-08-15'
    },
    {
      id: '2',
      studentName: 'Marie Svobodová',
      task: 'Domácí úkol 1',
      points: 9,
      maxPoints: 10,
      percentage: 90,
      date: '2025-08-15'
    },
    {
      id: '3',
      studentName: 'Jan Novák',
      task: 'Test 1',
      points: 15,
      maxPoints: 20,
      percentage: 75,
      date: '2025-08-20'
    },
    {
      id: '4',
      studentName: 'Petr Dvořák',
      task: 'Domácí úkol 1',
      points: 7,
      maxPoints: 10,
      percentage: 70,
      date: '2025-08-15'
    },
    {
      id: '5',
      studentName: 'Marie Svobodová',
      task: 'Test 1',
      points: 18,
      maxPoints: 20,
      percentage: 90,
      date: '2025-08-20'
    }
  ];

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 80) return 'bg-blue-100 text-blue-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    if (percentage >= 60) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  logger.debug(`Rendering grades tab for course ${courseId} with ${grades.length} grades`);

  if (grades.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Zatím nejsou zadané žádné známky.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Student
            </th>
            <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Úkol
            </th>
            <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Body
            </th>
            <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Procenta
            </th>
            <th className="px-6 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Datum
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {grades.map((grade) => (
            <tr key={grade.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {grade.studentName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {grade.task}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {grade.points}/{grade.maxPoints}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPercentageColor(grade.percentage)}`}>
                  {grade.percentage}%
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(grade.date).toLocaleDateString('cs-CZ')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
