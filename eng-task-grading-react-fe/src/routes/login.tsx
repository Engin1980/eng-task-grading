import { createFileRoute } from "@tanstack/react-router";
import { useLogger } from "../hooks/use-logger";
import { useNavigate } from "@tanstack/react-router";
import { Turnstile } from "../components/turnstille";
import AppSettings from "../config/app-settings";
import { useCallback, useEffect, useState } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import type { TeacherLoginDto } from "../model/teacher-dto";
import { useToast } from "../hooks/use-toast";
import { Trans, useTranslation } from "react-i18next";

export const Route = createFileRoute("/login")({
  component: Login,
});

function Login() {
  const { t } = useTranslation("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const logger = useLogger("Login");
  const navigate = useNavigate();
  const { loginTeacher } = useAuthContext();
  // Optional next page from query string (?nextPage=/some/path)
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const rawNextPage = searchParams.get("nextPage") || undefined;
  const nextPage = rawNextPage ? decodeURIComponent(rawNextPage) : undefined;
  const tst = useToast();

  // Cloudflare konfigurace z AppSettings
  const isCloudflareEnabled = AppSettings.cloudflare.enabled;
  const TURNSTILE_SITE_KEY = AppSettings.cloudflare.siteKey;

  useEffect(() => {
    if (import.meta.env.DEV) {
      logger.debug("Lokální vývoj; Předvyplňuji přihlašovací údaje");
      setEmail("marek.vajgl@osu.cz");
      setPassword("Bublinka#1");
    }
    if (isCloudflareEnabled && !TURNSTILE_SITE_KEY) {
      logger.error(
        "Chyba: VITE_CLOUDFLARE_SITE_KEY není nastaven v .env.local",
      );
    }
  }, [isCloudflareEnabled, TURNSTILE_SITE_KEY]);

  // Stabilní callback pro captcha aby se neměnil při každém re-renderu
  const handleCaptchaVerify = useCallback((token: string) => {
    setCaptchaToken(token);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    logger.debug("Pokus o přihlášení", { email });

    // Kontrola captcha pouze pokud je Cloudflare enabled
    if (isCloudflareEnabled && !captchaToken) {
      tst.warning(tst.WRN.CAPTCHA_COMPLETION_NEEDED);
      return;
    }

    const data: TeacherLoginDto = {
      email: email,
      password: password,
      rememberMe: rememberMe,
      captchaToken: isCloudflareEnabled ? captchaToken || undefined : undefined,
    };

    try {
      await loginTeacher(data);
      tst.success(tst.SUC.LOGIN_SUCCESSFUL);
      // If nextPage provided and appears to be a safe internal path, redirect there.
      if (nextPage && nextPage.startsWith("/")) {
        navigate({ to: nextPage });
      } else {
        navigate({ to: "/courses" });
      }
    } catch (ex) {
      logger.error("Přihlášení selhalo", { email, error: ex });
      tst.error(ex);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">
        {t("login.title")}
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor="email"
          >
            {t("login.email")}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t("login.emailPlaceholder")}
            required
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-gray-700 mb-2"
            htmlFor="password"
          >
            {t("login.password")}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
            required
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            id="remember"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label
            className="text-sm font-medium text-gray-700"
            htmlFor="remember"
          >
            {t("login.rememberMe")}
          </label>
        </div>

        {/* Turnstile Captcha */}
        {isCloudflareEnabled && (
          <div>
            {TURNSTILE_SITE_KEY ? (
              <Turnstile
                siteKey={TURNSTILE_SITE_KEY}
                onVerify={handleCaptchaVerify}
              />
            ) : (
              <div className="text-red-600 text-sm text-center py-4">
                {t("login.siteKeyMissing")}
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {t("login.submit")}
        </button>
      </form>
      <p className="text-center text-gray-500 text-sm mt-4">
        <Trans
          t={t}
          i18nKey="login.noAccount"
          components={{ a: <a href="/register" className="text-blue-500 hover:underline" /> }}
        />
      </p>
      <p className="text-center text-gray-500 text-sm mt-1">
        <Trans
          t={t}
          i18nKey="login.forgotPassword"
          components={{ a: <a href="/teacherPasswordReset/request" className="text-blue-500 hover:underline" /> }}
        />
      </p>
      <p className="text-center text-gray-500 text-sm mt-1">
        <Trans
          t={t}
          i18nKey="login.isStudent"
          components={{ a: <a href="/studentView/login" className="text-blue-500 hover:underline" /> }}
        />
      </p>
    </div>
  );
}
