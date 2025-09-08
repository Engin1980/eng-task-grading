import type { AttendanceDto } from '../../model/attendance-dto';
import type { AttendanceDaySetRecordDto } from '../../model/attendance-dto';

interface AttendanceTabProps {
  attendances: AttendanceDto[];
  attendanceRecords: AttendanceDaySetRecordDto[];
}

interface AttendanceDay {
  title: string;
  recordTitle: string;
  weight?: number;
}

interface AttendanceSet {
  id: number;
  title: string;
  days: AttendanceDay[];
}

export function AttendanceTab({ attendances, attendanceRecords }: AttendanceTabProps) {
  // Transform attendance data to match component structure
  const attendanceSets: AttendanceSet[] = attendances.map(attendance => {
    const days: AttendanceDay[] = attendance.days.map(day => {
      const record = attendanceRecords.find(r => r.attendanceDayId === day.id);
      return {
        title: day.title,
        recordTitle: record ? record.attendanceValueTitle : "Žádný záznam",
        weight: record?.attendanceValueWeight
      };
    });

    return {
      id: attendance.id,
      title: attendance.title,
      days
    };
  });



  if (attendanceSets.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="text-gray-400 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Žádná docházka</h3>
        <p className="text-gray-500">Pro tento kurz nejsou evidovány žádné docházky.</p>
      </div>
    );
  }

  return (
    <div className="bg-white space-y-6">
      {attendanceSets.map((attendanceSet) => (
        <div key={attendanceSet.id} className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Header each attendance set */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">{attendanceSet.title}</h3>
          </div>
          
          {/* Table for each attendance set */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Den/Událost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stav účasti
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceSet.days.map((day, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {day.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        day.weight === 1
                          ? 'bg-green-100 text-green-800' 
                          : day.weight === 0.5
                          ? 'bg-yellow-100 text-yellow-800'
                          : day.weight === 0
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {day.recordTitle}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
