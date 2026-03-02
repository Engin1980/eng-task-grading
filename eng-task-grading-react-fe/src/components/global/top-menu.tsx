import { Link, useNavigate } from "@tanstack/react-router";
import { useAuthContext } from "../../contexts/AuthContext";
import { TopMenuNavigation } from "./top-menu-navigation";
import { useToast } from "../../hooks/use-toast";
import { useLogger } from "../../hooks/use-logger";

const TopMenu: React.FC = () => {
  const tst = useToast();
  const { loggedUser, logout } = useAuthContext();
  const navigate = useNavigate();
  const logger = useLogger("TopMenu");

  const handleLogout = async () => {
    try {
      await logout();
      tst.success(tst.SUC.LOGOUT_SUCCESSFUL);
    } catch (err) {
      logger.error("Logout error:", err);
      tst.error(err);
    }
    navigate({ to: "/login" });
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800">Eng Task Grading</h1>
      <div>
        <nav className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-center justify-between pt-2">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <div className="flex items-center">
              {!loggedUser && (
                <>
                  <Link to="/login" className="mr-4 text-blue-600">
                    Přihlášení učitele
                  </Link>
                  <Link to="/studentView/login" className="mr-4 text-blue-600">
                    Přihlášení studenta
                  </Link>
                </>
              )}
              {loggedUser && loggedUser.role == "ROLE_TEACHER" && (
                <>
                  <TopMenuNavigation />
                  <Link to="/admin/logs" className="ml-8 text-blue-600">
                    📝 App-Log
                  </Link>
                  <Link to="/admin/client-logs" className="ml-8 text-blue-600">
                    📝 Client-Log
                  </Link>
                </>
              )}
              {loggedUser && loggedUser.role == "ROLE_STUDENT" && (
                <>
                  <Link
                    to="/studentView/courses"
                    className="mr-4 text-blue-600"
                  >
                    Kurzy
                  </Link>
                  <Link
                    to="/studentView/login-management"
                    className="mr-4 text-blue-600"
                  >
                    Správa přihlášení
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center justify-end sm:ml-auto">
            <div className="px-4 py-2 flex items-center min-w-[180px] justify-end gap-2">
              {loggedUser && (
                <>
                  <span className="text-sm text-gray-700 font-semibold">
                    {loggedUser.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="ml-2 px-2 py-1 text-white rounded hover:bg-gray-300 text-xs cursor-pointer"
                  >
                    🚪
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};

export default TopMenu;
