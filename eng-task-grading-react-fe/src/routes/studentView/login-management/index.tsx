import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { StudentInfo } from "../../../components/studentView";
import { studentViewService } from "../../../services/student-view-service";
import { useEffect, useState } from "react";
import type { StudentTokenInfoDto } from "../../../model/student-view-dto";
import { useLoadingState } from "../../../types/loadingState";
import { useAuthContext } from "../../../contexts/AuthContext";
import { useToast } from "../../../hooks/use-toast";
import { useLogger } from "../../../hooks/use-logger";

export const Route = createFileRoute("/studentView/login-management/")({
  component: RouteComponent,
});

// Helper function to extract sub from JWT token
function getStudentNumberFromJWT(): string | null {
  try {
    const token = localStorage.getItem("studentViewAccessJWT");
    if (!token) return null;

    // Decode JWT payload (base64url decode)
    const payload = token.split(".")[1];
    if (!payload) return null;

    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload.sub || null;
  } catch (error) {
    //TODO silent error, is it ok?
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
  const logger = useLogger("/studentView/login-management/index.tsx");

  useEffect(() => {
    const tmp = async () => {
      try {
        const fetchedTokens = await studentViewService.getActiveTokens();
        setTokens(fetchedTokens);
        lds.setDone();
      } catch (error) {
        logger.error("Error fetching tokens:", error);
        lds.setError("Chyba při načítání tokenů.");
        tst.error(error);
      }
    };
    tmp();
  }, []);

  const revokeAllTokens = async () => {
    try {
      await studentViewService.deleteTokens();
      await authContext.logout();
      setTokens([]);
      localStorage.removeItem("studentViewAccessJWT");
      lds.setDone();
      tst.success(tst.SUC.ALL_LOGINS_REVOKED);
      navigate({ to: "/studentView/login" });
    } catch (error) {
      logger.error("Error deleting tokens:", error);
      lds.setError("Chyba při zneplatňování tokenů.");
      tst.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm">
          {/* ================= HEADER ================= */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Správa přihlášených zařízení
                </h1>
                <p className="text-gray-600 mt-1">
                  Správa vašich přihlášených zařízení k prohlížení
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <button
                  className="w-full sm:w-auto px-4 py-2 border border-red-600 bg-white text-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium transition-colors"
                  onClick={revokeAllTokens}
                >
                  Zneplatnit všechna přihlášení
                </button>
                <StudentInfo studentNumber={studentNumber} />
              </div>
            </div>
          </div>

          {/* ================= CONTENT ================= */}
          <div className="p-6">
            {lds.loading && (
              <div className="text-center text-gray-500">
                Načítání aktivních tokenů...
              </div>
            )}

            {lds.error && (
              <div className="text-center text-red-500">{lds.error}</div>
            )}

            {/* ================= TOKENS ================= */}
            {lds.done && tokens.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tokens.map((token) => (
                  <div
                    key={token.id}
                    className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="text-sm font-medium text-gray-900 mb-3">
                      Přístupový token hodnocení
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          Vytvořeno
                        </div>
                        <div className="text-gray-900">
                          {new Date(token.createdAt).toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-gray-500 uppercase tracking-wide">
                          Platné do
                        </div>
                        <div className="text-gray-900">
                          {new Date(token.expiresAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {lds.done && tokens.length === 0 && (
              <div className="text-center text-gray-500">
                Žádné tokeny nebyly nalezeny.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
