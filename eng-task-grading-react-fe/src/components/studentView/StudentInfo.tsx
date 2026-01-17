import { useNavigate } from '@tanstack/react-router';
import { studentViewService } from '../../services/student-view-service';
import { useToast } from '../../hooks/use-toast';

interface StudentInfoProps {
  studentNumber: string | null;
}

export function StudentInfo({ studentNumber }: StudentInfoProps) {
  const navigate = useNavigate();
  const tst = useToast();

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('studentViewRefreshJWT');

      // Call forget API if we have a refresh token
      if (refreshToken) {
        await studentViewService.forget(refreshToken);
      }

      // Clear localStorage
      localStorage.removeItem('studentViewAccessJWT');
      localStorage.removeItem('studentViewRefreshJWT');

      // Show success message
      tst.success(tst.SUC.LOGOUT_SUCCESSFUL);

      // Redirect to login page
      navigate({ to: '/studentView/login' });
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if API call fails, clear localStorage and redirect
      localStorage.removeItem('studentViewAccessJWT');
      localStorage.removeItem('studentViewRefreshJWT');
      tst.success(tst.SUC.LOGOUT_SUCCESSFUL);
      navigate({ to: '/studentView/login' });
    }
  };

  if (!studentNumber) {
    return null;
  }

  return (
    <div className="text-right">
      <div className="mb-3">
        <p className="text-sm text-gray-500">Studijní číslo</p>
        <p className="text-lg font-semibold text-gray-900">{studentNumber}</p>
      </div>
      <button
        onClick={handleLogout}
        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Odhlásit
      </button>
    </div>
  );
}
