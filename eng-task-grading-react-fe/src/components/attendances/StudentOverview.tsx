interface StudentOverviewProps {
  attendanceId: string;
}

export function StudentOverview({ attendanceId }: StudentOverviewProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Celkový přehled</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <p className="text-gray-500">
            Obsah komponenty StudentOverview pro docházku ID: {attendanceId}
          </p>
        </div>
      </div>
    </div>
  );
}
