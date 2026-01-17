import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { StudentInfo } from '../../../components/studentView'
import { studentViewService } from '../../../services/student-view-service';
import { useEffect, useState } from 'react';
import type { StudentTokenInfoDto } from '../../../model/student-view-dto';
import { useLoadingState } from '../../../types/loadingState';
import { useAuthContext } from '../../../contexts/AuthContext';
import { useToast } from '../../../hooks/use-toast';

export const Route = createFileRoute('/studentView/login-management/')({
  component: RouteComponent,
})

// Helper function to extract sub from JWT token
function getStudentNumberFromJWT(): string | null {
  try {
    const token = localStorage.getItem('studentViewAccessJWT');
    console.log('JWT Student Token:', token);
    if (!token) return null;

    // Decode JWT payload (base64url decode)
    const payload = token.split('.')[1];
    if (!payload) return null;

    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload.sub || null;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

function RouteComponent() {
  const studentNumber = getStudentNumberFromJWT();
  const [tokens, setTokens] = useState<StudentTokenInfoDto[]>([]);
  const lds = useLoadingState();
  const navigate = useNavigate();
  const authContext = useAuthContext();
  const tst = useToast();

  useEffect(() => {
    const tmp = async () => {
      try {
        const fetchedTokens = await studentViewService.getActiveTokens();
        setTokens(fetchedTokens);
        lds.setDone();
      } catch (error) {
        console.error('Error fetching tokens:', error);
        lds.setError('Chyba při načítání tokenů.');
      }
    };
    tmp();
  }, []);

  const revokeAllTokens = async () => {
    try {
      await studentViewService.deleteTokens();
      await authContext.logout();
      setTokens([]);
      localStorage.removeItem('studentViewAccessJWT');
      lds.setDone();
      tst.success(tst.SUC.ALL_LOGINS_REVOKED);
      navigate({ to: '/studentView/login' });
    } catch (error) {
      console.error('Error deleting tokens:', error);
      lds.setError('Chyba při zneplatňování tokenů.');
      tst.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Správa přihlášených zařízení</h1>
                <p className="text-gray-600 mt-1">Správa vašich přihlášených zařízení k prohlížení</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className="px-4 py-2 border border-red-600 bg-white text-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
                  onClick={revokeAllTokens}
                >
                  Zneplatnit všechna přihlášení
                </button>
                <StudentInfo studentNumber={studentNumber} />
              </div>
            </div>
          </div>
          <div className="p-6">
            {lds.loading && (
              <div className="text-center text-gray-500">
                <p>Načítání aktivních tokenů...</p>
              </div>
            )}
            {lds.error && (
              <div className="text-center text-red-500">
                <p>{lds.error}</p>
              </div>
            )}
            {lds.done && tokens.length > 0 && (
              <div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vytvořeno</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platné do</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tokens.map((token) => (
                      <tr key={token.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Přístupový token hodnocení</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(token.createdAt).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(token.expiresAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {lds.done && tokens.length === 0 && (
              <div className="text-center text-gray-500">
                <p>Žádné tokeny nebyly nalezeny.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
