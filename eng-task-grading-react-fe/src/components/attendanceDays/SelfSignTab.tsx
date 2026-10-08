import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { attendanceService } from '../../services/attendance-service';
import type { AttendanceDaySelfSignSetDto, AttendanceImportAnalysisResultWithAttendanceValueDto, AttendanceValueDto } from '../../model/attendance-dto';
import { useLogger } from '../../hooks/use-logger';
import { ImportAttendanceWizardFirstModal } from './ImportAttendanceWizardFirstModal';
import { ImportAttendanceWizardSecondModal } from './ImportAttendanceWizardSecondModal';
import { AttendanceValueLabelBlock } from '../../ui/attendanceValueLabelBlock';
import { AttendanceValueLabel } from '../../ui/attendanceValueLabel';
import { useLoadingState } from '../../types/loadingState';
import { Loading } from '../../ui/loading';
import { LoadingError } from '../../ui/loadingError';
import { useToast } from '../../hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useFormatters } from '../../i18n/format';

interface SelfSignTabProps {
  attendanceDayId: number;
}

export function SelfSignTab({ attendanceDayId }: SelfSignTabProps) {
  const navigate = useNavigate();
  const [key, setKey] = useState('');
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const ldgState = useLoadingState();
  const [loadingKey, setLoadingKey] = useState<boolean>(false);
  const [set, setSet] = useState<AttendanceDaySelfSignSetDto | null>(null);
  const [values, setValues] = useState<AttendanceValueDto[]>([]);
  const logger = useLogger("SelfSignTab");
  const [isImportFirstModalOpen, setIsImportFirstModalOpen] = useState(false);
  const [isImportSecondModalOpen, setIsImportSecondModalOpen] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AttendanceImportAnalysisResultWithAttendanceValueDto>();
  const tst = useToast();
  const { t } = useTranslation('attendances');
  const { formatDateTime } = useFormatters();

  const loadDataAsync = async () => {
    try {
      ldgState.setLoading();

      const tmpZ = await attendanceService.getAttendanceValues();
      setValues(tmpZ.sort((a, b) => b.weight - a.weight)); // Seřaď podle weight sestupně

      const tmpA = await attendanceService.getSelfSignSet(attendanceDayId);
      setSet(tmpA);
      setCurrentKey(tmpA?.key || null); // Nastav aktuální klíč z dat

      const dataSet = await attendanceService.getSelfSignSet(attendanceDayId);

      // Seřaď položky podle student.surname vzestupně
      dataSet.selfSigns.sort((a, b) => {
        const surnameA = a.student?.surname || '';
        const surnameB = b.student?.surname || '';
        return surnameA.localeCompare(surnameB, 'cs', { sensitivity: 'base' });
      });

      setSet(dataSet);
      setCurrentKey(dataSet.key);
      ldgState.setDone();
    } catch (error) {
      logger.error('Error loading data:', error);
      ldgState.setError(error);
    }
  }

  useEffect(() => {
    loadDataAsync();
  }, [attendanceDayId]);

  const handleSetKey = async () => {
    if (!key.trim()) {
      tst.error(tst.ERR.SELFSIGN_KEY_EMPTY);
      return;
    }

    setLoadingKey(true);
    try {
      await attendanceService.setDaySelfSignKey(attendanceDayId, key.trim());
      setCurrentKey(key.trim());
      setKey('');
      tst.success(tst.SUC.SELFSIGN_KEY_SET);
      await loadDataAsync();
    } catch (error) {
      logger.error('Error setting key:', error);
      tst.error(error);
    }
    setLoadingKey(false);
  };

  const handleDeleteKey = async () => {
    setLoadingKey(true);
    try {
      await attendanceService.deleteDaySelfSignKey(attendanceDayId);
      setCurrentKey(null);
      tst.success(tst.SUC.SELFSIGN_KEY_DELETED);
      // Znovu načti data po změně
      await loadDataAsync();
    } catch (error) {
      logger.error('Error deleting key:', error);
      tst.error(error);
    }
    setLoadingKey(false);
  };

  const handleShowQR = () => {
    if (currentKey) {
      navigate({
        to: '/attendanceSelfSign/view-info/$id/$key',
        params: {
          id: attendanceDayId.toString(),
          key: currentKey
        }
      });
    }
  };

  const resolveSelfSign = async (selfSignId: number, attendanceValueId: number) => {
    try {
      await attendanceService.resolveDaySelfSign(selfSignId, attendanceValueId);
      tst.success(tst.SUC.SELFSIGN_KEY_RESOLVED);

      // Odstraň vyřízený samo-zápis z kolekce selfSigns
      setSet(prevSet => {
        if (!prevSet) return prevSet;

        return {
          ...prevSet,
          selfSigns: prevSet.selfSigns.filter(selfSign => selfSign.id !== selfSignId)
        };
      });
    } catch (error) {
      logger.error('Error resolving self-sign:', error);
      tst.error(error);
    }
  }

  const handleBulkSign = () => {
    logger.info("Import Request Invoked");
    setIsImportFirstModalOpen(true);
  }

  const handleAnalyzed = async (data: AttendanceImportAnalysisResultWithAttendanceValueDto) => {
    setAnalysisResult(data);
    setIsImportFirstModalOpen(false);
    setIsImportSecondModalOpen(true);
  }

  const handleImported = async () => {
    tst.success(tst.SUC.STUDENTS_IMPORTED);
    await loadDataAsync();
  }

  if (ldgState.loading) { return (<Loading message={t('selfSign.loading')} />); }
  if (ldgState.error) { return (<LoadingError message={ldgState.error} onRetry={loadDataAsync} />); }

  return (
    <div>

      <ImportAttendanceWizardFirstModal
        isOpen={isImportFirstModalOpen}
        attendanceDayId={attendanceDayId}
        onClose={() => setIsImportFirstModalOpen(false)}
        onAnalyzed={handleAnalyzed}
      />
      <ImportAttendanceWizardSecondModal
        isOpen={isImportSecondModalOpen}
        onClose={() => setIsImportSecondModalOpen(false)}
        analysisResult={analysisResult!}
        attendanceDayId={attendanceDayId}
        onImported={handleImported}
      />

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {t('selfSign.bulkTitle')}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            <button
              onClick={handleBulkSign}
              className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
              {t('selfSign.bulkButton')}
            </button>
          </p>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {t('selfSign.title')}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {t('selfSign.subtitle')}
          </p>
        </div>

        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          {/* Správa klíče samo-zápisu */}
          <div className="mb-8">
            <h4 className="text-md font-medium text-gray-900 mb-4">{t('selfSign.keyTitle')}</h4>

            {currentKey ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">{t('selfSign.currentKey')}</p>
                    <p className="text-lg font-mono text-green-900 mt-1">{currentKey}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleShowQR}
                      disabled={loadingKey}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {t('selfSign.showQr')}
                    </button>
                    <button
                      onClick={handleDeleteKey}
                      disabled={loadingKey}
                      className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      {loadingKey ? t('selfSign.deleting') : t('selfSign.deleteKey')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <p className="text-sm text-gray-600 mb-4">{t('selfSign.noKey')}</p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder={t('selfSign.keyPlaceholder')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loadingKey}
                  />
                  <button
                    onClick={handleSetKey}
                    disabled={loadingKey || !key.trim()}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loadingKey ? t('selfSign.setting') : t('selfSign.setKey')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Seznam studentů a jejich samo-zápisů */}
          <div className="border-t border-gray-200 pt-8">
            <h4 className="text-md font-medium text-gray-900 mb-4">{t('selfSign.listTitle')}</h4>

            {set && set.selfSigns && set.selfSigns.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="mb-3 text-sm text-gray-600">
                  {t('selfSign.count', { signed: set.selfSigns.length, verified: set.selfSigns.filter(s => s.verificationDateTime).length })}
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('selfSign.columns.studyNumber')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('selfSign.columns.signTime')}<br />
                        {t('selfSign.columns.ip')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('selfSign.columns.verifyTime')}<br />
                        {t('selfSign.columns.ip')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('selfSign.columns.record')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {set.selfSigns.map((selfSign) => {
                      // Najdi odpovídajícího studenta podle studijního čísla
                      const student = selfSign.student;

                      return (
                        <tr key={selfSign.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {student.number}
                            </div>
                            {student && (
                              <div className="text-sm text-gray-500">
                                {student.name} {student.surname}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDateTime(selfSign.creationDateTime)}
                            <br />
                            {selfSign.ip}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {
                              selfSign.verificationDateTime && (
                                <>
                                  {formatDateTime(selfSign.creationDateTime)}
                                  < br />
                                  {selfSign.ip})
                                </>)
                            }
                          </td>
                          <td className="px-6 py-4">
                            <AttendanceValueLabelBlock>
                              {values.map((value) => {
                                return <AttendanceValueLabel
                                  attendanceValue={value}
                                  isSelected={false}
                                  onClick={() => {
                                    resolveSelfSign(selfSign.id, value.id);
                                  }} />
                              })}
                            </AttendanceValueLabelBlock>
                          </td>
                        </tr>);
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">{t('selfSign.emptyTitle')}</h3>
                <p className="text-gray-500">{t('selfSign.emptyText')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}