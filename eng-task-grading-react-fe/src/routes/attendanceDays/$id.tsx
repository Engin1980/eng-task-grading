import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react';
import { AttendanceRecordsTab, SelfSignTab } from '../../components/attendanceDays';
import { EditIcon } from '../../ui/icons/editIcon';
import { DeleteIcon } from '../../ui/icons/deleteIcon';
import { DeleteModal } from '../../components/global/DeleteModal';
import toast from 'react-hot-toast';
import type { AttendanceDayDto, AttendanceDayUpdateDto } from '../../model/attendance-dto';
import { attendanceService } from '../../services/attendance-service';
import { useNavigate } from '@tanstack/react-router';
import { useLoadingState } from '../../types/loadingState';
import { Loading } from '../../ui/loading';
import { LoadingError } from '../../ui/loadingError';
import { EditAttendanceDayModal } from '../../components/attendanceDays/EditAttendanceDayModal';

export const Route = createFileRoute('/attendanceDays/$id')({
  component: AttendanceDayDetailPage,
})

function AttendanceDayDetailPage() {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const { id: ids } = Route.useParams()
  const id: number = +ids;
  const [activeTab, setActiveTab] = useState('records');
  const [attendanceDay, setAttendanceDay] = useState<AttendanceDayDto>(null!);
  const navigate = useNavigate();
  const ldgState = useLoadingState();

  const loadData = async () => {
    try {
      const data = await attendanceService.getDay(id);
      setAttendanceDay(data);
      ldgState.setDone();
    } catch (err) {
      ldgState.setError(err);
    }
  }

  const tabs = [
    { key: 'records', label: 'Záznamy docházky' },
    { key: 'self-sign', label: 'Pokročilé možnosti' }
  ];

  const handleAttendanceDelete = () => {
    try {
      attendanceService.deleteDay(id);
      toast.success("Den docházky byl úspěšně smazán.");
      navigate({ to: `/attendances/${attendanceDay.attendanceId}/days` });
    } catch (err) {
      toast.error("Chyba při mazání dne docházky.");
      throw err;
    }
  }

  const handleAttendanceEdit = async (data: AttendanceDayUpdateDto) => {
    await attendanceService.updateDay(id, data);
    await loadData();
  }

  useEffect(() => { loadData(); }, [id]);

  if (ldgState.loading) { return (<Loading message='Načítám den docházky...' />) }
  if (ldgState.error) { return (<LoadingError message={`Chyba při načítání dne docházky: ${ldgState.error}`} />) }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{attendanceDay.title}</h1>
          <button
            className="pl-3"
            onClick={() => setEditModalVisible(true)}
          >
            <EditIcon size="m" />
          </button>
          <EditAttendanceDayModal
            isOpen={editModalVisible}
            attendanceDay={attendanceDay}
            onSubmit={handleAttendanceEdit}
            onClose={() => setEditModalVisible(false)}
          />

          <button
            className="pl-m"
            onClick={() => setDeleteModalVisible(true)}
          >
            <DeleteIcon />
          </button>
          <DeleteModal
            title="Opravdu smazat docházku?"
            question="Bude nevratně smazána docházka i všechna případná související ohodnocení!"
            verification={attendanceDay?.title}
            onDelete={handleAttendanceDelete}
            isOpen={deleteModalVisible}
            onClose={() => setDeleteModalVisible(false)}
          />
        </div>
        <p className="text-gray-600">Detail dne docházky</p>
        <p className="text-gray-600">ID dne: {id}</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'records' && <AttendanceRecordsTab attendanceDayId={id} />}
        {activeTab === 'self-sign' && <SelfSignTab attendanceDayId={id} />}
      </div>
    </div >
  )
}
