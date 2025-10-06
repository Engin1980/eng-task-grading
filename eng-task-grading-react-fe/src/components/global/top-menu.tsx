import { Link } from '@tanstack/react-router';
import { useAuthContext } from '../../contexts/AuthContext';
import { TopMenuNavigation } from './top-menu-navigation';

const TopMenu: React.FC = () => {
  const { loggedUser, logout } = useAuthContext();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login'; // Redirect to login page after logout
  }

  return (
    <>
      <div className='p-4 bg-gray-100'>
        <h1 className="text-3xl font-bold text-gray-800">Eng Task Grading</h1>
        <div>
          <nav className="flex items-center justify-between pt-2">
            <div className="flex flex-col justify-center">
              <div className="flex items-center">
                {!loggedUser && (
                  <>
                    <Link to="/login" className="mr-4 text-blue-600">Přihlášení učitele</Link>
                    <Link to="/studentView/login" className="mr-4 text-blue-600">Přihlášení studenta</Link>
                  </>
                )}
                {loggedUser && loggedUser.role == "ROLE_TEACHER" && (<>                  
                  <TopMenuNavigation />
                  <Link to="/logs" className="ml-8 text-blue-600">📝 App-Log</Link>
                </>)}
                {loggedUser && loggedUser.role == "ROLE_STUDENT" && (<>
                  <Link to="/studentView/courses" className="mr-4 text-blue-600">Kurzy</Link>
                </>)}
              </div>
            </div>
            <div className="flex items-center ml-auto h-full">
              <div className="px-4 py-2 flex items-center min-w-[180px] justify-end gap-2">
                {loggedUser && (
                  <>
                    <span className="text-sm text-gray-700 font-semibold">{loggedUser.email}</span>
                    <button
                      onClick={handleLogout}
                      className="ml-2 px-2 py-1 text-white rounded hover:bg-gray-300 text-xs cursor-pointer"
                    >🚪</button>
                  </>
                )}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}

export default TopMenu;