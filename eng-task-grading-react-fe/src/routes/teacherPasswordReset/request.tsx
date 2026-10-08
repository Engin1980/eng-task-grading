import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useRequestState } from "../../types/requestState";
import { useAuthContext } from "../../contexts/AuthContext";
import { useToast } from "../../hooks/use-toast";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/teacherPasswordReset/request")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation("auth");
  const [email, setEmail] = useState("");
  const reqSubmit = useRequestState();
  const authContext = useAuthContext();
  const tst = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      reqSubmit.setBusy();
      await authContext.requestTeacherPasswordReset(email);
      reqSubmit.setDone();
    } catch (error) {
      reqSubmit.setError(error);
      tst.error(error);
      reqSubmit.setReady();
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
      <div>
        <h2 className="text-3xl font-bold text-center text-gray-900">
          {t("resetRequest.title")}
        </h2>
        {(reqSubmit.ready || reqSubmit.busy) && (
          <p className="mt-2 text-center text-sm text-gray-600">
            {t("resetRequest.prompt")}
          </p>
        )}
      </div>

      {(reqSubmit.ready || reqSubmit.busy) && (
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="sr-only">
              {t("resetRequest.email")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder={t("resetRequest.emailPlaceholder")}
            />
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={reqSubmit.busy}
            >
              {reqSubmit.busy ? t("resetRequest.sending") : t("resetRequest.submit")}
            </button>
          </div>
        </form>
      )}

      {reqSubmit.done && (
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded">
          <p className="text-green-800 text-center">
            {t("resetRequest.sent")}
          </p>
          <p className="text-green-800 text-sm text-center mt-2">
            {t("resetRequest.checkMailbox")}
          </p>
        </div>
      )}
    </div>
  );
}
